import React, { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";

export default function AtlasDocumentos({
  atlasAutorizacionDocenteId = null,
  atlasAutorizacionEstudianteId = null,
  atlasRelacionTrabosId = null,
  isEditing = false,
  onAtlasChange = null
}) {
  const [documentos, setDocumentos] = useState({});
  const [loading, setLoading] = useState(true);

  const DOCUMENTOS_ATLAS = [
    { id: "autorizacionDocente", resourceId: atlasAutorizacionDocenteId, label: "Autorización de Publicación - Docente" },
    { id: "autorizacionEstudiante", resourceId: atlasAutorizacionEstudianteId, label: "Autorización de Publicación - Estudiante" },
    { id: "relacionTrabos", resourceId: atlasRelacionTrabosId, label: "Relación de Trabajos" }
  ];

  useEffect(() => {
    cargarDocumentos();
  }, [atlasAutorizacionDocenteId, atlasAutorizacionEstudianteId, atlasRelacionTrabosId]);

  const cargarDocumentos = async () => {
    try {
      setLoading(true);
      const docs = {};

      for (const doc of DOCUMENTOS_ATLAS) {
        if (doc.resourceId) {
          const res = await fetch(`/api/recursos/${doc.resourceId}`);
          if (res.ok) {
            const data = await res.json();
            docs[doc.id] = {
              ...data.recurso,
              titulo: data.recurso.titulo || doc.label
            };
          }
        }
      }

      setDocumentos(docs);
    } catch (err) {
      console.error("Error al cargar documentos ATLAS:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarDocumento = (documentoId, field, value) => {
    const docLabel = DOCUMENTOS_ATLAS.find((d) => d.id === documentoId)?.label || "";
    const updated = {
      ...documentos,
      [documentoId]: {
        ...documentos[documentoId],
        [field]: value,
        titulo: docLabel
      }
    };
    setDocumentos(updated);

    // Notify parent of changes
    if (onAtlasChange) {
      onAtlasChange(updated);
    }
  };

  const handleGuardarDocumento = async (documentoId, resourceId) => {
    if (!documentos[documentoId] || !resourceId) return;
    try {
      const res = await fetch(`/api/recursos/${resourceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(documentos[documentoId])
      });
      if (res.ok && onSave) {
        onSave();
      }
    } catch (err) {
      console.error(`Error al guardar documento ${documentoId}:`, err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {DOCUMENTOS_ATLAS.map((documento) => {
        const data = documentos[documento.id];

        if (!data) return null;

        return (
          <div key={documento.id} className="bg-gray-50 p-4 rounded-lg border border-gray-300">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold text-gray-800">{documento.label}</h4>
            </div>

            {/* Título (No editable) */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <div className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg border border-gray-300">
                <p className="text-sm font-medium">{documento.label}</p>
              </div>
            </div>

            {/* URL */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enlace
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={data.url || ""}
                  onChange={(e) => handleActualizarDocumento(documento.id, "url", e.target.value)}
                  placeholder="https://ejemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              ) : (
                <div className="px-3 py-2 text-gray-700">
                  {data.url ? (
                    <a
                      href={data.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-800 break-all text-sm"
                    >
                      {data.url}
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">Sin enlace</span>
                  )}
                </div>
              )}
            </div>

            {/* Verificado */}
            <div>
              {isEditing ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.verificado || false}
                    onChange={(e) => handleActualizarDocumento(documento.id, "verificado", e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm font-medium text-gray-700">Verificado</span>
                </label>
              ) : (
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${
                  data.verificado
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-200 text-gray-700"
                }`}>
                  {data.verificado ? (
                    <>
                      <Check className="w-4 h-4" /> Verificado
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" /> No verificado
                    </>
                  )}
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
