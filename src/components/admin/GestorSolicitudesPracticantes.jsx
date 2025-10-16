import React, { useState, useEffect } from "react";
import { AlertCircle, Loader2, Filter } from "lucide-react";

export default function GestorSolicitudesPracticantes() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchSolicitudes();
  }, [selectedEstado, currentPage]);

  const fetchSolicitudes = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (selectedEstado) params.append("estado", selectedEstado);
      params.append("page", currentPage);

      const res = await fetch(`/api/solicitudes-practicantes/listar?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSolicitudes(data.solicitudes);
        setPagination(data.pagination);
      } else {
        const data = await res.json();
        setError(data.error || "Error al cargar solicitudes");
      }
    } catch (err) {
      setError("Error de conexión al servidor");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente_revision: "bg-yellow-100 text-yellow-800",
      en_revision: "bg-blue-100 text-blue-800",
      aprobada: "bg-green-100 text-green-800",
      rechazada: "bg-red-100 text-red-800"
    };
    const labels = {
      pendiente_revision: "Pendiente Revisión",
      en_revision: "En Revisión",
      aprobada: "Aprobada",
      rechazada: "Rechazada"
    };
    return {
      className: badges[estado] || "bg-gray-100 text-gray-800",
      label: labels[estado] || estado
    };
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
        <p className="text-gray-600 mt-2">Cargando solicitudes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Filter className="w-4 h-4 inline mr-2" />
              Estado
            </label>
            <select
              value={selectedEstado}
              onChange={(e) => {
                setSelectedEstado(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
            >
              <option value="">Todos</option>
              <option value="pendiente_revision">Pendiente Revisión</option>
              <option value="en_revision">En Revisión</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Tabla */}
      {solicitudes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <p className="text-gray-500">No hay solicitudes para mostrar</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Practicantes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {solicitudes.map((solicitud) => {
                  const badge = getEstadoBadge(solicitud.estado);
                  return (
                    <tr key={solicitud._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {solicitud.nombre_empresa}
                        </div>
                        <div className="text-xs text-gray-500">{solicitud.nit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {solicitud.nombre_responsable}
                        </div>
                        <div className="text-xs text-gray-500">
                          {solicitud.correo_responsable}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {solicitud.solicitudes_practicantes.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${badge.className}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(solicitud.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a
                          href={`/admin/solicitudes-practicantes/${solicitud._id}`}
                          className="text-accent hover:text-red-700 font-medium transition-colors"
                        >
                          Ver detalles
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Total: <span className="font-semibold">{pagination.total}</span> solicitudes
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm"
            >
              Anterior
            </button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  currentPage === page
                    ? "bg-accent text-white"
                    : "border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 text-sm"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
