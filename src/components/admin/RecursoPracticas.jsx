import React, { useState } from "react";
import { Check, X } from "lucide-react";

export default function RecursoPracticas({
  recurso = {},
  tipo = "",
  label = "",
  esEditable = false,
  soloLectura = false,
  onChange = null,
  onVerificar = null
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    url: recurso.url || "",
    nota: recurso.nota || null,
    notasAdicionales: recurso.notasAdicionales || "",
    verificado: recurso.verificado || false
  });

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    // Auto-save immediately
    if (onChange) {
      onChange(newData);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleVerificar = async () => {
    const newData = { ...formData, verificado: !formData.verificado };
    setFormData(newData);
    // Auto-save immediately
    if (onChange) {
      onChange(newData);
    }
    if (onVerificar) {
      await onVerificar(tipo, !formData.verificado);
    }
  };

  if (soloLectura || !isEditing) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-start mb-3">
          <h4 className="font-semibold text-gray-800">{label}</h4>
          <div className="flex gap-2">
            {recurso.esVerificable && (
              <button
                onClick={handleVerificar}
                className={`px-3 py-1 rounded text-sm font-medium flex items-center gap-1 ${
                  formData.verificado
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {formData.verificado ? (
                  <>
                    <Check className="w-4 h-4" /> Verificado
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" /> No verificado
                  </>
                )}
              </button>
            )}
            {esEditable && !soloLectura && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                Editar
              </button>
            )}
          </div>
        </div>

        {formData.url && (
          <div className="mb-2">
            <p className="text-sm text-gray-600">Enlace:</p>
            <a
              href={formData.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:text-red-800 text-sm break-all"
            >
              {formData.url}
            </a>
          </div>
        )}

        {formData.nota !== null && (
          <div className="mb-2">
            <p className="text-sm text-gray-600">Nota:</p>
            <p className="text-lg font-semibold text-gray-900">{formData.nota}/5</p>
          </div>
        )}

        {formData.notasAdicionales && (
          <div>
            <p className="text-sm text-gray-600">Notas adicionales:</p>
            <p className="text-sm text-gray-700">{formData.notasAdicionales}</p>
          </div>
        )}

        {!formData.url && !formData.nota && !formData.notasAdicionales && (
          <p className="text-sm text-gray-500 italic">Sin información registrada</p>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-blue-200">
      <h4 className="font-semibold text-gray-800 mb-4">{label}</h4>

      <div className="space-y-4">
        {/* URL/Enlace */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enlace
          </label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => handleChange("url", e.target.value)}
            placeholder="https://ejemplo.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        {/* Nota */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nota (0-5)
          </label>
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.nota !== null ? formData.nota : ""}
            onChange={(e) => handleChange("nota", e.target.value ? parseFloat(e.target.value) : null)}
            placeholder="Ej: 4.5"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        {/* Notas Adicionales */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas adicionales
          </label>
          <textarea
            value={formData.notasAdicionales}
            onChange={(e) => handleChange("notasAdicionales", e.target.value)}
            placeholder="Observaciones o comentarios..."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
          />
        </div>

        {/* Botones */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            Guardar
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
