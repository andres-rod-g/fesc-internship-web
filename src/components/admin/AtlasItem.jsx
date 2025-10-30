import React from "react";
import { Check, X } from "lucide-react";

export default function AtlasItem({
  title,
  enlace,
  verificado,
  isEditing,
  isSaving,
  onEnlaceChange,
  onVerificadoChange
}) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold text-gray-800">{title}</h4>

      {/* Enlace */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enlace
        </label>
        {isEditing ? (
          <input
            type="url"
            value={enlace}
            onChange={(e) => onEnlaceChange(e.target.value)}
            disabled={isSaving}
            placeholder="https://ejemplo.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-100"
          />
        ) : (
          <div className="px-3 py-2 text-gray-700">
            {enlace ? (
              <a href={enlace} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800 break-all text-sm">
                {enlace}
              </a>
            ) : (
              <span className="text-gray-500">Sin enlace</span>
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
              checked={verificado}
              onChange={(e) => onVerificadoChange(e.target.checked)}
              disabled={isSaving}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm font-medium text-gray-700">Verificado</span>
          </label>
        ) : (
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${
            verificado
              ? "bg-green-100 text-green-800"
              : "bg-gray-200 text-gray-700"
          }`}>
            {verificado ? (
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
