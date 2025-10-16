import React, { useState } from "react";
import { X, Loader2, AlertCircle, Check, Copy, Eye, EyeOff } from "lucide-react";

export default function ModalEditarUsuario({ usuario, isOpen, onClose, onSave }) {
  const [editForm, setEditForm] = useState({
    nombres: usuario?.nombres || "",
    apellidos: usuario?.apellidos || "",
    email: usuario?.email || ""
  });
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  if (!isOpen) return null;

  const handleSaveEdit = async () => {
    // Validar que al menos uno de los campos tenga contenido
    if (!editForm.nombres?.trim() && !editForm.apellidos?.trim() && !editForm.email?.trim()) {
      setEditError("Debe llenar al menos un campo");
      return;
    }

    // Validar email si se proporciona
    if (editForm.email?.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) {
        setEditError("Email inválido");
        return;
      }
    }

    try {
      setEditLoading(true);
      setEditError("");

      const res = await fetch(`/api/usuarios/${usuario._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombres: editForm.nombres || "",
          apellidos: editForm.apellidos || "",
          email: editForm.email || null
        })
      });

      if (res.ok) {
        onSave();
        onClose();
      } else {
        const data = await res.json();
        setEditError(data.error || "Error al actualizar usuario");
      }
    } catch (error) {
      setEditError("Error de conexión");
    } finally {
      setEditLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!window.confirm("¿Estás seguro de que quieres generar una nueva contraseña para este usuario?")) {
      return;
    }

    try {
      setResetPasswordLoading(true);
      setEditError("");
      setNewPassword("");

      const res = await fetch(`/api/usuarios/${usuario._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        const data = await res.json();
        setNewPassword(data.newPassword);
      } else {
        const data = await res.json();
        setEditError(data.error || "Error al reasignar contraseña");
      }
    } catch (error) {
      setEditError("Error de conexión");
    } finally {
      setResetPasswordLoading(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(newPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Editar Usuario</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Usuario Info */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Usuario</p>
            <p className="text-lg font-semibold text-gray-800">{usuario.username}</p>
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombres
              </label>
              <input
                type="text"
                value={editForm.nombres}
                onChange={(e) => setEditForm({ ...editForm, nombres: e.target.value })}
                placeholder="Nombres"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Apellidos
              </label>
              <input
                type="text"
                value={editForm.apellidos}
                onChange={(e) => setEditForm({ ...editForm, apellidos: e.target.value })}
                placeholder="Apellidos"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>

          {/* Error message */}
          {editError && (
            <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {editError}
            </div>
          )}

          {/* New Password Display */}
          {newPassword && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-green-700">
                <Check className="w-5 h-5" />
                <p className="font-semibold">Contraseña generada exitosamente</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Nueva contraseña:</p>
                <div className="flex items-center gap-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={handleCopyPassword}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Copiar contraseña"
                  >
                    {passwordCopied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-600 bg-white px-2 py-1 rounded border border-gray-200">
                ⚠️ Comunica esta contraseña de forma segura al usuario. No se volverá a mostrar.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveEdit}
              disabled={editLoading || resetPasswordLoading}
              className="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {editLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar cambios"
              )}
            </button>

            <button
              onClick={handleResetPassword}
              disabled={editLoading || resetPasswordLoading}
              className="w-full px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {resetPasswordLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : (
                "Generar nueva contraseña"
              )}
            </button>

            <button
              onClick={onClose}
              disabled={editLoading || resetPasswordLoading}
              className="w-full px-4 py-2 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 font-medium border border-gray-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
