import React, { useState } from "react";
import { UserPlus, CheckCircle, Calendar, Mail } from "lucide-react";
import Button from "../ui/Button";

export default function EstudiantePorCrearCard({ practicante, onCrear }) {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const generarPassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(pass);
    setError("");
  };

  const copiarAlPortapapeles = async (texto) => {
    try {
      await navigator.clipboard.writeText(texto);
      alert("Copiado al portapapeles");
    } catch (err) {
      console.error("Error al copiar:", err);
    }
  };

  const handleCrear = async () => {
    if (!password || password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/estudiantes/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practicante_id: practicante._id,
          password
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessData(data.usuario);
        setShowSuccess(true);
        onCrear();
        // Cerrar modal después de 3 segundos
        setTimeout(() => {
          setShowModal(false);
          setShowSuccess(false);
          setPassword("");
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Error al crear estudiante");
      }
    } catch (error) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              {practicante.nombres} {practicante.apellidos}
            </h3>
            <p className="text-sm text-gray-600">{practicante.programa}</p>
            <p className="text-sm text-gray-500">
              Doc: {practicante.numero_documento}
            </p>
          </div>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Pago Validado
          </span>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>
              Validado:{" "}
              {new Date(
                practicante.validacion_pago?.fecha_validacion
              ).toLocaleDateString("es-ES")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Por: {practicante.validacion_pago?.validado_por}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-4 h-4" />
            <span>{practicante.correo_institucional}</span>
          </div>
        </div>

        <Button
          onClick={() => setShowModal(true)}
          variant="primary"
          icon={UserPlus}
          className="w-full"
        >
          Crear Estudiante
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            {showSuccess ? (
              // Modal de éxito
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  ¡Estudiante Creado!
                </h3>
                <p className="text-gray-600 mb-4">
                  El usuario ha sido registrado correctamente.
                </p>

                {successData && (
                  <div className="bg-blue-50 rounded-lg p-4 text-left mb-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Usuario (Documento):</p>
                      <div className="flex gap-2 items-center mt-1">
                        <p className="text-sm font-mono bg-white p-2 rounded border border-blue-200 flex-1">
                          {successData.username}
                        </p>
                        <button
                          onClick={() => copiarAlPortapapeles(successData.username)}
                          className="px-2 py-2 bg-blue-100 hover:bg-blue-200 rounded transition-colors text-xs flex-shrink-0"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Correo Institucional (Email):</p>
                      <div className="flex gap-2 items-center mt-1">
                        <p className="text-sm font-mono bg-white p-2 rounded border border-blue-200 flex-1 break-all">
                          {successData.email}
                        </p>
                        <button
                          onClick={() => copiarAlPortapapeles(successData.email)}
                          className="px-2 py-2 bg-blue-100 hover:bg-blue-200 rounded transition-colors text-xs flex-shrink-0"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg mb-4">
                  ⚠️ Comunica las credenciales al estudiante de forma segura. El usuario es el documento de identidad y puede ingresar con documento o correo.
                </p>

                <p className="text-xs text-gray-500">
                  Ventana cerrándose en 3 segundos...
                </p>
              </div>
            ) : (
              // Modal de creación
              <>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  Crear Usuario Estudiante
                </h3>

                <div className="mb-4 p-4 bg-blue-50 rounded-lg space-y-2">
                  <p className="text-sm text-blue-900 font-medium">
                    {practicante.nombres} {practicante.apellidos}
                  </p>
                  <p className="text-xs text-blue-700">{practicante.programa}</p>
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <Mail className="w-4 h-4" />
                    <span className="break-all">{practicante.correo_institucional}</span>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {error}
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Documento de Identidad (Usuario) *
                    </label>
                    <input
                      type="text"
                      value={practicante.numero_documento}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Se usará como usuario de acceso
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correo Institucional (Email) *
                    </label>
                    <input
                      type="email"
                      value={practicante.correo_institucional}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      También se puede usar para acceder
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña Temporal *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                        placeholder="Mínimo 6 caracteres"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                        title={showPassword ? "Ocultar" : "Mostrar"}
                      >
                        {showPassword ? "👁️" : "🔒"}
                      </button>
                      <button
                        type="button"
                        onClick={generarPassword}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                      >
                        Generar
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Generará una contraseña segura de 12 caracteres
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setPassword("");
                      setError("");
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <Button
                    onClick={handleCrear}
                    variant="primary"
                    loading={loading}
                    className="flex-1"
                  >
                    Crear Estudiante
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
