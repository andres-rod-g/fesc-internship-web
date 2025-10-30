import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/Tabs";
import RecursoPracticas from "./RecursoPracticas";
import ListaRecursos from "./ListaRecursos";
import AtlasDocumentos from "./AtlasDocumentos";
import DocumentoARL from "./DocumentoARL";
import { AlertCircle, Loader2 } from "lucide-react";

export default function DetallesProcesoPracticas({ procesoPracticasId }) {
  const [proceso, setProceso] = useState(null);
  const [procesoOriginal, setProcesoOriginal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("evaluacion");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [arlData, setArlData] = useState(null);
  const [atlasDataMap, setAtlasDataMap] = useState({});
  const [anexosData, setAnexosData] = useState({}); // Mapa de anexo ID -> datos modificados

  useEffect(() => {
    cargarProceso();
  }, [procesoPracticasId]);

  const cargarProceso = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/proceso-practicas/${procesoPracticasId}`);
      if (res.ok) {
        const data = await res.json();
        console.log("Proceso cargado:", data.procesoPracticas);
        setProceso(data.procesoPracticas);

        // Cargar anexos si existen
        if (data.procesoPracticas.anexoIds && data.procesoPracticas.anexoIds.length > 0) {
          cargarAnexos(data.procesoPracticas.anexoIds);
        }
      } else {
        const errorText = await res.text();
        console.error("Error en respuesta:", res.status, errorText);
        setError(`No se pudo cargar el proceso de prácticas: ${errorText}`);
      }
    } catch (err) {
      setError(`Error al cargar el proceso: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarAnexos = async (anexoIds) => {
    try {
      const anexos = {};
      for (const id of anexoIds) {
        const res = await fetch(`/api/recursos/${id}`);
        if (res.ok) {
          const data = await res.json();
          anexos[id] = data.recurso;
        }
      }
      // Almacenar en proceso como array
      setProceso((prev) => ({
        ...prev,
        anexos: anexoIds.map((id) => anexos[id]).filter(Boolean)
      }));
    } catch (err) {
      console.error("Error al cargar anexos:", err);
    }
  };

  const handleActualizarSeccion = (seccion, datos) => {
    setProceso({ ...proceso, [seccion]: datos });
  };

  const handleGuardarCambios = async () => {
    try {
      setIsSaving(true);

      // Guardar ARL si ha sido modificado
      if (arlData && proceso.arlId) {
        await fetch(`/api/recursos/${proceso.arlId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(arlData)
        });
      }

      // Guardar ATLAS si ha sido modificado
      // atlasDataMap es un objeto con keys: autorizacionDocente, autorizacionEstudiante, relacionTrabos
      if (Object.keys(atlasDataMap).length > 0) {
        const atlasMap = {
          autorizacionDocente: proceso.atlasAutorizacionDocenteId,
          autorizacionEstudiante: proceso.atlasAutorizacionEstudianteId,
          relacionTrabos: proceso.atlasRelacionTrabosId
        };

        for (const [documentoId, resourceData] of Object.entries(atlasDataMap)) {
          const resourceId = atlasMap[documentoId];
          if (resourceData && resourceId) {
            await fetch(`/api/recursos/${resourceId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(resourceData)
            });
          }
        }
      }

      // Guardar anexos (crear, actualizar o eliminar)
      const nuevosAnexoIds = [];
      if (proceso.anexos && Array.isArray(proceso.anexos)) {
        for (const anexo of proceso.anexos) {
          if (anexo._id) {
            // Actualizar anexo existente
            await fetch(`/api/recursos/${anexo._id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(anexo)
            });
            nuevosAnexoIds.push(anexo._id);
          } else {
            // Crear nuevo anexo
            const resCrear = await fetch("/api/recursos/crear", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                procesoPracticasId: procesoPracticasId,
                usuarioId: proceso.estudianteId,
                grupoId: proceso.grupoId,
                tipo: "anexo",
                titulo: anexo.titulo || "",
                url: anexo.url || "",
                nota: anexo.nota || null,
                notasAdicionales: anexo.notasAdicionales || "",
                verificado: anexo.verificado || false,
                verificacionRequerida: false
              })
            });
            if (resCrear.ok) {
              const dataCrear = await resCrear.json();
              nuevosAnexoIds.push(dataCrear.recurso._id);
            }
          }
        }
      }

      // Actualizar el proceso con los nuevos anexoIds
      const procesoActualizado = { ...proceso, anexoIds: nuevosAnexoIds };
      delete procesoActualizado.anexos; // No incluir el array de anexos en el guardado

      console.log("Guardando proceso:", procesoActualizado);

      // Guardar proceso de prácticas
      const res = await fetch(`/api/proceso-practicas/${procesoPracticasId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(procesoActualizado)
      });

      const responseText = await res.text();
      console.log("Respuesta del servidor:", responseText);

      if (res.ok) {
        setError("");
        setIsEditing(false);
        setArlData(null);
        setAtlasDataMap({});
        setAnexosData({});
        // Recargar el proceso desde la API para asegurar sincronización
        await cargarProceso();
      } else {
        setError(`Error al guardar los cambios: ${responseText}`);
      }
    } catch (err) {
      setError(`Error al guardar: ${err.message}`);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEntrarEdicion = () => {
    setProcesoOriginal(JSON.parse(JSON.stringify(proceso)));
    setIsEditing(true);
  };

  const handleCancelarEdicion = () => {
    if (procesoOriginal) {
      setProceso(JSON.parse(JSON.stringify(procesoOriginal)));
    }
    setIsEditing(false);
  };

  const handleGuardarEdicion = () => {
    handleGuardarCambios();
  };

  const handleToggleConsultoria = async () => {
    try {
      setIsSaving(true);
      const updateData = { ...proceso, esConsultoria: !proceso.esConsultoria };

      const res = await fetch(`/api/proceso-practicas/${procesoPracticasId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });

      if (res.ok) {
        setProceso(updateData);
      } else {
        setError("Error al actualizar");
      }
    } catch (err) {
      setError("Error al actualizar");
      console.error(err);
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

  if (!proceso) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">No se encontró el proceso de prácticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Header con toggle de Consultoría */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Proceso de Prácticas</h2>
            <p className="text-gray-600">Gestiona toda la información del proceso</p>
          </div>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={proceso.esConsultoria}
                onChange={handleToggleConsultoria}
                disabled={isSaving}
                className="w-4 h-4 rounded border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Es Consultoría</span>
            </label>
            {!isEditing ? (
              <button
                onClick={handleEntrarEdicion}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
              >
                Editar
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleGuardarEdicion}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm disabled:bg-green-400"
                >
                  {isSaving ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={handleCancelarEdicion}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-medium text-sm disabled:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="evaluacion">Evaluación</TabsTrigger>
          <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
          <TabsTrigger value="autoevaluacion">Auto-eval</TabsTrigger>
          <TabsTrigger value="arl">ARL</TabsTrigger>
          {proceso.esConsultoria && (
            <TabsTrigger value="certificado">Certificado</TabsTrigger>
          )}
          <TabsTrigger value="atlas">ATLAS</TabsTrigger>
          <TabsTrigger value="anexos">Anexos</TabsTrigger>
        </TabsList>

        {/* TAB: EVALUACIÓN */}
        <TabsContent value="evaluacion" className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Evaluación de Práctica</h3>

            <div className="space-y-4">
              {/* Notas 0-5 en Tabla */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Nota 1 (0-5)</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Nota 2 (0-5)</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Nota 3 (0-5)</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700">Nota 4 (0-5)</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-blue-50">Promedio</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {[1, 2, 3, 4].map((num) => (
                        <td key={num} className="border border-gray-300 px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              max="5"
                              step="0.1"
                              value={proceso.evaluacion && proceso.evaluacion[`nota${num}`] !== null ? proceso.evaluacion[`nota${num}`] : ""}
                              onChange={(e) => {
                                const newEvaluacion = proceso.evaluacion || { nota1: null, nota2: null, nota3: null, nota4: null, enlace: "", notasAdicionales: "" };
                                newEvaluacion[`nota${num}`] = e.target.value ? parseFloat(e.target.value) : null;
                                handleActualizarSeccion("evaluacion", newEvaluacion);
                              }}
                              disabled={isSaving}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-100 text-center"
                            />
                          ) : (
                            <div className="text-center font-medium text-gray-900">
                              {proceso.evaluacion && proceso.evaluacion[`nota${num}`] !== null ? proceso.evaluacion[`nota${num}`] : "-"}
                            </div>
                          )}
                        </td>
                      ))}
                      <td className="border border-gray-300 px-4 py-3 bg-blue-50 font-semibold text-center">
                        {(() => {
                          if (!proceso.evaluacion) return "-";
                          const notas = [1, 2, 3, 4]
                            .map((num) => proceso.evaluacion[`nota${num}`])
                            .filter((n) => n !== null && n !== undefined);
                          if (notas.length === 0) return "-";
                          const promedio = (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(2);
                          return `${promedio}/5`;
                        })()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Enlace */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enlace de evaluación
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={proceso.evaluacion ? proceso.evaluacion.enlace : ""}
                    onChange={(e) => {
                      const newEvaluacion = proceso.evaluacion || { nota1: null, nota2: null, nota3: null, nota4: null, enlace: "", notasAdicionales: "" };
                      newEvaluacion.enlace = e.target.value;
                      handleActualizarSeccion("evaluacion", newEvaluacion);
                    }}
                    disabled={isSaving}
                    placeholder="https://ejemplo.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-100"
                  />
                ) : (
                  <div className="px-3 py-2 text-gray-700">
                    {proceso.evaluacion && proceso.evaluacion.enlace ? (
                      <a href={proceso.evaluacion.enlace} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800 break-all">
                        {proceso.evaluacion.enlace}
                      </a>
                    ) : (
                      <span className="text-gray-500">Sin enlace</span>
                    )}
                  </div>
                )}
              </div>

              {/* Notas Adicionales */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas adicionales
                </label>
                {isEditing ? (
                  <textarea
                    value={proceso.evaluacion ? proceso.evaluacion.notasAdicionales : ""}
                    onChange={(e) => {
                      const newEvaluacion = proceso.evaluacion || { nota1: null, nota2: null, nota3: null, nota4: null, enlace: "", notasAdicionales: "" };
                      newEvaluacion.notasAdicionales = e.target.value;
                      handleActualizarSeccion("evaluacion", newEvaluacion);
                    }}
                    disabled={isSaving}
                    placeholder="Observaciones o comentarios..."
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-100 resize-none"
                  />
                ) : (
                  <div className="px-3 py-2 text-gray-700 bg-gray-50 rounded-lg min-h-24 whitespace-pre-wrap">
                    {proceso.evaluacion && proceso.evaluacion.notasAdicionales ? proceso.evaluacion.notasAdicionales : <span className="text-gray-500 italic">Sin notas adicionales</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB: SEGUIMIENTO */}
        <TabsContent value="seguimiento">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Seguimiento</h3>
            <ListaRecursos
              recursos={proceso.seguimiento || []}
              tipo="seguimiento"
              label="Documentos de Seguimiento"
              esEditable={isEditing}
              onChange={(datos) => handleActualizarSeccion("seguimiento", datos)}
            />
          </div>
        </TabsContent>

        {/* TAB: AUTO-EVALUACIÓN */}
        <TabsContent value="autoevaluacion">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Auto-evaluación del Estudiante</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-evaluación del Estudiante
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={typeof proceso.autoevaluacion === "string" ? proceso.autoevaluacion : ""}
                  onChange={(e) => handleActualizarSeccion("autoevaluacion", e.target.value)}
                  disabled={isSaving}
                  placeholder="Ej: Excelente desempeño, aprendí mucho..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-100"
                />
              ) : (
                <div className="px-3 py-2 text-gray-700 bg-gray-50 rounded-lg border border-gray-200">
                  {typeof proceso.autoevaluacion === "string" && proceso.autoevaluacion ? (
                    <p className="text-sm">{proceso.autoevaluacion}</p>
                  ) : (
                    <span className="text-gray-500 italic">Sin auto-evaluación registrada</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB: ARL */}
        <TabsContent value="arl">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">ARL (Afiliación a Riesgos Laborales)</h3>
            <DocumentoARL
              arlId={proceso.arlId}
              isEditing={isEditing}
              onArlChange={(data) => setArlData(data)}
            />
          </div>
        </TabsContent>

        {/* TAB: CERTIFICADO (Solo si esConsultoria) */}
        {proceso.esConsultoria && (
          <TabsContent value="certificado">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">URL de Certificado</h3>
              <RecursoPracticas
                recurso={proceso.certificado}
                tipo="certificado"
                label="Certificado de Consultoría"
                esEditable={isEditing}
                onChange={(datos) => handleActualizarSeccion("certificado", datos)}
              />
            </div>
          </TabsContent>
        )}

        {/* TAB: ATLAS */}
        <TabsContent value="atlas">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Conjunto de Archivos ATLAS</h3>
            <AtlasDocumentos
              atlasAutorizacionDocenteId={proceso.atlasAutorizacionDocenteId}
              atlasAutorizacionEstudianteId={proceso.atlasAutorizacionEstudianteId}
              atlasRelacionTrabosId={proceso.atlasRelacionTrabosId}
              isEditing={isEditing}
              onAtlasChange={(data) => setAtlasDataMap(data)}
            />
          </div>
        </TabsContent>

        {/* TAB: ANEXOS */}
        <TabsContent value="anexos">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Anexos</h3>
            <ListaRecursos
              recursos={proceso.anexos || []}
              tipo="anexos"
              label="Documentos Anexos"
              esEditable={isEditing}
              onChange={(datos) => handleActualizarSeccion("anexos", datos)}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
