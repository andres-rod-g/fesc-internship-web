import React, { useState, useCallback, useEffect } from "react";
import { Search, Filter, ArrowUpDown, CheckCircle, ExternalLink } from "lucide-react";

export default function ValidacionFirmasContent({ initialRecursos = [] }) {
  const [recursos, setRecursos] = useState(initialRecursos);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSort, setSelectedSort] = useState("createdAt_desc");
  const [isLoading, setIsLoading] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecursos();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedType, selectedSort]);

  const fetchRecursos = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType) params.append('type', selectedType);
      params.append('sort', selectedSort);

      const res = await fetch(`/api/recursos-practicas/buscar?${params}`);
      if (res.ok) {
        let data = await res.json();
        let recursos = data.recursos || [];

        // Client-side search filtering for name and email
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          recursos = recursos.filter((recurso) => {
            const nombre = `${recurso.usuario?.nombres || ''} ${recurso.usuario?.apellidos || ''}`.toLowerCase();
            const correo = (recurso.usuario?.correo_institucional || recurso.usuario?.email || '').toLowerCase();
            const url = (recurso.url || '').toLowerCase();
            const titulo = (recurso.titulo || '').toLowerCase();

            return (
              nombre.includes(searchLower) ||
              correo.includes(searchLower) ||
              url.includes(searchLower) ||
              titulo.includes(searchLower)
            );
          });
        }

        setRecursos(recursos);
      } else {
        console.error('Error fetching recursos');
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const resourceTypes = [
    { value: "", label: "Todos los tipos" },
    { value: "arl", label: "ARL" },
    { value: "atlas", label: "ATLAS" },
    { value: "seguimiento", label: "Seguimiento" },
    { value: "evaluacion", label: "Evaluación" },
    { value: "autoevaluacion", label: "Autoevaluación" },
    { value: "certificado", label: "Certificado" },
    { value: "anexo", label: "Anexo" }
  ];

  const sortOptions = [
    { value: "createdAt_desc", label: "Más recientes primero" },
    { value: "createdAt_asc", label: "Más antiguos primero" },
    { value: "updatedAt_desc", label: "Modificados recientemente" },
    { value: "updatedAt_asc", label: "Modificados hace tiempo" }
  ];

  // Determine chip color based on resource type
  const getChipColor = (tipo, subtipo) => {
    if (tipo === 'arl') return { bg: 'bg-red-100', text: 'text-red-800' };
    if (tipo === 'atlas') {
      if (subtipo === 'autorizacionDocente') return { bg: 'bg-blue-100', text: 'text-blue-800' };
      if (subtipo === 'autorizacionEstudiante') return { bg: 'bg-purple-100', text: 'text-purple-800' };
      if (subtipo === 'relacionTrabos') return { bg: 'bg-orange-100', text: 'text-orange-800' };
      return { bg: 'bg-blue-100', text: 'text-blue-800' };
    }
    if (tipo === 'seguimiento') return { bg: 'bg-green-100', text: 'text-green-800' };
    return { bg: 'bg-gray-100', text: 'text-gray-800' };
  };

  // Format subtipo display name
  const formatSubtipo = (subtipo) => {
    if (subtipo === 'relacionTrabos') return 'Relación de Trabajos';
    if (subtipo === 'autorizacionDocente') return 'Autorización Docente';
    if (subtipo === 'autorizacionEstudiante') return 'Autorización Estudiante';
    return subtipo;
  };

  const handleVerificar = async (recursoId) => {
    if (confirm('¿Estás seguro de que deseas verificar este recurso?')) {
      try {
        const res = await fetch('/api/recursos-practicas/verificar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recursoId })
        });

        if (res.ok) {
          // Remove from list
          setRecursos(recursos.filter(r => r._id !== recursoId));
        } else {
          alert('Error al verificar el recurso');
        }
      } catch (err) {
        console.error('Error:', err);
        alert('Error de conexión');
      }
    }
  };

  return (
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">
              Validación de Firmas
            </h1>
            <p class="text-gray-600 mt-1">
              Revisa y verifica los recursos de seguimiento de prácticas
            </p>
          </div>
          <span class="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold">
            {recursos.length} pendientes
          </span>
        </div>
      </div>

      {/* Filters */}
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div class="relative">
            <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, correo, estudiante..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            {isLoading && (
              <span class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg class="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
            )}
          </div>

          {/* Filter by Type */}
          <div class="relative">
            <Filter class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              {resourceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div class="relative">
            <ArrowUpDown class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {recursos.length === 0 ? (
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">
            Todos los recursos están verificados
          </h3>
          <p class="text-gray-600">No hay recursos pendientes de validación</p>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recursos.map((recurso) => {
            const chipColor = getChipColor(recurso.tipo, recurso.subtipo);

            return (
              <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col">
                <div class="mb-3 flex items-center justify-between gap-2">
                  <span class={`text-xs font-semibold px-2 py-1 rounded-full ${chipColor.bg} ${chipColor.text} capitalize whitespace-nowrap`}>
                    {recurso.tipo}
                    {recurso.subtipo && <span> - {formatSubtipo(recurso.subtipo)}</span>}
                  </span>
                </div>

                <div class="flex-1">
                  {/* Información del estudiante */}
                  <div class="mb-4">
                    <h3 class="text-sm font-semibold text-gray-800 mb-3">
                      Estudiante
                    </h3>
                    {recurso.usuario ? (
                      <div class="space-y-2 text-xs">
                        <div>
                          <p class="text-gray-600 font-medium">Nombre</p>
                          {recurso.practicanteId ? (
                            <a
                              href={`/admin/practicantes/${recurso.practicanteId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              class="text-blue-600 hover:text-blue-800 hover:underline truncate inline-flex items-center gap-1"
                            >
                              <span class="truncate">
                                {recurso.usuario.nombres || recurso.usuario.name}{" "}
                                {recurso.usuario.apellidos || ""}
                              </span>
                              <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          ) : (
                            <p class="text-gray-900 truncate">
                              {recurso.usuario.nombres || recurso.usuario.name}{" "}
                              {recurso.usuario.apellidos || ""}
                            </p>
                          )}
                        </div>
                        <div>
                          <p class="text-gray-600 font-medium">Correo</p>
                          <p class="text-gray-900 truncate text-xs">
                            {recurso.usuario.correo_institucional || recurso.usuario.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p class="text-gray-500 text-xs">
                        No encontrado
                      </p>
                    )}
                  </div>

                  {/* Información del recurso */}
                  <div class="border-t border-gray-200 pt-4">
                    <h3 class="text-sm font-semibold text-gray-800 mb-3">
                      Recurso
                    </h3>
                    <div class="space-y-2 text-xs">
                      {recurso.titulo && (
                        <div>
                          <p class="text-gray-600 font-medium">Título</p>
                          <p class="text-gray-900 break-words">{recurso.titulo}</p>
                        </div>
                      )}

                      {recurso.grupo && (
                        <div>
                          <p class="text-gray-600 font-medium">Grupo</p>
                          <a
                            href={`/admin/grupos/${recurso.grupo._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                          >
                            <span>{recurso.grupo.nombre}</span>
                            <svg class="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}

                      {recurso.url ? (
                        <div>
                          <p class="text-gray-600 font-medium">Enlace</p>
                          <a
                            href={recurso.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            class="text-blue-600 hover:text-blue-800 break-all inline-flex items-center gap-1 text-xs"
                          >
                            Ver enlace
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      ) : (
                        <div>
                          <p class="text-red-600 text-xs">Sin enlace</p>
                        </div>
                      )}

                      {recurso.nota && (
                        <div>
                          <p class="text-gray-600 font-medium">Calificación</p>
                          <p class="text-gray-900">{recurso.nota}/5</p>
                        </div>
                      )}

                      <div>
                        <p class="text-gray-600 font-medium">Creado</p>
                        <p class="text-gray-900">
                          {new Date(recurso.createdAt).toLocaleDateString(
                            "es-ES"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acción de verificación */}
                <button
                  onClick={() => handleVerificar(recurso._id)}
                  class="mt-4 w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Verificar
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
