import React, { useState, useEffect } from "react";
import { Plus, AlertCircle, CheckCircle, Loader2, Eye, Edit2, Trash2 } from "lucide-react";
import ModalCrearGrupo from "./ModalCrearGrupo";

export default function GestorGrupos() {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [docentes, setDocentes] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    setError("");

    try {
      // Cargar grupos
      const resGrupos = await fetch("/api/grupos/listar");
      if (!resGrupos.ok) throw new Error("Error al cargar grupos");
      const datosGrupos = await resGrupos.json();
      setGrupos(datosGrupos.grupos || []);

      // Cargar docentes
      const resDocentes = await fetch("/api/usuarios/listar?rol=profesor");
      if (resDocentes.ok) {
        const datosDocentes = await resDocentes.json();
        setDocentes(datosDocentes.usuarios || []);
      }

      // Cargar estudiantes
      const resEstudiantes = await fetch("/api/usuarios/listar?rol=estudiante");
      if (resEstudiantes.ok) {
        const datosEstudiantes = await resEstudiantes.json();
        setEstudiantes(datosEstudiantes.usuarios || []);
      }
    } catch (err) {
      setError(err.message || "Error al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  const handleGrupoCreado = (nuevoGrupo) => {
    setGrupos([nuevoGrupo, ...grupos]);
    setSuccess("Grupo creado exitosamente");
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleEliminarGrupo = async (grupoId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este grupo?")) return;

    try {
      const res = await fetch(`/api/grupos/${grupoId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        setGrupos(grupos.filter(g => g._id !== grupoId));
        setSuccess("Grupo eliminado exitosamente");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Error al eliminar el grupo");
      }
    } catch (err) {
      setError("Error de conexión");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Grupos</h2>
          <p className="text-gray-600 text-sm mt-1">Crea y administra los grupos de prácticas</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-accent text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Crear Grupo
        </button>
      </div>

      {/* Tabla de grupos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {grupos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">No hay grupos creados aún</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Nombre del Grupo</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Docentes</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Estudiantes</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Observaciones</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {grupos.map((grupo) => (
                  <tr key={grupo._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{grupo.nombre}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {grupo.docentes && grupo.docentes.length > 0 ? (
                          grupo.docentes.map(docenteId => (
                            <span key={docenteId} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                              {docentes.find(d => d._id === docenteId)?.username || "ID"}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">Sin asignar</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {grupo.estudiantes && grupo.estudiantes.length > 0 ? (
                          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                            {grupo.estudiantes.length} estudiantes
                          </span>
                        ) : (
                          <span className="text-gray-500 text-sm">Sin asignar</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700 text-sm max-w-xs truncate">
                        {grupo.observaciones || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <a
                          href={`/admin/grupos/${grupo._id}`}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          Ver
                        </a>
                        <button
                          onClick={() => handleEliminarGrupo(grupo._id)}
                          className="inline-flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para crear grupo */}
      <ModalCrearGrupo
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onGrupoCreado={handleGrupoCreado}
        docentes={docentes}
        estudiantes={estudiantes}
      />
    </div>
  );
}
