import React, { useState } from "react";
import { X } from "lucide-react";

export default function SeguimientoForm({ onSubmit, onCancel, initialData = null }) {
  const [titulo, setTitulo] = useState(initialData?.titulo || "");
  const [descripcion, setDescripcion] = useState(initialData?.descripcion || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!titulo.trim()) {
      alert("El título es requerido");
      return;
    }
    onSubmit(titulo, descripcion);
    setTitulo("");
    setDescripcion("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título
        </label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej: Seguimiento Semana 1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción (opcional)
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Ej: Descripción del seguimiento..."
          rows="2"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
        >
          Crear
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
