import React, { useState } from "react";
import { CheckCircle, XCircle, Eye, Calendar, User } from "lucide-react";
import Button from "../ui/Button";

export default function ValidacionPagoCard({ practicante, onValidar }) {
  const [showModal, setShowModal] = useState(false);
  const [accion, setAccion] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [loading, setLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const handleValidar = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/validacion-pago/validar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practicante_id: practicante._id,
          accion,
          comentarios
        })
      });

      if (res.ok) {
        onValidar();
        setShowModal(false);
        setComentarios("");
      } else {
        const data = await res.json();
        alert(data.error || "Error al validar pago");
      }
    } catch (error) {
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const openModal = (tipo) => {
    setAccion(tipo);
    setShowModal(true);
  };

  const comprobanteData = practicante.validacion_pago?.comprobante_url;
  const comprobanteUrl = comprobanteData
    ? `data:${comprobanteData.contentType};base64,${comprobanteData.data}`
    : null;

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
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pendiente
          </span>
        </div>

        <div className="space-y-2 mb-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Subido:{" "}
              {new Date(
                practicante.validacion_pago?.fecha_subida
              ).toLocaleDateString("es-ES")}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4" />
            <span>{practicante.correo_institucional}</span>
          </div>
        </div>

        <div className="mb-4">
          {comprobanteUrl && (
            <div
              className="relative cursor-pointer"
              onClick={() => setShowImageModal(true)}
            >
              <img
                src={comprobanteUrl}
                alt="Comprobante de pago"
                className="w-full h-48 object-cover rounded-lg border border-gray-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all flex items-center justify-center rounded-lg">
                <Eye className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => openModal("aprobar")}
            variant="success"
            icon={CheckCircle}
            className="flex-1"
          >
            Aprobar
          </Button>
          <Button
            onClick={() => openModal("rechazar")}
            variant="danger"
            icon={XCircle}
            className="flex-1"
          >
            Rechazar
          </Button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {accion === "aprobar" ? "Aprobar Pago" : "Rechazar Pago"}
            </h3>
            <p className="text-gray-600 mb-4">
              {accion === "aprobar"
                ? "¿Estás seguro de aprobar este pago? El practicante podrá continuar al siguiente paso."
                : "¿Estás seguro de rechazar este pago? Puedes agregar comentarios para el estudiante."}
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentarios {accion === "rechazar" && "(requerido)"}
              </label>
              <textarea
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Agrega comentarios adicionales..."
                required={accion === "rechazar"}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setComentarios("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <Button
                onClick={handleValidar}
                variant={accion === "aprobar" ? "success" : "danger"}
                loading={loading}
                className="flex-1"
                disabled={accion === "rechazar" && !comentarios.trim()}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}

      {showImageModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="max-w-4xl w-full">
            <img
              src={comprobanteUrl}
              alt="Comprobante de pago ampliado"
              className="w-full h-auto rounded-lg"
            />
            <p className="text-white text-center mt-4">
              Clic para cerrar
            </p>
          </div>
        </div>
      )}
    </>
  );
}
