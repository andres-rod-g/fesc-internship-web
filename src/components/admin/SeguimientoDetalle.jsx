import React, { useState, useEffect } from "react";
import { Save, X, Loader2, ExternalLink } from "lucide-react";
import { getEstadoColors, ESTADOS_RECURSO_LABELS } from "~/utils/estadosRecursos";

export default function SeguimientoDetalle({
  seguimiento,
  estudiantes = [],
  onActualizarSeguimiento
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [titulo, setTitulo] = useState(seguimiento.titulo);
  const [descripcion, setDescripcion] = useState(seguimiento.descripcion);
  const [entradas, setEntradas] = useState(seguimiento.entradas || []);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTermEntradas, setSearchTermEntradas] = useState("");
  const [recursos, setRecursos] = useState({});
  const [modalRecurso, setModalRecurso] = useState({ visible: false, recursoId: null, entrada: null });
  const [loadingRecursos, setLoadingRecursos] = useState(false);
  const [notaTemporal, setNotaTemporal] = useState(null);
  const [observacionesTemporal, setObservacionesTemporal] = useState("");
  const [enlaceTemporal, setEnlaceTemporal] = useState("");
  const [isSavingNota, setIsSavingNota] = useState(false);

  useEffect(() => {
    setTitulo(seguimiento.titulo);
    setDescripcion(seguimiento.descripcion);
    setEntradas(seguimiento.entradas || []);
    // Cargar recursos de las entradas
    cargarRecursos(seguimiento.entradas || []);
  }, [seguimiento]);

  const cargarRecursos = async (entradasList) => {
    try {
      setLoadingRecursos(true);

      // Obtener IDs de recursos de las entradas
      const recursoIds = entradasList
        .filter((entrada) => entrada.recursoId)
        .map((entrada) => entrada.recursoId);

      if (recursoIds.length === 0) {
        setRecursos({});
        return;
      }

      // Obtener todos los recursos en una sola llamada
      const res = await fetch("/api/recursos-practicas/por-seguimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recursoIds })
      });

      if (res.ok) {
        const data = await res.json();
        const recursosMap = {};

        // Mapear recursos por ID
        (data.recursos || []).forEach((recurso) => {
          recursosMap[recurso._id] = recurso;
        });

        console.log("Recursos cargados:", recursosMap);
        setRecursos(recursosMap);
      } else {
        console.error("Error al cargar recursos:", res.status);
        setRecursos({});
      }
    } catch (err) {
      console.error("Error al cargar recursos:", err);
      setRecursos({});
    } finally {
      setLoadingRecursos(false);
    }
  };

  const handleGuardarCambios = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/seguimientos-practicas/${seguimiento._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titulo,
          descripcion,
          entradas
        })
      });

      if (res.ok) {
        onActualizarSeguimiento({
          ...seguimiento,
          titulo,
          descripcion,
          entradas
        });
        setIsEditing(false);
      } else {
        alert("Error al guardar los cambios");
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const getNombreEstudiante = (estudianteId) => {
    const estudiante = estudiantes.find((e) => e._id === estudianteId);
    return estudiante
      ? `${estudiante.nombres} ${estudiante.apellidos}`
      : "Estudiante no encontrado";
  };

  const getRecursoDisplay = (recursoId) => {
    // Aquí podrías hacer una búsqueda de recursos si tienes los datos
    return recursoId || "Recurso no asignado";
  };

  const getEstadoEntrada = (entrada) => {
    const recurso = recursos[entrada.recursoId];

    // Rojo: Sin URL asignado (el recurso existe pero no tiene URL)
    if (!recurso || !recurso.url) {
      return {
        color: "red",
        bgColor: "bg-red-50",
        borderColor: "border-red-300",
        textColor: "text-red-700",
        mensaje: "Sin URL asignado"
      };
    }

    // Verificar qué falta para completar
    const falta = [];
    if (!recurso.nota) {
      falta.push("calificación");
    }
    // Check estado field for signature validation status (use 'pendiente' as default if not set)
    const estado = recurso.estado || "pendiente";
    if (estado !== "validado") {
      falta.push("validación de firmas");
    }

    // Amarillo: Falta calificación o validación de firmas
    if (falta.length > 0) {
      return {
        color: "yellow",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-300",
        textColor: "text-yellow-700",
        mensaje: `Falta: ${falta.join(" y ")}`
      };
    }

    // Verde: Todo está en orden
    return {
      color: "green",
      bgColor: "bg-green-50",
      borderColor: "border-green-300",
      textColor: "text-green-700",
      mensaje: "Completo"
    };
  };

  const handleGuardarNota = async () => {
    try {
      setIsSavingNota(true);
      const recurso = recursos[modalRecurso.recursoId];

      // Guardar en recursos
      const res = await fetch(`/api/recursos/${modalRecurso.recursoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...recurso,
          url: enlaceTemporal,
          nota: notaTemporal,
          notasAdicionales: observacionesTemporal
        })
      });

      if (res.ok) {
        // Actualizar el recurso en el estado local
        const recursosActualizados = {
          ...recursos,
          [modalRecurso.recursoId]: {
            ...recurso,
            url: enlaceTemporal,
            nota: notaTemporal,
            notasAdicionales: observacionesTemporal
          }
        };
        setRecursos(recursosActualizados);

        // Actualizar también las entradas del seguimiento
        const entradasActualizadas = entradas.map((entrada) => {
          if (entrada.recursoId === modalRecurso.recursoId) {
            return {
              ...entrada,
              recursoUrl: enlaceTemporal,
              recursNota: notaTemporal,
              recursoObservaciones: observacionesTemporal
            };
          }
          return entrada;
        });

        // Guardar cambios en el seguimiento
        const updateRes = await fetch(`/api/seguimientos-practicas/${seguimiento._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            titulo: seguimiento.titulo,
            descripcion: seguimiento.descripcion,
            entradas: entradasActualizadas
          })
        });

        if (updateRes.ok) {
          setEntradas(entradasActualizadas);
          // Actualizar el seguimiento en el componente padre
          onActualizarSeguimiento({
            ...seguimiento,
            entradas: entradasActualizadas
          });
        }

        setModalRecurso({ visible: false, recursoId: null, entrada: null });
      }
    } catch (err) {
      console.error("Error al guardar nota:", err);
    } finally {
      setIsSavingNota(false);
    }
  };

  // Filtrar entradas según búsqueda
  const entradasFiltradas = entradas.filter((entrada) => {
    const nombreEstudiante = getNombreEstudiante(entrada.estudianteId).toLowerCase();
    const recursoDisplay = getRecursoDisplay(entrada.recursoId).toLowerCase();
    const observaciones = (entrada.observaciones || "").toLowerCase();
    const searchLower = searchTermEntradas.toLowerCase();

    return (
      nombreEstudiante.includes(searchLower) ||
      recursoDisplay.includes(searchLower) ||
      observaciones.includes(searchLower)
    );
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="text-2xl font-bold w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Descripción del seguimiento..."
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
              />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-800">{seguimiento.titulo}</h2>
              {seguimiento.descripcion && (
                <p className="text-gray-600 mt-2">{seguimiento.descripcion}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Creado: {new Date(seguimiento.createdAt).toLocaleDateString('es-ES')}
              </p>
            </>
          )}
        </div>

        <div className="flex gap-2">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              title="Editar seguimiento"
            >
              ✏️ Editar
            </button>
          ) : (
            <>
              <button
                onClick={handleGuardarCambios}
                disabled={isSaving}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setTitulo(seguimiento.titulo);
                  setDescripcion(seguimiento.descripcion);
                }}
                className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Entradas Section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4">Entradas ({entradas.length})</h3>
          <p className="text-sm text-gray-500 mb-4">
            Las entradas se crean a través del sistema de proceso de prácticas
          </p>
        </div>

        {/* Buscador de Entradas */}
        {entradas.length > 0 && (
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por estudiante, recurso u observaciones..."
              value={searchTermEntradas}
              onChange={(e) => setSearchTermEntradas(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
            />
          </div>
        )}

        {/* Lista de Entradas (Solo lectura) */}
        <div className="space-y-3">
          {entradasFiltradas.length === 0 ? (
            <p className="text-center text-gray-500 py-6">
              {entradas.length === 0 ? "Sin entradas aún" : "No se encontraron entradas"}
            </p>
          ) : (
            entradasFiltradas.map((entrada) => {
              const estado = getEstadoEntrada(entrada);
              const recurso = recursos[entrada.recursoId];
              return (
                <div
                  key={entrada.id}
                  className={`p-4 rounded-lg border-2 space-y-2 transition-colors cursor-pointer hover:shadow-md ${estado.bgColor} ${estado.borderColor}`}
                  onClick={() => {
                    setNotaTemporal(recurso?.nota || null);
                    setObservacionesTemporal(recurso?.notasAdicionales || "");
                    setEnlaceTemporal(recurso?.url || "");
                    setModalRecurso({ visible: true, recursoId: entrada.recursoId, entrada });
                  }}
                >
                  {/* Estado Badge */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Estudiante</p>
                      <p className="text-sm font-medium text-gray-900">{getNombreEstudiante(entrada.estudianteId)}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${estado.textColor}`}>
                      {estado.mensaje}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {recurso && recurso.url && (
                      <div>
                        <p className="text-xs font-medium text-gray-600">Enlace asignado</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-gray-900 truncate">{recurso.url}</p>
                          <ExternalLink className="w-3 h-3 text-gray-600 flex-shrink-0" />
                        </div>
                      </div>
                    )}

                    {recurso && recurso.nota && (
                      <div>
                        <p className="text-xs font-medium text-gray-600">Calificación</p>
                        <p className="text-sm text-gray-900">{recurso.nota}/5</p>
                      </div>
                    )}

                    {entrada.observaciones && (
                      <div>
                        <p className="text-xs font-medium text-gray-600">Observaciones</p>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{entrada.observaciones}</p>
                      </div>
                    )}
                  </div>
                  {entrada.recursoId && (
                    <div className="mt-3 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <span>🆔</span>
                        <span>ID recurso: {entrada.recursoId}</span>
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de Recurso */}
      {modalRecurso.visible && modalRecurso.recursoId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                Detalles del Recurso
              </h3>
              <button
                onClick={() => setModalRecurso({ visible: false, recursoId: null, entrada: null })}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {loadingRecursos ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
                </div>
              ) : (
                <>
                  {/* Estudiante */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Estudiante</p>
                    <p className="text-sm text-gray-900">{getNombreEstudiante(modalRecurso.entrada?.estudianteId)}</p>
                  </div>

                  {/* URL */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Enlace</p>
                    <input
                      type="url"
                      value={enlaceTemporal}
                      onChange={(e) => setEnlaceTemporal(e.target.value)}
                      placeholder="https://ejemplo.com"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
                        !enlaceTemporal
                          ? "border-red-300 focus:ring-red-300"
                          : "border-gray-300 focus:ring-accent"
                      }`}
                    />
                    {enlaceTemporal && (
                      <a
                        href={enlaceTemporal}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 mt-1 inline-flex items-center gap-1"
                      >
                        Abrir enlace
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Nota */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Calificación (0-5)</p>
                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={notaTemporal !== null ? notaTemporal : ""}
                      onChange={(e) => setNotaTemporal(e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Sin calificación"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>

                  {/* Observaciones */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Observaciones</p>
                    <textarea
                      value={observacionesTemporal}
                      onChange={(e) => setObservacionesTemporal(e.target.value)}
                      placeholder="Agregar observaciones o notas..."
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                    />
                  </div>

                  {/* Estado de Validación */}
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Validación de Firmas</p>
                    {(() => {
                      const recurso = recursos[modalRecurso.recursoId];
                      const estado = recurso?.estado || "pendiente";
                      const colores = getEstadoColors(estado);
                      return (
                        <div className={`px-3 py-2 rounded-lg text-sm font-medium inline-block ${colores.bg} ${colores.text}`}>
                          {ESTADOS_RECURSO_LABELS[estado]}
                        </div>
                      );
                    })()}
                  </div>
                </>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalRecurso({ visible: false, recursoId: null, entrada: null })}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
              >
                Cerrar
              </button>
              <button
                onClick={handleGuardarNota}
                disabled={isSavingNota}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:bg-blue-400 flex items-center justify-center gap-2"
              >
                {isSavingNota ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Nota
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
