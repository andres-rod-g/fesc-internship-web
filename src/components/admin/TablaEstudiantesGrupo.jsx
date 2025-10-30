import React, { useState, useEffect, useRef } from "react";
import { Eye, Loader2 } from "lucide-react";
import BuscadorEstudiantesGrupo from "./BuscadorEstudiantesGrupo";
import TablaGenerica from "./TablaGenerica";

export default function TablaEstudiantesGrupo({
  estudiantes = [],
  grupoId = null,
  buscarEnBaseDatos = false,
  debounceDelay = 300
}) {
  const [filteredEstudiantes, setFilteredEstudiantes] = useState(estudiantes);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [procesandoEstudiante, setProcesandoEstudiante] = useState(null);
  const debounceTimerRef = useRef(null);

  // Búsqueda local
  const performLocalSearch = (query) => {
    if (query.trim() === "") {
      setFilteredEstudiantes(estudiantes);
    } else {
      const filtered = estudiantes.filter(
        (est) =>
          est.nombres.toLowerCase().includes(query.toLowerCase()) ||
          est.apellidos.toLowerCase().includes(query.toLowerCase()) ||
          est.username.toLowerCase().includes(query.toLowerCase()) ||
          (est.email && est.email.toLowerCase().includes(query.toLowerCase()))
      );
      setFilteredEstudiantes(filtered);
    }
  };

  // Búsqueda en base de datos
  const performDatabaseSearch = async (query) => {
    if (!grupoId) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.append("search", query);

      const response = await fetch(`/api/grupos/${grupoId}/estudiantes?${params}`);
      if (response.ok) {
        const data = await response.json();
        setFilteredEstudiantes(data.estudiantes || []);
      }
    } catch (error) {
      console.error("Error al buscar estudiantes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Efecto para búsqueda local
  useEffect(() => {
    if (!buscarEnBaseDatos) {
      performLocalSearch(search);
    }
  }, [estudiantes]);

  // Efecto para búsqueda en base de datos con debounce
  useEffect(() => {
    if (!buscarEnBaseDatos) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      performDatabaseSearch(search);
    }, debounceDelay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search, buscarEnBaseDatos, grupoId, debounceDelay]);

  const handleSearch = (value) => {
    setSearch(value);
    if (!buscarEnBaseDatos) {
      performLocalSearch(value);
    }
  };

  const handleVerProceso = async (estudiante) => {
    if (!grupoId) return;

    setProcesandoEstudiante(estudiante._id);

    try {
      // Primero verificar si existe un proceso
      const checkResponse = await fetch(
        `/api/proceso-practicas/buscar?estudianteId=${estudiante._id}&grupoId=${grupoId}`
      );

      if (checkResponse.ok) {
        const data = await checkResponse.json();
        if (data.procesoPracticas) {
          // El proceso ya existe, redirigir directamente
          window.location.href = `/admin/proceso-practicas/${data.procesoPracticas._id}`;
        }
      } else {
        // El proceso no existe, crearlo
        const createResponse = await fetch("/api/proceso-practicas/crear", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            estudianteId: estudiante._id,
            grupoId: grupoId
          })
        });

        if (createResponse.ok) {
          const data = await createResponse.json();
          window.location.href = `/admin/proceso-practicas/${data.procesoPracticas._id}`;
        } else {
          alert("Error al crear el proceso de prácticas");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error al acceder al proceso de prácticas");
    } finally {
      setProcesandoEstudiante(null);
    }
  };
  const columnas = [
    {
      key: "accion",
      label: "Ver",
      render: (estudiante) => (
        <button
          onClick={() => handleVerProceso(estudiante)}
          disabled={procesandoEstudiante === estudiante._id}
          className="text-red-600 hover:text-red-800 flex items-center justify-center py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Ver proceso de prácticas"
        >
          {procesandoEstudiante === estudiante._id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Eye className="w-4 h-4" />
          )}
        </button>
      ),
    },
    {
      key: "estudiante",
      label: "Estudiante",
      render: (estudiante) => {
        // Si existe practicante_id, usar ese para obtener la foto real; si no, usar avatar del usuario
        const fotoUrl = estudiante.practicante_id
          ? `/api/practicantes/${estudiante.practicante_id}/foto`
          : `/api/usuarios/${estudiante._id}/foto`;
        return (
          <div className="flex items-center gap-3">
            <img
              src={fotoUrl}
              alt={`${estudiante.nombres} ${estudiante.apellidos}`}
              className="w-10 h-10 rounded-full object-cover bg-gray-200"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/40";
              }}
            />
            <div>
              <div className="font-medium text-gray-900">
                {estudiante.nombres} {estudiante.apellidos}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      key: "correo",
      label: "Email",
      render: (estudiante) => <span>{estudiante.correo_institucional || estudiante.email || "-"}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Título */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Lista de Estudiantes</h2>
        </div>

        {/* Buscador */}
        <div className="p-6 border-b border-gray-200">
          <BuscadorEstudiantesGrupo onSearch={handleSearch} loading={loading} />
        </div>

        {/* Tabla */}
        {loading ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">Buscando estudiantes...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {columnas.map((columna) => (
                      <th
                        key={columna.key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {columna.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEstudiantes.length > 0 ? (
                    filteredEstudiantes.map((estudiante) => (
                      <tr key={estudiante._id} className="hover:bg-gray-50">
                        {columnas.map((columna) => (
                          <td
                            key={`${estudiante._id}-${columna.key}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                          >
                            {columna.render
                              ? columna.render(estudiante)
                              : estudiante[columna.key] || "-"}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={columnas.length}
                        className="px-6 py-12 text-center text-gray-500"
                      >
                        {search ? "No se encontraron resultados" : "Sin datos"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {filteredEstudiantes.length > 10 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  Mostrando {filteredEstudiantes.slice(0, 10).length} de{" "}
                  {filteredEstudiantes.length} resultados
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
