import React, { useState, useEffect, useRef } from "react";
import { Users, Loader2, AlertCircle, User, Mail, Calendar, Search, Filter, Trash2, Edit2 } from "lucide-react";
import ModalEditarUsuario from "./ModalEditarUsuario";

export default function ListaUsuarios({ refresh }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [rolFiltro, setRolFiltro] = useState("todos");
  const [searchLoading, setSearchLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState(null);
  const debounceTimer = useRef(null);

  const buscarUsuarios = async (term, rol) => {
    try {
      setSearchLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (term) params.append("q", term);
      if (rol && rol !== "todos") params.append("rol", rol);

      const res = await fetch(`/api/usuarios/buscar?${params}`);

      if (res.ok) {
        const data = await res.json();
        setUsuarios(data.usuarios || []);
      } else {
        const data = await res.json();
        setError(data.error || "Error al buscar usuarios");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setSearchLoading(false);
    }
  };

  const obtenerUsuarios = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/usuarios/listar");

      if (res.ok) {
        const data = await res.json();
        setUsuarios(data.usuarios || []);
      } else {
        const data = await res.json();
        setError(data.error || "Error al cargar usuarios");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, [refresh]);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      buscarUsuarios(searchTerm, rolFiltro);
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm, rolFiltro]);

  const getRolColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "registro_control":
        return "bg-blue-100 text-blue-800";
      case "estudiante":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRolLabel = (role) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "registro_control":
        return "Registro y Control";
      case "estudiante":
        return "Estudiante";
      default:
        return role;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const handleOpenEditModal = (usuario) => {
    setSelectedUsuario(usuario);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUsuario(null);
  };

  const handleModalSave = async () => {
    // Refresh the list after saving
    await buscarUsuarios(searchTerm, rolFiltro);
  };

  const handleDeleteUsuario = async (usuarioId, username) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar el usuario "${username}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/usuarios/${usuarioId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        setUsuarios(usuarios.filter(u => u._id !== usuarioId));
        alert("Usuario eliminado exitosamente");
      } else {
        const data = await res.json();
        alert(data.error || "Error al eliminar usuario");
      }
    } catch (error) {
      alert("Error de conexión");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Usuarios del Sistema</h3>
            <p className="text-sm text-gray-600">
              Total: {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <button
          onClick={obtenerUsuarios}
          disabled={loading}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
        >
          {loading ? "Cargando..." : "Actualizar"}
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 space-y-4">
        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
          />
        </div>

        {/* Filtro por rol */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <select
            value={rolFiltro}
            onChange={(e) => setRolFiltro(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Administrador</option>
            <option value="registro_control">Registro y Control</option>
            <option value="estudiante">Estudiante</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !error ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
        </div>
      ) : (loading || searchLoading) && usuarios.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p>No hay usuarios que coincidan con los filtros</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Usuario</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rol</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Creado</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => (
                <tr key={usuario._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{usuario.username}</p>
                        {usuario.nombres && (
                          <p className="text-xs text-gray-600">
                            {usuario.nombres} {usuario.apellidos || ""}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {usuario.email ? (
                        <>
                          <Mail className="w-4 h-4" />
                          {usuario.email}
                        </>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getRolColor(usuario.role)}`}>
                      {getRolLabel(usuario.role)}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(usuario.createdAt)}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEditModal(usuario)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar usuario"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUsuario(usuario._id, usuario.username)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Editar Usuario */}
      {selectedUsuario && (
        <ModalEditarUsuario
          usuario={selectedUsuario}
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
}
