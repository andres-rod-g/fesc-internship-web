import React, { useState } from "react";

export default function RecursoSeguimiento({
  recurso = {},
  label = "",
  onChange = null
}) {
  const [formData, setFormData] = useState({
    url: recurso.url || "",
    nota: recurso.nota || null,
    notasAdicionales: recurso.notasAdicionales || ""
  });

  const handleChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    // Auto-save immediately
    if (onChange) {
      onChange(newData);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-blue-200 space-y-4">
      <h4 className="font-semibold text-gray-800">{label}</h4>

      {/* URL/Enlace */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Enlace <span className="text-red-600">*</span>
        </label>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => handleChange("url", e.target.value)}
          placeholder="https://ejemplo.com"
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${
            !formData.url
              ? "border-red-300 focus:ring-red-300"
              : "border-gray-300 focus:ring-accent"
          }`}
        />
        {!formData.url && (
          <p className="text-red-600 text-sm mt-1">Este campo es requerido</p>
        )}
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
          Observaciones
        </label>
        <textarea
          value={formData.notasAdicionales}
          onChange={(e) => handleChange("notasAdicionales", e.target.value)}
          placeholder="Observaciones o comentarios..."
          rows="2"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
        />
      </div>
    </div>
  );
}
