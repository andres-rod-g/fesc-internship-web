import React, { useState, useEffect } from "react";
import { Plus, AlertCircle, CheckCircle, Loader2, Eye, Edit2, Trash2, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import ModalCrearGrupo from "./ModalCrearGrupo";
import ModalEditarGrupo from "./ModalEditarGrupo";

export default function GestorGrupos() {
  const [grupos, setGrupos] = useState([]);
  const [gruposOriginales, setGruposOriginales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState(null);
  const [docentes, setDocentes] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [sortBy, setSortBy] = useState("nombre_asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Efecto de búsqueda con debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim() === "") {
        setGrupos(gruposOriginales);
        setSearchLoading(false);
      } else {
        realizarBusqueda(searchTerm);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timer);
  }, [searchTerm, gruposOriginales]);

  const realizarBusqueda = async (termino) => {
    setSearchLoading(true);
    setCurrentPage(1); // Reiniciar a la primera página
    try {
      const res = await fetch("/api/grupos/buscar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busqueda: termino })
      });

      if (res.ok) {
        const data = await res.json();
        setGrupos(data.grupos || []);
      } else {
        setGrupos(gruposOriginales);
      }
    } catch (err) {
      console.error("Error en búsqueda:", err);
      setGrupos(gruposOriginales);
    } finally {
      setSearchLoading(false);
    }
  };

  const aplicarSorting = (listaGrupos) => {
    const gruposOrdenados = [...listaGrupos];

    switch (sortBy) {
      case "nombre_asc":
        gruposOrdenados.sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
        break;
      case "nombre_desc":
        gruposOrdenados.sort((a, b) => (b.nombre || "").localeCompare(a.nombre || ""));
        break;
      case "estudiantes_asc":
        gruposOrdenados.sort((a, b) => (a.estudiantes?.length || 0) - (b.estudiantes?.length || 0));
        break;
      case "estudiantes_desc":
        gruposOrdenados.sort((a, b) => (b.estudiantes?.length || 0) - (a.estudiantes?.length || 0));
        break;
      case "docentes_asc":
        gruposOrdenados.sort((a, b) => (a.docentes?.length || 0) - (b.docentes?.length || 0));
        break;
      case "docentes_desc":
        gruposOrdenados.sort((a, b) => (b.docentes?.length || 0) - (a.docentes?.length || 0));
        break;
      case "reciente":
        gruposOrdenados.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    return gruposOrdenados;
  };

  const cargarDatos = async () => {
    setLoading(true);
    setError("");

    try {
      // Cargar grupos
      const resGrupos = await fetch("/api/grupos/listar");
      if (!resGrupos.ok) throw new Error("Error al cargar grupos");
      const datosGrupos = await resGrupos.json();
      const gruposList = datosGrupos.grupos || [];
      setGrupos(gruposList);
      setGruposOriginales(gruposList);

      // Cargar docentes
      const resDocentes = await fetch("/api/usuarios/listar?rol=profesor");
      if (resDocentes.ok) {
        const datosDocentes = await resDocentes.json();
        setDocentes(datosDocentes.usuarios || []);
      }

      // Cargar estudiantes
      const resEstudiantes = await fetch("/api/usuarios/listar?rol=estudiante");
      if (resEstudiantes.ok) {
        const datosEstudiantes = await resEstudiantes.json();
        setEstudiantes(datosEstudiantes.usuarios || []);
      }
    } catch (err) {
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleGrupoCreado = (nuevoGrupo) => {
    setGrupos([nuevoGrupo, ...grupos]);
    setSuccess("Grupo creado exitosamente");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleGrupoActualizado = (grupoActualizado) => {
    setGrupos(grupos.map(g => g._id === grupoActualizado._id ? grupoActualizado : g));
    setGruposOriginales(gruposOriginales.map(g => g._id === grupoActualizado._id ? grupoActualizado : g));
    setSuccess("Grupo actualizado exitosamente");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleEditarGrupo = (grupo) => {
    setGrupoEditando(grupo);
    setShowEditModal(true);
  };

  const handleEliminarGrupo = async (grupoId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este grupo?")) return;

    try {
      const res = await fetch(`/api/grupos/${grupoId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setGrupos(grupos.filter(g => g._id !== grupoId));
        setSuccess("Grupo eliminado exitosamente");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Error al eliminar el grupo");
      }
    } catch (err) {
      setError("Error de conexión");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="space-y-4 mb-6">
        <div className="flex gap-4">
          {/* Buscador */}
          <div className="flex-1 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre del grupo o docente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                </div>
              )}
            </div>
          </div>

          {/* Botón crear */}
          <button
            onClick={() => setShowModal(true)}
            className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Crear Grupo
          </button>
        </div>

        {/* Sorting dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-select" className="text-sm font-medium text-gray-700">Ordenar por:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
          >
            <option value="nombre_asc">Nombre (A-Z)</option>
            <option value="nombre_desc">Nombre (Z-A)</option>
            <option value="estudiantes_asc">Estudiantes (Menor a Mayor)</option>
            <option value="estudiantes_desc">Estudiantes (Mayor a Menor)</option>
            <option value="docentes_asc">Docentes (Menor a Mayor)</option>
            <option value="docentes_desc">Docentes (Mayor a Menor)</option>
            <option value="reciente">Más Recientes</option>
          </select>
        </div>
      </div>

      {/* Tabla de grupos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {grupos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No hay grupos creados aún</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre del Grupo</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Docentes</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estudiantes</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Semestre</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Observaciones</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(() => {
                    const gruposSorted = aplicarSorting(grupos);
                    const totalPages = Math.ceil(gruposSorted.length / itemsPerPage);
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const gruposPaginados = gruposSorted.slice(startIndex, startIndex + itemsPerPage);

                    return gruposPaginados.map((grupo) => (
                      <tr key={grupo._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-900">{grupo.nombre}</p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {grupo.docentes && grupo.docentes.length > 0 ? (
                              grupo.docentes.map(docenteId => (
                                <span key={docenteId} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {docentes.find(d => d._id === docenteId)?.username || "ID"}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500 text-sm">Sin asignar</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {grupo.estudiantes && grupo.estudiantes.length > 0 ? (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                {grupo.estudiantes.length} estudiantes
                              </span>
                            ) : (
                              <span className="text-gray-500 text-sm">Sin asignar</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {grupo.semestre ? (
                            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full font-medium">
                              {grupo.semestre}
                            </span>
                          ) : (
                            <span className="text-gray-500 text-sm">Sin semestre</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-gray-700 text-sm max-w-xs truncate">
                            {grupo.observaciones || "-"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <a
                              href={`/admin/grupos/${grupo._id}`}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                            >
                              <Eye className="w-4 h-4" />
                              Ver
                            </a>
                            <button
                              onClick={() => handleEditarGrupo(grupo)}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition-colors text-sm font-medium"
                            >
                              <Edit2 className="w-4 h-4" />
                              Editar
                            </button>
                            <button
                              onClick={() => handleEliminarGrupo(grupo._id)}
                              className="inline-flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                            >
                              <Trash2 className="w-4 h-4" />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {(() => {
              const gruposSorted = aplicarSorting(grupos);
              const totalPages = Math.ceil(gruposSorted.length / itemsPerPage);

              return (
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Página <span className="font-medium">{currentPage}</span> de <span className="font-medium">{Math.max(1, totalPages)}</span> ({gruposSorted.length} grupos)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Página anterior"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Siguiente página"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })()}
          </>
        )}
      </div>

      {/* Modal para crear grupo */}
      <ModalCrearGrupo
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onGrupoCreado={handleGrupoCreado}
        docentes={docentes}
        estudiantes={estudiantes}
      />

      {/* Modal para editar grupo */}
      <ModalEditarGrupo
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setGrupoEditando(null);
        }}
        onGrupoActualizado={handleGrupoActualizado}
        grupo={grupoEditando}
        docentes={docentes}
        estudiantes={estudiantes}
      />
    </div>
  );
}
