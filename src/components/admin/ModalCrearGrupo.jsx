import React, { useState } from "react";
import { AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import Combobox from "../ui/Combobox";

export default function ModalCrearGrupo({
  isOpen,
  onClose,
  onGrupoCreado,
  docentes,
  estudiantes
}) {
  const [form, setForm] = useState({
    nombre: "",
    docentes: [],
    estudiantes: [],
    observaciones: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
  };

  const handleDocentesChange = (selectedValues) => {
    setForm({ ...form, docentes: selectedValues });
  };

  const handleEstudiantesChange = (selectedValues) => {
    setForm({ ...form, estudiantes: selectedValues });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.nombre.trim()) {
      setError("El nombre del grupo es requerido");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/grupos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        const data = await res.json();
        onGrupoCreado(data.grupo);
        setForm({
          nombre: "",
          docentes: [],
          estudiantes: [],
          observaciones: ""
        });
        onClose();
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear el grupo");
      }
    } catch (err) {
      setError("Error de conexión al servidor");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-800">Crear Nuevo Grupo</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre del grupo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Grupo *
            </label>
            <input
              type="text"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              placeholder="Ej: Grupo A - Desarrollo Web"
              required
            />
          </div>

          {/* Docentes */}
          <Combobox
            label="Docentes"
            options={docentes.map(docente => ({
              value: docente._id,
              label: `${docente.nombres} ${docente.apellidos}`,
              sublabel: `@${docente.username}`
            }))}
            value={form.docentes}
            onChange={handleDocentesChange}
            placeholder="Busca y selecciona docentes..."
            multiple={true}
            debounceDelay={300}
            maxResults={10}
          />

          {/* Estudiantes */}
          <Combobox
            label="Estudiantes"
            options={estudiantes.map(estudiante => ({
              value: estudiante._id,
              label: `${estudiante.nombres} ${estudiante.apellidos}`,
              sublabel: `@${estudiante.username}`
            }))}
            value={form.estudiantes}
            onChange={handleEstudiantesChange}
            placeholder="Busca y selecciona estudiantes..."
            multiple={true}
            debounceDelay={300}
            maxResults={10}
          />

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm resize-none"
              placeholder="Añade observaciones o descripción del grupo..."
              rows="3"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creando..." : "Crear Grupo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
