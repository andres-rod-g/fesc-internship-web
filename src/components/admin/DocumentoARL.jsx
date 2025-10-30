import React, { useState, useEffect } from "react";
import { Check, X, Loader2 } from "lucide-react";

export default function DocumentoARL({
  arlId = null,
  isEditing = false,
  onArlChange = null
}) {
  const [arlLocal, setArlLocal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (arlId) {
      cargarRecurso();
    }
  }, [arlId]);

  const cargarRecurso = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/recursos/${arlId}`);
      if (res.ok) {
        const data = await res.json();
        const recursoData = {
          ...data.recurso,
          titulo: data.recurso.titulo || "Afiliación de ARL"
        };
        setArlLocal(recursoData);
      }
    } catch (err) {
      console.error("Error al cargar ARL:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarARL = (field, value) => {
    const updated = {
      ...arlLocal,
      [field]: value,
      titulo: "Afiliación de ARL"
    };
    setArlLocal(updated);
    // Notificar al componente padre que los datos han cambiado
    if (onArlChange) {
      onArlChange(updated);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  if (!arlLocal) {
    return <div className="text-gray-500">No se encontró el recurso ARL</div>;
  }

  return (
    <div className={isEditing ? "bg-white p-4 rounded-lg border border-blue-200" : "bg-gray-50 p-4 rounded-lg border border-gray-200"}>
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-semibold text-gray-800">Afiliación de ARL</h4>
      </div>

      {/* Título (No editable) */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Título
        </label>
        <div className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg border border-gray-300">
          <p className="text-sm font-medium">Afiliación de ARL</p>
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
            value={arlLocal.url || ""}
            onChange={(e) => handleActualizarARL("url", e.target.value)}
            placeholder="https://ejemplo.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        ) : (
          <div className="px-3 py-2 text-gray-700">
            {arlLocal.url ? (
              <a
                href={arlLocal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-600 hover:text-red-800 break-all text-sm"
              >
                {arlLocal.url}
              </a>
            ) : (
              <span className="text-gray-500 text-sm">Sin enlace</span>
            )}
          </div>
        )}
      </div>

      {/* Nota */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nota (0-5)
        </label>
        {isEditing ? (
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={arlLocal.nota !== null && arlLocal.nota !== undefined ? arlLocal.nota : ""}
            onChange={(e) => handleActualizarARL("nota", e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="Ej: 4.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        ) : (
          <div className="px-3 py-2 text-gray-700">
            {arlLocal.nota !== null && arlLocal.nota !== undefined ? (
              <p className="text-sm font-medium">{arlLocal.nota}/5</p>
            ) : (
              <span className="text-gray-500 text-sm">Sin nota</span>
            )}
          </div>
        )}
      </div>

      {/* Notas Adicionales */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas adicionales
        </label>
        {isEditing ? (
          <textarea
            value={arlLocal.notasAdicionales || ""}
            onChange={(e) => handleActualizarARL("notasAdicionales", e.target.value)}
            placeholder="Observaciones o comentarios..."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
          />
        ) : (
          <div className="px-3 py-2 text-gray-700 bg-white rounded-lg min-h-16 whitespace-pre-wrap">
            {arlLocal.notasAdicionales ? (
              <p className="text-sm">{arlLocal.notasAdicionales}</p>
            ) : (
              <span className="text-gray-500 text-sm italic">Sin notas adicionales</span>
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
              checked={arlLocal.verificado || false}
              onChange={(e) => handleActualizarARL("verificado", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Verificado</span>
          </label>
        ) : (
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${
            arlLocal.verificado
              ? "bg-green-100 text-green-800"
              : "bg-gray-200 text-gray-700"
          }`}>
            {arlLocal.verificado ? (
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
}
