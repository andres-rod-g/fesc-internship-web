import React, { useState } from "react";
import { UserPlus, AlertCircle, CheckCircle, Loader2, Eye, Lock } from "lucide-react";
import Button from "../ui/Button";

export default function CrearUsuarioForm({ onUsuarioCreado }) {
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
  const [success, setSuccess] = useState("");

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

  const copiarAlPortapapeles = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      alert("Copiado al portapapeles");
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validaciones
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
        setSuccess(`Usuario creado exitosamente: ${form.username}`);

        // Limpiar formulario
        setForm({
          username: "",
          email: "",
          password: "",
          nombres: "",
          apellidos: "",
          role: "registro_control"
        });

        // Notificar al componente padre
        if (onUsuarioCreado) {
          onUsuarioCreado(data.user);
        }

        // Limpiar éxito después de 3 segundos
        setTimeout(() => {
          setSuccess("");
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Crear Nuevo Usuario</h3>
            <p className="text-sm text-gray-600">Registra un nuevo usuario con diferentes roles</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información Personal */}
        <div className="border-b border-gray-200 pb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Información Personal</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombres
              </label>
              <input
                type="text"
                name="nombres"
                value={form.nombres}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Juan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos
              </label>
              <input
                type="text"
                name="apellidos"
                value={form.apellidos}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Pérez"
              />
            </div>
          </div>
        </div>

        {/* Credenciales */}
        <div className="border-b border-gray-200 pb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Credenciales</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de Usuario *
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="juan.perez"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="juan@fesc.edu.co"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña *
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  title={showPassword ? "Ocultar" : "Mostrar"}
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={generarPassword}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Generar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Se generará una contraseña segura de 12 caracteres
            </p>
          </div>
        </div>

        {/* Rol */}
        <div className="pb-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Asignar Rol *</h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {rolesDisponibles.map((rol) => (
              <label
                key={rol.value}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  form.role === rol.value
                    ? "border-accent bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="role"
                  value={rol.value}
                  checked={form.role === rol.value}
                  onChange={handleChange}
                  className="w-4 h-4"
                  required
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{rol.label}</p>
                  <p className={`text-xs px-2 py-1 rounded w-fit mt-1 ${rol.color}`}>
                    {rol.value === "admin"
                      ? "Acceso total al sistema"
                      : rol.value === "registro_control"
                      ? "Gestión de preinscripciones"
                      : "Acceso limitado"}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Botón Submit */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="reset"
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Creando..." : "Crear Usuario"}
          </button>
        </div>
      </form>
    </div>
  );
}
