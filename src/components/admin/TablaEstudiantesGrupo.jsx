import React, { useState, useEffect, useRef } from "react";
import { Eye, Loader2 } from "lucide-react";
import BuscadorEstudiantesGrupo from "./BuscadorEstudiantesGrupo";
import TablaGenerica from "./TablaGenerica";
import { calcularPromedio, formatearCalificacion, obtenerColorCalificacion } from "../../utils/calificaciones";

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
  const [seguimientosMap, setSeguimientosMap] = useState({});
  const [evaluacionesMap, setEvaluacionesMap] = useState({});
  const [estudiantesConCalificaciones, setEstudiantesConCalificaciones] = useState(estudiantes);
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

  // Cargar seguimientos del grupo con todos sus recursos
  const cargarSeguimientos = async () => {
    if (!grupoId) return;

    try {
      // Obtener todos los seguimientos y recursos del grupo en una sola llamada
      const res = await fetch("/api/recursos-practicas/grupo-seguimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grupoId })
      });

      if (res.ok) {
        const data = await res.json();
        const recursos = data.recursos || [];
        const recursoIdToEntrada = data.recursoIdToEntrada || {};

        // Crear un mapa de recursoId -> recurso para búsqueda rápida
        const recursoMap = {};
        recursos.forEach((r) => {
          recursoMap[r._id] = r;
        });

        // Obtener seguimientos del grupo
        const seguimientosRes = await fetch(
          `/api/seguimientos-practicas/listar?grupoId=${grupoId}`
        );
        if (seguimientosRes.ok) {
          const seguimientosData = await seguimientosRes.json();
          const seguimientos = seguimientosData.seguimientos || [];

          // Crear un mapa de estudiante -> seguimientos exitosos
          const map = {};
          for (const estudiante of estudiantes) {
            map[estudiante._id] = calcularSeguimientosExitosos(
              estudiante._id,
              seguimientos,
              recursoMap
            );
          }
          setSeguimientosMap(map);
        }
      }
    } catch (err) {
      console.error("Error al cargar seguimientos:", err);
    }
  };

  const calcularSeguimientosExitosos = (estudianteId, seguimientos, recursoMap) => {
    let exitosos = 0;
    let total = 0;

    for (const seguimiento of seguimientos) {
      const entrada = seguimiento.entradas?.find((e) => e.estudianteId === estudianteId);
      if (entrada && entrada.recursoId) {
        total++;
        // Verificar si el recurso tiene URL asignada usando el mapa
        const recurso = recursoMap[entrada.recursoId];
        if (recurso && recurso.url) {
          exitosos++;
        }
      }
    }

    return { exitosos, total };
  };

  // Efecto para búsqueda local
  useEffect(() => {
    if (!buscarEnBaseDatos) {
      performLocalSearch(search);
    }
  }, [estudiantes]);

  // Cargar evaluaciones del grupo
  const cargarEvaluaciones = async () => {
    if (!grupoId) return;

    try {
      const res = await fetch(`/api/proceso-practicas/grupo-evaluaciones?grupoId=${grupoId}`);

      if (res.ok) {
        const data = await res.json();
        const evaluacionesPorEstudiante = data.evaluacionesPorEstudiante || {};
        setEvaluacionesMap(evaluacionesPorEstudiante);

        // Merge evaluaciones con estudiantes
        const estudiantesConEval = estudiantes.map(est => ({
          ...est,
          ...(evaluacionesPorEstudiante[est._id] || {})
        }));
        setEstudiantesConCalificaciones(estudiantesConEval);
      }
    } catch (err) {
      console.error("Error al cargar evaluaciones:", err);
    }
  };

  // Efecto para cargar evaluaciones y seguimientos
  useEffect(() => {
    cargarEvaluaciones();
    cargarSeguimientos();
  }, [grupoId, estudiantes]);

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
    {
      key: "calificacion_1",
      label: "Calif. 1",
      render: (estudiante) => (
        <span className="text-sm font-medium text-gray-700">
          {formatearCalificacion(estudiante.calificacion_1)}
        </span>
      ),
    },
    {
      key: "calificacion_2",
      label: "Calif. 2",
      render: (estudiante) => (
        <span className="text-sm font-medium text-gray-700">
          {formatearCalificacion(estudiante.calificacion_2)}
        </span>
      ),
    },
    {
      key: "calificacion_3",
      label: "Calif. 3",
      render: (estudiante) => (
        <span className="text-sm font-medium text-gray-700">
          {formatearCalificacion(estudiante.calificacion_3)}
        </span>
      ),
    },
    {
      key: "calificacion_4",
      label: "Calif. 4",
      render: (estudiante) => (
        <span className="text-sm font-medium text-gray-700">
          {formatearCalificacion(estudiante.calificacion_4)}
        </span>
      ),
    },
    {
      key: "promedio",
      label: "Promedio",
      render: (estudiante) => {
        const calificaciones = [
          estudiante.calificacion_1,
          estudiante.calificacion_2,
          estudiante.calificacion_3,
          estudiante.calificacion_4
        ];
        const promedio = calcularPromedio(calificaciones);
        const colores = obtenerColorCalificacion(promedio);

        return (
          <div className={`px-3 py-1 rounded-full text-sm font-bold border ${colores.bg} ${colores.text} ${colores.border} text-center`}>
            {promedio !== null ? promedio : "-"}
          </div>
        );
      },
    },
    {
      key: "seguimientos",
      label: "Seguimientos",
      render: (estudiante) => {
        const stats = seguimientosMap[estudiante._id];
        if (!stats) {
          return <span className="text-gray-500 text-sm">-</span>;
        }

        const { exitosos, total } = stats;
        const porcentaje = total > 0 ? Math.round((exitosos / total) * 100) : 0;

        let bgColor = "bg-red-100";
        let textColor = "text-red-700";
        let borderColor = "border-red-300";

        if (porcentaje === 100 && total > 0) {
          bgColor = "bg-green-100";
          textColor = "text-green-700";
          borderColor = "border-green-300";
        } else if (porcentaje >= 50) {
          bgColor = "bg-yellow-100";
          textColor = "text-yellow-700";
          borderColor = "border-yellow-300";
        }

        return (
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${bgColor} ${textColor} ${borderColor}`}>
            {exitosos}/{total}
          </div>
        );
      },
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
                    filteredEstudiantes.map((estudiante) => {
                      // Merge estudiante data con calificaciones
                      const estudianteConCalificaciones = {
                        ...estudiante,
                        ...(estudiantesConCalificaciones.find(e => e._id === estudiante._id) || {})
                      };

                      return (
                        <tr key={estudiante._id} className="hover:bg-gray-50">
                          {columnas.map((columna) => (
                            <td
                              key={`${estudiante._id}-${columna.key}`}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            >
                              {columna.render
                                ? columna.render(estudianteConCalificaciones)
                                : estudianteConCalificaciones[columna.key] || "-"}
                            </td>
                          ))}
                        </tr>
                      );
                    })
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
