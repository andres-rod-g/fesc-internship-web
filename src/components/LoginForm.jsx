import React, { useState } from "react";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!username || !password) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    setError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        document.cookie = `token=${data.token}; path=/;`;
        setError("");
        setSuccess("Inicio de sesión exitoso.");
        setTimeout(() => {
          window.location.href = "/admin/dashboard";
        }, 500);
      } else {
        setError(data.error || "Error de autenticación");
        setSuccess("");
      }
    } catch (err) {
      setError("Error de conexión");
    }
  };

  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit} autoComplete="off">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Bienvenido</h2>
        <p className="text-gray-600">Ingresa tus credenciales para acceder</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Usuario
          </label>
          <input
            id="username"
            type="text"
            placeholder="Ingresa tu usuario"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            placeholder="Ingresa tu contraseña"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            {success}
          </div>
        </div>
      )}
      
      <button
        type="submit"
        className="w-full bg-accent text-white rounded-lg px-4 py-3 font-semibold hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={!!success}
      >
        {success ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Ingresando...
          </div>
        ) : (
          "Iniciar Sesión"
        )}
      </button>
    </form>
  );
}
