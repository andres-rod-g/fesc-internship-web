import React, { useState } from "react";
import { Plus, Trash2, Check, X } from "lucide-react";
import { getEstadoColors, ESTADOS_RECURSO_LABELS } from "~/utils/estadosRecursos";

export default function ListaRecursos({
  recursos = [],
  tipo = "",
  label = "",
  esEditable = false,
  onChange = null,
  tituloFijo = null
}) {
  const [isEditing, setIsEditing] = useState(false);
  // Asegurar que recursos sea siempre un array
  const recursosArray = Array.isArray(recursos) ? recursos : [];
  const [recursos_local, setRecursos_local] = useState(recursosArray);

  const handleAgregarRecurso = () => {
    const newRecurso = {
      id: Date.now().toString(),
      titulo: "",
      url: "",
      nota: null,
      notasAdicionales: "",
      estado: "pendiente"
    };
    const updated = [...recursos_local, newRecurso];
    setRecursos_local(updated);
  };

  const handleEliminarRecurso = (id) => {
    const updated = recursos_local.filter((r) => r.id !== id);
    setRecursos_local(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  const handleCambioRecurso = (id, field, value) => {
    const updated = recursos_local.map((r) =>
      r.id === id ? { ...r, [field]: value } : r
    );
    setRecursos_local(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  const handleGuardar = () => {
    if (onChange) {
      onChange(recursos_local);
    }
    setIsEditing(false);
  };

  const handleCancelar = () => {
    setRecursos_local(recursosArray);
    setIsEditing(false);
  };

  const handleCambiarEstado = (id) => {
    // Cycle through states: pendiente -> validado -> rechazado -> pendiente
    const estadoCiclo = {
      pendiente: "validado",
      validado: "rechazado",
      rechazado: "pendiente"
    };
    const updated = recursos_local.map((r) => {
      if (r.id === id) {
        const nuevoEstado = estadoCiclo[r.estado || "pendiente"] || "validado";
        return { ...r, estado: nuevoEstado };
      }
      return r;
    });
    setRecursos_local(updated);
    if (onChange) {
      onChange(updated);
    }
  };

  if (!isEditing) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-semibold text-gray-800">{label}</h4>
          {esEditable && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1 rounded text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              Editar
            </button>
          )}
        </div>

        {recursos_local.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Sin recursos registrados</p>
        ) : (
          <div className="space-y-3">
            {recursos_local.map((recurso) => (
              <div key={recurso.id} className="bg-white p-3 rounded border border-gray-300">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="flex-1">
                    {recurso.titulo && (
                      <h5 className="font-semibold text-gray-800 mb-1">{recurso.titulo}</h5>
                    )}
                    {recurso.url && (
                      <a
                        href={recurso.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-600 hover:text-red-800 text-sm break-all block mb-1"
                      >
                        {recurso.url}
                      </a>
                    )}
                    {recurso.nota !== null && (
                      <p className="text-sm text-gray-600">
                        Nota: <span className="font-semibold">{recurso.nota}/5</span>
                      </p>
                    )}
                    {recurso.notasAdicionales && (
                      <p className="text-sm text-gray-600 mt-1">{recurso.notasAdicionales}</p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getEstadoColors(recurso.estado || "pendiente").bg} ${getEstadoColors(recurso.estado || "pendiente").text}`}>
                    {ESTADOS_RECURSO_LABELS[recurso.estado || "pendiente"]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg border border-blue-200">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-semibold text-gray-800">{label}</h4>
        <button
          onClick={handleAgregarRecurso}
          className="px-3 py-1 rounded text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200 flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      <div className="space-y-4">
        {recursos_local.map((recurso) => (
          <div key={recurso.id} className="bg-gray-50 p-4 rounded border border-gray-300">
            <div className="flex justify-between items-start mb-3">
              <h5 className="font-medium text-gray-800">Recurso</h5>
              <button
                onClick={() => handleEliminarRecurso(recurso.id)}
                className="text-red-600 hover:text-red-800"
                title="Eliminar recurso"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Título */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título
              </label>
              {tituloFijo ? (
                <div className="px-3 py-2 text-gray-700 bg-gray-100 rounded-lg border border-gray-300">
                  <p className="text-sm font-medium">{tituloFijo}</p>
                </div>
              ) : (
                <input
                  type="text"
                  value={recurso.titulo}
                  onChange={(e) => handleCambioRecurso(recurso.id, "titulo", e.target.value)}
                  placeholder="Ej: Informe Final, Certificado, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              )}
            </div>

            {/* URL */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enlace
              </label>
              <input
                type="url"
                value={recurso.url}
                onChange={(e) => handleCambioRecurso(recurso.id, "url", e.target.value)}
                placeholder="https://ejemplo.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            {/* Nota */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nota (0-5)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={recurso.nota !== null ? recurso.nota : ""}
                onChange={(e) =>
                  handleCambioRecurso(recurso.id, "nota", e.target.value ? parseFloat(e.target.value) : null)
                }
                placeholder="Ej: 4.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            {/* Notas Adicionales */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas adicionales
              </label>
              <textarea
                value={recurso.notasAdicionales}
                onChange={(e) =>
                  handleCambioRecurso(recurso.id, "notasAdicionales", e.target.value)
                }
                placeholder="Observaciones o comentarios..."
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado de Validación</label>
              <button
                onClick={() => handleCambiarEstado(recurso.id)}
                type="button"
                className={`px-3 py-2 rounded-lg text-sm font-medium ${getEstadoColors(recurso.estado || "pendiente").bg} ${getEstadoColors(recurso.estado || "pendiente").text} hover:opacity-80`}
              >
                {ESTADOS_RECURSO_LABELS[recurso.estado || "pendiente"]} (click para cambiar)
              </button>
            </div>
          </div>
        ))}

        {recursos_local.length === 0 && (
          <p className="text-sm text-gray-500 italic text-center py-6">
            Sin recursos. Haz clic en "Agregar" para crear uno.
          </p>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-2 pt-4 border-t border-gray-200 mt-4">
        <button
          onClick={handleGuardar}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          Guardar
        </button>
        <button
          onClick={handleCancelar}
          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
