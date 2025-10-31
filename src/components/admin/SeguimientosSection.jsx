import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Loader2, AlertCircle } from "lucide-react";
import SeguimientoForm from "./SeguimientoForm";
import SeguimientoDetalle from "./SeguimientoDetalle";

export default function SeguimientosSection({ grupoId, estudiantes = [] }) {
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingSeguimientoId, setEditingSeguimientoId] = useState(null);
  const [selectedSeguimientoId, setSelectedSeguimientoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalEliminar, setModalEliminar] = useState({ visible: false, seguimientoId: null });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    cargarSeguimientos();
  }, [grupoId]);

  const cargarSeguimientos = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/seguimientos-practicas/listar?grupoId=${grupoId}`);
      if (res.ok) {
        const data = await res.json();
        setSeguimientos(data.seguimientos || []);
      } else {
        setError("No se pudieron cargar los seguimientos");
      }
    } catch (err) {
      console.error("Error al cargar seguimientos:", err);
      setError("Error al cargar los seguimientos");
    } finally {
      setLoading(false);
    }
  };

  const handleCrearSeguimiento = async (titulo, descripcion) => {
    try {
      const res = await fetch("/api/seguimientos-practicas/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grupoId,
          titulo,
          descripcion
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSeguimientos([data.seguimiento, ...seguimientos]);
        setIsCreating(false);
        setSelectedSeguimientoId(data.seguimiento._id);
      } else {
        setError("Error al crear el seguimiento");
      }
    } catch (err) {
      console.error("Error al crear seguimiento:", err);
      setError("Error al crear el seguimiento");
    }
  };

  const handleEliminarSeguimiento = async (seguimientoId) => {
    try {
      setIsDeleting(true);
      setError("");

      const res = await fetch(`/api/seguimientos-practicas/${seguimientoId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        // Remover de la lista
        setSeguimientos(seguimientos.filter((s) => s._id !== seguimientoId));
        if (selectedSeguimientoId === seguimientoId) {
          setSelectedSeguimientoId(null);
        }
        setModalEliminar({ visible: false, seguimientoId: null });
      } else {
        setError("Error al eliminar el seguimiento");
      }
    } catch (err) {
      console.error("Error al eliminar seguimiento:", err);
      setError("Error al eliminar el seguimiento");
    } finally {
      setIsDeleting(false);
    }
  };


  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </div>
    );
  }

  const selectedSeguimiento = seguimientos.find((s) => s._id === selectedSeguimientoId);

  // Filtrar seguimientos según búsqueda
  const seguimientosFiltrados = seguimientos.filter((seg) =>
    seg.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seg.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Seguimientos */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Seguimientos</h3>
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                title="Crear seguimiento"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {isCreating && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <SeguimientoForm
                  onSubmit={handleCrearSeguimiento}
                  onCancel={() => setIsCreating(false)}
                />
              </div>
            )}

            {/* Buscador */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Buscar seguimiento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {seguimientosFiltrados.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  {searchTerm ? "No se encontraron seguimientos" : "Sin seguimientos aún"}
                </p>
              ) : (
                seguimientosFiltrados.map((seg) => (
                  <div
                    key={seg._id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedSeguimientoId === seg._id
                        ? "bg-blue-50 border-blue-300"
                        : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <div onClick={() => setSelectedSeguimientoId(seg._id)}>
                      <p className="font-medium text-gray-900 text-sm">{seg.titulo}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {seg.entradas?.length || 0} entradas
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(seg.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSeguimientoId(seg._id);
                        }}
                        className="flex-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        <Edit2 className="w-3 h-3 inline mr-1" />
                        Ver
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalEliminar({ visible: true, seguimientoId: seg._id });
                        }}
                        className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Detalle del Seguimiento */}
        <div className="lg:col-span-2">
          {selectedSeguimiento ? (
            <SeguimientoDetalle
              seguimiento={selectedSeguimiento}
              estudiantes={estudiantes}
              onActualizarSeguimiento={(seguimientoActualizado) => {
                setSeguimientos(
                  seguimientos.map((s) =>
                    s._id === seguimientoActualizado._id ? seguimientoActualizado : s
                  )
                );
              }}
            />
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <p className="text-center text-gray-500 py-12">
                Selecciona un seguimiento para verlo
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Eliminación */}
      {modalEliminar.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              ¿Eliminar seguimiento?
            </h3>
            <p className="text-gray-600 mb-6">
              Esta acción eliminará el seguimiento y todos los recursos asociados a él. Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setModalEliminar({ visible: false, seguimientoId: null })}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-medium disabled:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleEliminarSeguimiento(modalEliminar.seguimientoId)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:bg-red-400 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
