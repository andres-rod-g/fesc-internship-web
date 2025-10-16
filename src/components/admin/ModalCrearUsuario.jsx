import React, { useState } from "react";
import { UserPlus, AlertCircle, CheckCircle, Loader2, Eye, Lock } from "lucide-react";
import Button from "../ui/Button";

export default function ModalCrearUsuario({ isOpen, onClose, onUsuarioCreado }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    nombres: "",
    apellidos: "",
    role: "registro_control"
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const rolesDisponibles = [
    { value: "admin", label: "Administrador", color: "bg-red-100 text-red-800" },
    { value: "registro_control", label: "Registro y Control", color: "bg-blue-100 text-blue-800" },
    { value: "estudiante", label: "Estudiante", color: "bg-green-100 text-green-800" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError("");
  };

  const generarPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setForm({ ...form, password: pass });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.password || !form.role) {
      setError("Usuario, contraseña y rol son requeridos");
      return;
    }

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) {
      setError("Por favor ingresa un email válido");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/usuarios/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessData(data.user);
        setShowSuccess(true);
        onUsuarioCreado(data.user);

        // Cerrar después de 3 segundos
        setTimeout(() => {
          handleClose();
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear usuario");
      }
    } catch (error) {
      setError("Error de conexión al servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      username: "",
      email: "",
      password: "",
      nombres: "",
      apellidos: "",
      role: "registro_control"
    });
    setError("");
    setShowPassword(false);
    setShowSuccess(false);
    setSuccessData(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-screen overflow-y-auto p-6">
        {showSuccess ? (
          // Modal de éxito
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              ¡Usuario Creado!
            </h3>
            <p className="text-gray-600 mb-4">
              Las credenciales han sido registradas correctamente en el sistema.
            </p>

            {successData && (
              <div className="bg-blue-50 rounded-lg p-4 text-left mb-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Usuario:</p>
                  <p className="text-sm font-mono bg-white p-2 rounded border border-blue-200 mt-1">
                    {successData.username}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 font-semibold">Rol:</p>
                  <p className="text-sm font-mono bg-white p-2 rounded border border-blue-200 mt-1">
                    {rolesDisponibles.find(r => r.value === successData.role)?.label || successData.role}
                  </p>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mb-3">
              La contraseña NO se muestra por seguridad. Se registró correctamente.
            </p>

            <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
              ⚠️ Comunica las credenciales al usuario de forma segura
            </p>
          </div>
        ) : (
          // Modal de creación
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">Crear Nuevo Usuario</h3>
              <p className="text-sm text-gray-600 mt-1">Registra un usuario con diferentes roles</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Nombres y Apellidos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombres
              </label>
              <input
                type="text"
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                placeholder="Juan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Apellidos
              </label>
              <input
                type="text"
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                placeholder="Pérez"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Usuario *
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                placeholder="juan.perez"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                placeholder="juan@fesc.edu.co"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={generarPassword}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Generar
                </button>
              </div>
            </div>

            {/* Rol */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rol *
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
                required
              >
                {rolesDisponibles.map((rol) => (
                  <option key={rol.value} value={rol.value}>
                    {rol.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? "Creando..." : "Crear"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
