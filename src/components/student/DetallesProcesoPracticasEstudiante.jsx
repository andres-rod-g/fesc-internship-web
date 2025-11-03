import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/Tabs";
import SeguimientosProcesoTab from "../admin/SeguimientosProcesoTab";
import { AlertCircle, Loader2, Save, Plus, Trash2, CheckCircle, XCircle, Clock } from "lucide-react";
import { getEstadoLabel, getEstadoColors } from "~/utils/estadosRecursos";

export default function DetallesProcesoPracticasEstudiante({ procesoPracticasId }) {
  const [proceso, setProceso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("evaluacion");
  const [isSaving, setIsSaving] = useState(false);

  // Estado para auto-evaluación
  const [autoEvaluacion, setAutoEvaluacion] = useState("");

  // Estados para ATLAS
  const [atlasRecursos, setAtlasRecursos] = useState({
    autorizacionDocente: null,
    autorizacionEstudiante: null,
    relacionTrabos: null
  });

  // Estados para Anexos
  const [anexos, setAnexos] = useState([]);
  const [nuevoAnexo, setNuevoAnexo] = useState({
    titulo: "",
    url: ""
  });

  useEffect(() => {
    cargarProceso();
  }, [procesoPracticasId]);

  const cargarProceso = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/proceso-practicas/${procesoPracticasId}`);
      if (res.ok) {
        const data = await res.json();
        setProceso(data.procesoPracticas);

        // Cargar auto-evaluación
        if (data.procesoPracticas.autoevaluacion) {
          setAutoEvaluacion(Array.isArray(data.procesoPracticas.autoevaluacion)
            ? data.procesoPracticas.autoevaluacion[0] || ""
            : data.procesoPracticas.autoevaluacion);
        }

        // Cargar anexos desde anexoIds
        console.log("anexoIds del proceso:", data.procesoPracticas.anexoIds);
        if (data.procesoPracticas.anexoIds && Array.isArray(data.procesoPracticas.anexoIds) && data.procesoPracticas.anexoIds.length > 0) {
          const anexosData = [];
          for (const anexoId of data.procesoPracticas.anexoIds) {
            try {
              console.log("Cargando anexo con ID:", anexoId);
              const resAnexo = await fetch(`/api/recursos/${anexoId}`);
              if (resAnexo.ok) {
                const anexoData = await resAnexo.json();
                console.log("Anexo cargado:", anexoData.recurso);
                anexosData.push(anexoData.recurso);
              } else {
                console.error(`Error al cargar anexo ${anexoId}, status:`, resAnexo.status);
              }
            } catch (err) {
              console.error(`Error al cargar anexo ${anexoId}:`, err);
            }
          }
          console.log("Total anexos cargados:", anexosData.length);
          setAnexos(anexosData);
        } else {
          console.log("No hay anexoIds o está vacío");
          setAnexos([]);
        }

        // Cargar recursos ATLAS
        const atlasResources = {};
        const recursosTipos = ['atlasAutorizacionDocenteId', 'atlasAutorizacionEstudianteId', 'atlasRelacionTrabosId'];
        const recursoKeys = ['autorizacionDocente', 'autorizacionEstudiante', 'relacionTrabos'];

        for (let i = 0; i < recursosTipos.length; i++) {
          const resourceId = data.procesoPracticas[recursosTipos[i]];
          if (resourceId) {
            const resRecurso = await fetch(`/api/recursos/${resourceId}`);
            if (resRecurso.ok) {
              const recursoData = await resRecurso.json();
              atlasResources[recursoKeys[i]] = recursoData.recurso;
            }
          }
        }
        setAtlasRecursos(atlasResources);
      } else {
        setError("No se pudo cargar el proceso de prácticas");
      }
    } catch (err) {
      setError(`Error al cargar: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const guardarAutoEvaluacion = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/proceso-practicas/${procesoPracticasId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoevaluacion: [autoEvaluacion]
        })
      });

      if (res.ok) {
        alert("Auto-evaluación guardada correctamente");
      } else {
        setError("Error al guardar la auto-evaluación");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const guardarRecursoAtlas = async (tipoRecurso, url) => {
    try {
      setIsSaving(true);
      setError(""); // Limpiar errores previos

      // Mapeo de tipos de recursos a los IDs en el proceso
      const tipoToIdMap = {
        'autorizacionDocente': 'atlasAutorizacionDocenteId',
        'autorizacionEstudiante': 'atlasAutorizacionEstudianteId',
        'relacionTrabos': 'atlasRelacionTrabosId'
      };

      const resourceId = proceso[tipoToIdMap[tipoRecurso]];

      console.log("Guardando recurso ATLAS:", { tipoRecurso, url, resourceId });

      if (!resourceId) {
        setError("No se encontró el recurso ATLAS");
        console.error("No resourceId encontrado para:", tipoRecurso);
        return;
      }

      if (!url || url.trim() === "") {
        setError("Por favor ingresa una URL válida");
        return;
      }

      const res = await fetch(`/api/recursos/${resourceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          estado: "pendiente" // Siempre establecer como pendiente cuando el estudiante actualiza
        })
      });

      console.log("Respuesta del servidor:", res.status);

      if (res.ok) {
        // Recargar el recurso actualizado
        const resRecurso = await fetch(`/api/recursos/${resourceId}`);
        if (resRecurso.ok) {
          const recursoData = await resRecurso.json();
          console.log("Recurso actualizado:", recursoData);
          setAtlasRecursos(prev => ({
            ...prev,
            [tipoRecurso]: recursoData.recurso
          }));
        }
        alert("Documento ATLAS guardado correctamente");
      } else {
        const errorData = await res.json();
        console.error("Error al guardar:", errorData);
        setError(errorData.error || "Error al guardar el documento ATLAS");
        alert(`Error: ${errorData.error || "Error al guardar el documento ATLAS"}`);
      }
    } catch (err) {
      console.error("Error en guardarRecursoAtlas:", err);
      setError(`Error: ${err.message}`);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const guardarAnexo = async () => {
    try {
      setIsSaving(true);
      setError("");

      if (!nuevoAnexo.titulo || !nuevoAnexo.url) {
        setError("Por favor completa el título y la URL del anexo");
        alert("Por favor completa el título y la URL del anexo");
        return;
      }

      console.log("Guardando anexo:", {
        procesoPracticasId: procesoPracticasId,
        usuarioId: proceso.estudianteId,
        grupoId: proceso.grupoId,
        tipo: "anexo",
        titulo: nuevoAnexo.titulo,
        url: nuevoAnexo.url
      });

      const res = await fetch("/api/recursos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          procesoPracticasId: procesoPracticasId,
          usuarioId: proceso.estudianteId,
          grupoId: proceso.grupoId,
          tipo: "anexo",
          titulo: nuevoAnexo.titulo,
          url: nuevoAnexo.url,
          estado: "pendiente",
          verificacionRequerida: false
        })
      });

      console.log("Respuesta del servidor:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("Anexo creado:", data);

        // Actualizar el proceso para agregar el anexo al array de anexoIds
        const anexoId = data.recurso._id;
        const currentAnexoIds = proceso.anexoIds || [];
        const updatedAnexoIds = [...currentAnexoIds, anexoId];

        console.log("Actualizando proceso con anexoIds:", {
          currentAnexoIds,
          anexoId,
          updatedAnexoIds
        });

        const updateProcesoRes = await fetch(`/api/proceso-practicas/${procesoPracticasId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            anexoIds: updatedAnexoIds
          })
        });

        console.log("Respuesta de actualizar proceso:", updateProcesoRes.status);

        if (updateProcesoRes.ok) {
          const updateData = await updateProcesoRes.json();
          console.log("Proceso actualizado exitosamente:", updateData);
          // Actualizar el estado local
          setProceso(prev => ({
            ...prev,
            anexoIds: updatedAnexoIds
          }));
          setAnexos([...anexos, data.recurso]);
          setNuevoAnexo({ titulo: "", url: "" });
          alert("Anexo guardado correctamente");
        } else {
          const errorUpdate = await updateProcesoRes.json();
          console.error("Error al actualizar el proceso con el nuevo anexo:", errorUpdate);
          alert("Anexo creado pero no se pudo vincular al proceso: " + (errorUpdate.error || "Error desconocido"));
        }
      } else {
        const errorData = await res.json();
        console.error("Error al guardar anexo:", errorData);
        setError(errorData.error || "Error al guardar el anexo");
        alert(`Error: ${errorData.error || "Error al guardar el anexo"}`);
      }
    } catch (err) {
      console.error("Error en guardarAnexo:", err);
      setError(`Error: ${err.message}`);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const eliminarAnexo = async (anexoId) => {
    if (!confirm("¿Deseas eliminar este anexo?")) return;

    try {
      setIsSaving(true);
      const res = await fetch(`/api/recursos/${anexoId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setAnexos(anexos.filter(a => a._id !== anexoId));
        alert("Anexo eliminado correctamente");
      } else {
        setError("Error al eliminar el anexo");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error && !proceso) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
          <p className="text-yellow-600 text-sm">{error}</p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={(newTab) => {
        console.log("Tab clicked:", newTab);
        setActiveTab(newTab);
      }} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0">
          <TabsTrigger value="evaluacion" onClick={() => console.log("Evaluacion clicked")} className="text-xs md:text-sm">Evaluación</TabsTrigger>
          <TabsTrigger value="seguimiento" onClick={() => console.log("Seguimiento clicked")} className="text-xs md:text-sm">Seguimiento</TabsTrigger>
          <TabsTrigger value="autoevaluacion" onClick={() => console.log("Auto-eval clicked")} className="text-xs md:text-sm">Auto-eval</TabsTrigger>
          <TabsTrigger value="arl" onClick={() => console.log("ARL clicked")} className="text-xs md:text-sm">ARL</TabsTrigger>
          <TabsTrigger value="atlas" onClick={() => console.log("ATLAS clicked")} className="text-xs md:text-sm">ATLAS</TabsTrigger>
          <TabsTrigger value="anexos" onClick={() => console.log("Anexos clicked")} className="text-xs md:text-sm">Anexos</TabsTrigger>
        </TabsList>

        {/* Tab Evaluación */}
        <TabsContent value="evaluacion" className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Tu Evaluación</h3>
            {proceso?.evaluacion ? (
              <div className="space-y-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="col-span-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600 font-medium">Nota 1</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{proceso.evaluacion.nota1 || "—"}/5</p>
                </div>
                <div className="col-span-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600 font-medium">Nota 2</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{proceso.evaluacion.nota2 || "—"}/5</p>
                </div>
                <div className="col-span-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600 font-medium">Nota 3</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{proceso.evaluacion.nota3 || "—"}/5</p>
                </div>
                <div className="col-span-1 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-600 font-medium">Nota 4</p>
                  <p className="text-xl md:text-2xl font-bold text-gray-800 mt-1">{proceso.evaluacion.nota4 || "—"}/5</p>
                </div>
                {proceso.evaluacion.notasAdicionales && (
                  <div className="col-span-2 md:col-span-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs md:text-sm text-blue-600 font-medium">Observaciones</p>
                    <p className="text-gray-700 text-xs md:text-sm mt-1">{proceso.evaluacion.notasAdicionales}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">Aún no tienes evaluaciones registradas</p>
            )}
          </div>
        </TabsContent>

        {/* Tab Seguimiento */}
        <TabsContent value="seguimiento" className="space-y-4">
          {proceso && proceso.grupoId ? (
            <SeguimientosProcesoTab
              procesoPracticasId={procesoPracticasId}
              grupoId={proceso.grupoId}
              estudianteId={proceso.estudianteId}
              estudiantes={[]}
              isEstudiante={true}
            />
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800">No hay información de grupo para mostrar seguimientos</p>
            </div>
          )}
        </TabsContent>

        {/* Tab Auto-Evaluación */}
        <TabsContent value="autoevaluacion" className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Mi Auto-Evaluación</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Nota de Auto-Evaluación (0-5)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={autoEvaluacion}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Permitir solo números y punto decimal
                    if (value === '' || /^\d*\.?\d*$/.test(value)) {
                      const numValue = parseFloat(value);
                      if (value === '' || (numValue >= 0 && numValue <= 5)) {
                        setAutoEvaluacion(value);
                      }
                    }
                  }}
                  placeholder="Ej: 4.5"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <button
                onClick={guardarAutoEvaluacion}
                disabled={isSaving || !autoEvaluacion}
                className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 font-medium flex items-center justify-center gap-2 text-sm"
              >
                <Save className="w-4 h-4" />
                Guardar Auto-Evaluación
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Tab ARL */}
        <TabsContent value="arl" className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Afiliación a Riesgos Laborales (ARL)</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 mb-4">
              <p className="text-blue-900 text-xs md:text-sm">
                Este documento es gestionado por el administrador. Puedes ver su estado aquí, pero no puedes modificarlo.
              </p>
            </div>
            {proceso?.arlId ? (
              <div className="p-3 md:p-4 border border-gray-200 rounded-lg">
                <p className="text-xs md:text-sm text-gray-600 font-medium">ID del recurso</p>
                <p className="text-gray-800 font-mono text-xs md:text-sm mt-1 break-all">{proceso.arlId}</p>
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No hay ARL asignado aún</p>
            )}
          </div>
        </TabsContent>

        {/* Tab ATLAS */}
        <TabsContent value="atlas" className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Documentos ATLAS</h3>
            <div className="space-y-4">
              {/* Autorización Docente */}
              <div className="border border-gray-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm md:text-base">Autorización del Docente</h4>
                  {atlasRecursos.autorizacionDocente?.estado && (() => {
                    const colors = getEstadoColors(atlasRecursos.autorizacionDocente.estado);
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
                        {atlasRecursos.autorizacionDocente.estado === "validado" && <CheckCircle className="w-3 h-3" />}
                        {atlasRecursos.autorizacionDocente.estado === "rechazado" && <XCircle className="w-3 h-3" />}
                        {atlasRecursos.autorizacionDocente.estado === "pendiente" && <Clock className="w-3 h-3" />}
                        {getEstadoLabel(atlasRecursos.autorizacionDocente.estado)}
                      </span>
                    );
                  })()}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      Enlace/URL
                    </label>
                    <input
                      type="text"
                      value={atlasRecursos.autorizacionDocente?.url || ""}
                      onChange={(e) => {
                        setAtlasRecursos(prev => ({
                          ...prev,
                          autorizacionDocente: {
                            ...(prev.autorizacionDocente || {}),
                            url: e.target.value
                          }
                        }));
                      }}
                      placeholder="https://ejemplo.com/documento"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => guardarRecursoAtlas('autorizacionDocente', atlasRecursos.autorizacionDocente?.url)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                  {atlasRecursos.autorizacionDocente?._id && (
                    <p className="text-xs text-gray-500 mt-2">
                      ID: <span className="font-mono">{atlasRecursos.autorizacionDocente._id}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Autorización Estudiante */}
              <div className="border border-gray-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm md:text-base">Autorización del Estudiante</h4>
                  {atlasRecursos.autorizacionEstudiante?.estado && (() => {
                    const colors = getEstadoColors(atlasRecursos.autorizacionEstudiante.estado);
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
                        {atlasRecursos.autorizacionEstudiante.estado === "validado" && <CheckCircle className="w-3 h-3" />}
                        {atlasRecursos.autorizacionEstudiante.estado === "rechazado" && <XCircle className="w-3 h-3" />}
                        {atlasRecursos.autorizacionEstudiante.estado === "pendiente" && <Clock className="w-3 h-3" />}
                        {getEstadoLabel(atlasRecursos.autorizacionEstudiante.estado)}
                      </span>
                    );
                  })()}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      Enlace/URL
                    </label>
                    <input
                      type="text"
                      value={atlasRecursos.autorizacionEstudiante?.url || ""}
                      onChange={(e) => {
                        setAtlasRecursos(prev => ({
                          ...prev,
                          autorizacionEstudiante: {
                            ...(prev.autorizacionEstudiante || {}),
                            url: e.target.value
                          }
                        }));
                      }}
                      placeholder="https://ejemplo.com/documento"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => guardarRecursoAtlas('autorizacionEstudiante', atlasRecursos.autorizacionEstudiante?.url)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                  {atlasRecursos.autorizacionEstudiante?._id && (
                    <p className="text-xs text-gray-500 mt-2">
                      ID: <span className="font-mono">{atlasRecursos.autorizacionEstudiante._id}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Relación de Trabajos */}
              <div className="border border-gray-200 rounded-lg p-3 md:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm md:text-base">Relación de Trabajos (ATLAS)</h4>
                  {atlasRecursos.relacionTrabos?.estado && (() => {
                    const colors = getEstadoColors(atlasRecursos.relacionTrabos.estado);
                    return (
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}>
                        {atlasRecursos.relacionTrabos.estado === "validado" && <CheckCircle className="w-3 h-3" />}
                        {atlasRecursos.relacionTrabos.estado === "rechazado" && <XCircle className="w-3 h-3" />}
                        {atlasRecursos.relacionTrabos.estado === "pendiente" && <Clock className="w-3 h-3" />}
                        {getEstadoLabel(atlasRecursos.relacionTrabos.estado)}
                      </span>
                    );
                  })()}
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      Enlace/URL
                    </label>
                    <input
                      type="text"
                      value={atlasRecursos.relacionTrabos?.url || ""}
                      onChange={(e) => {
                        setAtlasRecursos(prev => ({
                          ...prev,
                          relacionTrabos: {
                            ...(prev.relacionTrabos || {}),
                            url: e.target.value
                          }
                        }));
                      }}
                      placeholder="https://ejemplo.com/documento"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => guardarRecursoAtlas('relacionTrabos', atlasRecursos.relacionTrabos?.url)}
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2 text-sm"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                  {atlasRecursos.relacionTrabos?._id && (
                    <p className="text-xs text-gray-500 mt-2">
                      ID: <span className="font-mono">{atlasRecursos.relacionTrabos._id}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab Anexos */}
        <TabsContent value="anexos" className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-4">Anexos</h3>

            {/* Lista de anexos */}
            {anexos.length > 0 && (
              <div className="space-y-3 mb-6">
                {anexos.map((anexo) => (
                  <div key={anexo._id} className="p-3 md:p-4 border border-gray-200 rounded-lg flex items-start md:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 text-sm md:text-base truncate">{anexo.titulo}</h4>
                      {anexo.url && (
                        <a href={anexo.url} target="_blank" rel="noopener noreferrer" className="text-xs md:text-sm text-accent hover:underline mt-1 block truncate">
                          Ver documento →
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => eliminarAnexo(anexo._id)}
                      disabled={isSaving}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para nuevo anexo */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 text-sm md:text-base mb-3">Agregar Nuevo Anexo</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Título del Anexo
                  </label>
                  <input
                    type="text"
                    value={nuevoAnexo.titulo}
                    onChange={(e) => setNuevoAnexo({ ...nuevoAnexo, titulo: e.target.value })}
                    placeholder="Ej: Informe Final de Prácticas"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                    Enlace/URL del Documento
                  </label>
                  <input
                    type="url"
                    value={nuevoAnexo.url}
                    onChange={(e) => setNuevoAnexo({ ...nuevoAnexo, url: e.target.value })}
                    placeholder="https://ejemplo.com/documento"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
                <button
                  onClick={guardarAnexo}
                  disabled={isSaving || !nuevoAnexo.titulo || !nuevoAnexo.url}
                  className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Guardar Anexo
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
