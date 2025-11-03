import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/Tabs";
import SeguimientosProcesoTab from "../admin/SeguimientosProcesoTab";
import { AlertCircle, Loader2, Save, Plus, Trash2 } from "lucide-react";

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

        // Cargar seguimientos
        if (data.procesoPracticas.seguimiento) {
          setSeguimientos(Array.isArray(data.procesoPracticas.seguimiento) ? data.procesoPracticas.seguimiento : []);
        }

        // Cargar auto-evaluación
        if (data.procesoPracticas.autoevaluacion) {
          setAutoEvaluacion(Array.isArray(data.procesoPracticas.autoevaluacion)
            ? data.procesoPracticas.autoevaluacion[0] || ""
            : data.procesoPracticas.autoevaluacion);
        }

        // Cargar anexos
        if (data.procesoPracticas.anexos && Array.isArray(data.procesoPracticas.anexos)) {
          setAnexos(data.procesoPracticas.anexos);
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

  const guardarRecursoAtlas = async (tipoRecurso, recursoData) => {
    try {
      setIsSaving(true);
      const resourceId = proceso[`atlas${tipoRecurso.charAt(0).toUpperCase() + tipoRecurso.slice(1)}Id`];

      if (!resourceId) {
        setError("No se encontró el recurso ATLAS");
        return;
      }

      const res = await fetch(`/api/recursos/${resourceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recursoData)
      });

      if (res.ok) {
        setAtlasRecursos(prev => ({
          ...prev,
          [tipoRecurso]: recursoData
        }));
        alert("Documento ATLAS guardado correctamente");
      } else {
        setError("Error al guardar el documento ATLAS");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const guardarAnexo = async () => {
    try {
      setIsSaving(true);
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

      if (res.ok) {
        const data = await res.json();
        setAnexos([...anexos, data.recurso]);
        setNuevoAnexo({ titulo: "", url: "" });
        alert("Anexo guardado correctamente");
      } else {
        setError("Error al guardar el anexo");
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
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
        <TabsList className="grid w-full grid-cols-6 gap-0">
          <TabsTrigger value="evaluacion" onClick={() => console.log("Evaluacion clicked")}>Evaluación</TabsTrigger>
          <TabsTrigger value="seguimiento" onClick={() => console.log("Seguimiento clicked")}>Seguimiento</TabsTrigger>
          <TabsTrigger value="autoevaluacion" onClick={() => console.log("Auto-eval clicked")}>Auto-eval</TabsTrigger>
          <TabsTrigger value="arl" onClick={() => console.log("ARL clicked")}>ARL</TabsTrigger>
          <TabsTrigger value="atlas" onClick={() => console.log("ATLAS clicked")}>ATLAS</TabsTrigger>
          <TabsTrigger value="anexos" onClick={() => console.log("Anexos clicked")}>Anexos</TabsTrigger>
        </TabsList>

        {/* Tab Evaluación */}
        <TabsContent value="evaluacion" className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Tu Evaluación</h3>
            {proceso?.evaluacion ? (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Nota 1</p>
                  <p className="text-2xl font-bold text-gray-800">{proceso.evaluacion.nota1 || "—"}/5</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Nota 2</p>
                  <p className="text-2xl font-bold text-gray-800">{proceso.evaluacion.nota2 || "—"}/5</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Nota 3</p>
                  <p className="text-2xl font-bold text-gray-800">{proceso.evaluacion.nota3 || "—"}/5</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 font-medium">Nota 4</p>
                  <p className="text-2xl font-bold text-gray-800">{proceso.evaluacion.nota4 || "—"}/5</p>
                </div>
                {proceso.evaluacion.notasAdicionales && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-600 font-medium">Observaciones</p>
                    <p className="text-gray-700 text-sm mt-1">{proceso.evaluacion.notasAdicionales}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">Aún no tienes evaluaciones registradas</p>
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
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Mi Auto-Evaluación</h3>
            <div className="space-y-3">
              <textarea
                value={autoEvaluacion}
                onChange={(e) => setAutoEvaluacion(e.target.value)}
                placeholder="Escribe aquí tu auto-evaluación sobre tu desempeño en las prácticas..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <button
                onClick={guardarAutoEvaluacion}
                disabled={isSaving}
                className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Guardar Auto-Evaluación
              </button>
            </div>
          </div>
        </TabsContent>

        {/* Tab ARL */}
        <TabsContent value="arl" className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Afiliación a Riesgos Laborales (ARL)</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-blue-900 text-sm">
                Este documento es gestionado por el administrador. Puedes ver su estado aquí, pero no puedes modificarlo.
              </p>
            </div>
            {proceso?.arlId ? (
              <div className="p-4 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600 font-medium">ID del recurso</p>
                <p className="text-gray-800 font-mono text-sm mt-1">{proceso.arlId}</p>
              </div>
            ) : (
              <p className="text-gray-600">No hay ARL asignado aún</p>
            )}
          </div>
        </TabsContent>

        {/* Tab ATLAS */}
        <TabsContent value="atlas" className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Documentos ATLAS</h3>
            <div className="space-y-4">
              {/* Autorización Docente */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Autorización del Docente</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enlace/URL
                    </label>
                    <input
                      type="text"
                      defaultValue={atlasRecursos.autorizacionDocente?.url || ""}
                      onChange={(e) => {
                        const newResource = { ...atlasRecursos.autorizacionDocente, url: e.target.value };
                        setAtlasRecursos(prev => ({ ...prev, autorizacionDocente: newResource }));
                      }}
                      placeholder="https://ejemplo.com/documento"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => guardarRecursoAtlas('autorizacionDocente', { url: atlasRecursos.autorizacionDocente?.url })}
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </div>

              {/* Autorización Estudiante */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Autorización del Estudiante</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enlace/URL
                    </label>
                    <input
                      type="text"
                      defaultValue={atlasRecursos.autorizacionEstudiante?.url || ""}
                      onChange={(e) => {
                        const newResource = { ...atlasRecursos.autorizacionEstudiante, url: e.target.value };
                        setAtlasRecursos(prev => ({ ...prev, autorizacionEstudiante: newResource }));
                      }}
                      placeholder="https://ejemplo.com/documento"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => guardarRecursoAtlas('autorizacionEstudiante', { url: atlasRecursos.autorizacionEstudiante?.url })}
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </div>

              {/* Relación de Trabajos */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Relación de Trabajos (ATLAS)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enlace/URL
                    </label>
                    <input
                      type="text"
                      defaultValue={atlasRecursos.relacionTrabos?.url || ""}
                      onChange={(e) => {
                        const newResource = { ...atlasRecursos.relacionTrabos, url: e.target.value };
                        setAtlasRecursos(prev => ({ ...prev, relacionTrabos: newResource }));
                      }}
                      placeholder="https://ejemplo.com/documento"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={() => guardarRecursoAtlas('relacionTrabos', { url: atlasRecursos.relacionTrabos?.url })}
                    disabled={isSaving}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab Anexos */}
        <TabsContent value="anexos" className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Anexos</h3>

            {/* Lista de anexos */}
            {anexos.length > 0 && (
              <div className="space-y-3 mb-6">
                {anexos.map((anexo) => (
                  <div key={anexo._id} className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{anexo.titulo}</h4>
                      {anexo.url && (
                        <a href={anexo.url} target="_blank" rel="noopener noreferrer" className="text-sm text-accent hover:underline mt-1">
                          Ver documento →
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => eliminarAnexo(anexo._id)}
                      disabled={isSaving}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario para nuevo anexo */}
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-3">Agregar Nuevo Anexo</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título del Anexo
                  </label>
                  <input
                    type="text"
                    value={nuevoAnexo.titulo}
                    onChange={(e) => setNuevoAnexo({ ...nuevoAnexo, titulo: e.target.value })}
                    placeholder="Ej: Informe Final de Prácticas"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enlace/URL del Documento
                  </label>
                  <input
                    type="url"
                    value={nuevoAnexo.url}
                    onChange={(e) => setNuevoAnexo({ ...nuevoAnexo, url: e.target.value })}
                    placeholder="https://ejemplo.com/documento"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  />
                </div>
                <button
                  onClick={guardarAnexo}
                  disabled={isSaving || !nuevoAnexo.titulo || !nuevoAnexo.url}
                  className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
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
