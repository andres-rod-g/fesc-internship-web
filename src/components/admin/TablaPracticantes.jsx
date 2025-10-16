import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const TablaPracticantes = forwardRef(function TablaPracticantes({ practicantes = [] }, ref) {
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc"); // 'asc' or 'desc'
  const [sortedData, setSortedData] = useState([]);
  const [data, setData] = useState(practicantes);

  // Expose setData method to parent
  useImperativeHandle(ref, () => ({
    setData: (newData) => {
      setData(newData);
    }
  }));

  // Format date helper
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Get color classes for estado_laboral
  const getEstadoLaboralColor = (estado) => {
    const colors = {
      "seeking_internship": "bg-blue-100 text-blue-800",
      "working": "bg-green-100 text-green-800",
      "entrepreneur": "bg-purple-100 text-purple-800"
    };
    return colors[estado] || "bg-gray-100 text-gray-800";
  };

  const getEstadoLaboralLabel = (estado) => {
    const labels = {
      "seeking_internship": "Busca prácticas",
      "working": "Trabaja",
      "entrepreneur": "Emprendedor"
    };
    return labels[estado] || "No especificado";
  };

  // Sort data whenever data, sortField, or sortDirection changes
  useEffect(() => {
    if (!data || data.length === 0) {
      setSortedData([]);
      return;
    }

    const sorted = [...data].sort((a, b) => {
      let valueA = a[sortField] || "";
      let valueB = b[sortField] || "";

      // Handle dates
      if (sortField === "createdAt") {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      } else if (typeof valueA === "string") {
        valueA = valueA.toLowerCase();
        valueB = valueB.toLowerCase();
      }

      if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
      if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setSortedData(sorted);
  }, [data, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Change field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ?
      <ChevronUp className="w-4 h-4 inline ml-1" /> :
      <ChevronDown className="w-4 h-4 inline ml-1" />;
  };

  if (!sortedData || sortedData.length === 0) {
    return (
      <div className="p-8 text-center">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
        </svg>
        <h3 className="text-lg font-medium text-gray-800 mb-2">No hay resultados</h3>
        <p className="text-gray-600">Intenta con otros filtros o búsqueda</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("nombres")}
            >
              Practicante <SortIcon field="nombres" />
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("correo_institucional")}
            >
              Correo <SortIcon field="correo_institucional" />
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("numero_documento")}
            >
              Cédula <SortIcon field="numero_documento" />
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("estado_laboral")}
            >
              Estado Laboral <SortIcon field="estado_laboral" />
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => handleSort("createdAt")}
            >
              Fecha Creación <SortIcon field="createdAt" />
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Gestión
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedData.map((p) => (
            <tr key={p._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-left">
                <div className="flex items-center gap-3">
                  <img
                    src={p.foto_url || `/api/practicantes/${p._id}/foto`}
                    alt={`${p.nombres} ${p.apellidos}`}
                    className="w-10 h-10 rounded-full object-cover bg-gray-200"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{p.nombres} {p.apellidos}</div>
                    <div className="text-xs text-gray-500">{p.programa || "No especificado"}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">{p.correo_institucional || "-"}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">{p.numero_documento || "-"}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 inline-flex text-xs font-semibold rounded-full ${getEstadoLaboralColor(p.estado_laboral)}`}>
                  {getEstadoLaboralLabel(p.estado_laboral)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-600">{formatDate(p.createdAt)}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  {p.estado_preinscripcion === "estudiante_creado" ? (
                    <>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full w-fit">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Pago ✓
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full w-fit">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Usuario ✓
                      </span>
                    </>
                  ) : p.estado_preinscripcion === "pago_validado" ? (
                    <>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full w-fit">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Pago ✓
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs font-semibold rounded-full w-fit">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Usuario pendiente
                      </span>
                    </>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full w-fit">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      Pago no validado
                    </span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <a href={`/admin/practicantes/${p._id}`} className="text-accent hover:text-red-700 font-medium">
                  Ver detalles
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default TablaPracticantes;
