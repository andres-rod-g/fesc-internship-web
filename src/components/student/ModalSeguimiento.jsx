import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";

export default function ModalSeguimiento({ isOpen, seguimiento, onClose, onSave }) {
  const [formData, setFormData] = useState({
    url: "",
    notasAdicionales: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Actualizar formData cuando seguimiento cambia
  useEffect(() => {
    if (seguimiento?.recurso) {
      setFormData({
        url: seguimiento.recurso.url || "",
        notasAdicionales: seguimiento.recurso.notasAdicionales || ""
      });
      setError("");
      setSuccess("");
    }
  }, [seguimiento]);

  if (!isOpen || !seguimiento) return null;

  if (!seguimiento.recurso) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
          <div className="p-6 text-center">
            <p className="text-gray-600">No hay recurso asociado a este seguimiento</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-accent text-white rounded-lg"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!formData.url.trim()) {
        setError("El enlace es requerido");
        return;
      }

      // Guardar el recurso y cambiar estado a pendiente
      const response = await fetch(`/api/recursos/${seguimiento.recurso._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: formData.url.trim(),
          notasAdicionales: formData.notasAdicionales.trim(),
          estado: "pendiente"
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || "Error al guardar");
      }

      setSuccess("Seguimiento actualizado correctamente");
      setTimeout(() => {
        onSave();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !seguimiento) return null;

  const estado = seguimiento.estado;
  const estadoColor = estado === "validado" ? "green" :
                     estado === "rechazado" ? "red" :
                     "yellow";
  const estadoLabel = estado === "validado" ? "Validado" :
                     estado === "rechazado" ? "Rechazado" :
                     "Pendiente";

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800">{seguimiento.titulo}</h2>
            <p className="text-sm text-gray-600 mt-1">{seguimiento.descripcion}</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Estado Badge */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Estado:</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              estadoColor === "green" ? "bg-green-100 text-green-700" :
              estadoColor === "red" ? "bg-red-100 text-red-700" :
              "bg-yellow-100 text-yellow-700"
            }`}>
              {estadoLabel}
            </span>
          </div>

          {/* URL Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enlace del Seguimiento
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleInputChange}
              disabled={loading || estado === "validado"}
              placeholder="https://ejemplo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {estado === "validado" && (
              <p className="text-xs text-gray-500 mt-1">No puedes modificar un seguimiento validado</p>
            )}
          </div>

          {/* Notas Adicionales */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              name="notasAdicionales"
              value={formData.notasAdicionales}
              onChange={handleInputChange}
              disabled={loading || estado === "validado"}
              placeholder="Observaciones o comentarios adicionales..."
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          {/* ID Info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-xs text-gray-600">ID del Recurso: <span className="font-mono">{seguimiento.recurso._id}</span></p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          {estado !== "validado" && (
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Guardar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
