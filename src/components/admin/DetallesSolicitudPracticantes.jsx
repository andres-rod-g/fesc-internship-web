import React, { useState } from "react";
import { AlertCircle, CheckCircle, Loader2, Check, X, ArrowLeft } from "lucide-react";

export default function DetallesSolicitudPracticantes({ solicitud: initialSolicitud }) {
  const [solicitud, setSolicitud] = useState(initialSolicitud);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notas, setNotas] = useState(initialSolicitud.notas_director || "");

  const handleEstadoChange = async (nuevoEstado) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/solicitudes-practicantes/${solicitud._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: nuevoEstado,
          notas_director: notas
        })
      });

      if (res.ok) {
        setSolicitud({ ...solicitud, estado: nuevoEstado, notas_director: notas });
        setSuccess(`Solicitud actualizada a: ${nuevoEstado}`);
      } else {
        const data = await res.json();
        setError(data.error || "Error al actualizar");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarNotas = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/solicitudes-practicantes/${solicitud._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: solicitud.estado,
          notas_director: notas
        })
      });

      if (res.ok) {
        setSolicitud({ ...solicitud, notas_director: notas });
        setSuccess("Notas guardadas correctamente");
      } else {
        const data = await res.json();
        setError(data.error || "Error al guardar notas");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente_revision: "bg-yellow-100 text-yellow-800",
      en_revision: "bg-blue-100 text-blue-800",
      aprobada: "bg-green-100 text-green-800",
      rechazada: "bg-red-100 text-red-800"
    };
    const labels = {
      pendiente_revision: "Pendiente Revisión",
      en_revision: "En Revisión",
      aprobada: "Aprobada",
      rechazada: "Rechazada"
    };
    return {
      className: badges[estado] || "bg-gray-100 text-gray-800",
      label: labels[estado] || estado
    };
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

  const badge = getEstadoBadge(solicitud.estado);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {solicitud.nombre_empresa}
            </h1>
            <p className="text-gray-600">NIT: {solicitud.nit}</p>
          </div>
          <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Recibida: {formatDate(solicitud.createdAt)}
        </p>
      </div>

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

      {/* Información de la Empresa */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Información de la Empresa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nombre Empresa</p>
            <p className="text-lg font-medium text-gray-900">{solicitud.nombre_empresa}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">NIT</p>
            <p className="text-lg font-medium text-gray-900">{solicitud.nit}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Representante Legal</p>
            <p className="text-lg font-medium text-gray-900">{solicitud.representante_legal}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Sector Económico</p>
            <p className="text-lg font-medium text-gray-900">{solicitud.sector_economico}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Tamaño Empresa</p>
            <p className="text-lg font-medium text-gray-900">{solicitud.tamano_empresa}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Actividad Económica</p>
            <p className="text-lg font-medium text-gray-900">{solicitud.actividad_economica}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Dirección</p>
            <p className="text-lg font-medium text-gray-900">{solicitud.direccion}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Teléfonos</p>
            <p className="text-lg font-medium text-gray-900">{solicitud.telefonos}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600 mb-1">Página Web</p>
            <p className="text-lg font-medium text-gray-900">{solicitud.pagina_web || "No especificada"}</p>
          </div>
          <div className="md:col-span-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <Check className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Convenio Vigente: {solicitud.convenio_vigente ? "Sí" : "No"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Responsable de Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Nombre</p>
            <p className="text-lg font-medium text-gray-900">{solicitud.nombre_responsable}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Cargo</p>
            <p className="text-lg font-medium text-gray-900">{solicitud.cargo_responsable}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Correo Electrónico</p>
            <p className="text-lg font-medium text-gray-900">{solicitud.correo_responsable}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Teléfono</p>
            <p className="text-lg font-medium text-gray-900">{solicitud.telefono_responsable}</p>
          </div>
        </div>
      </div>

      {/* Solicitudes de Practicantes */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Solicitudes de Practicantes ({solicitud.solicitudes_practicantes.length})
        </h2>
        <div className="space-y-6">
          {solicitud.solicitudes_practicantes.map((practicante, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Practicante {index + 1}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nivel de Formación</p>
                  <p className="text-lg font-medium text-gray-900">{practicante.nivel_formacion}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Programa Académico</p>
                  <p className="text-lg font-medium text-gray-900">{practicante.programa_academico}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Municipio</p>
                  <p className="text-lg font-medium text-gray-900">{practicante.municipio}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Cargo a Asignar</p>
                  <p className="text-lg font-medium text-gray-900">{practicante.cargo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Área / Departamento</p>
                  <p className="text-lg font-medium text-gray-900">{practicante.area_departamento}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Remuneración</p>
                  <p className="text-lg font-medium text-gray-900">
                    {practicante.remuneracion ? `$${practicante.valor_remuneracion}` : "No"}
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">Descripción del Perfil Profesional</p>
                <p className="text-base text-gray-900 whitespace-pre-wrap bg-white p-4 rounded border border-gray-200">
                  {practicante.perfil_profesional}
                </p>
              </div>

              <div className="flex gap-4 flex-wrap">
                {practicante.contrato_aprendizaje && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Con Contrato de Aprendizaje</span>
                  </div>
                )}
                {practicante.otros_detalles && (
                  <div className="w-full">
                    <p className="text-sm text-gray-600 mb-2">Otros Detalles</p>
                    <p className="text-base text-gray-900 bg-white p-4 rounded border border-gray-200">
                      {practicante.otros_detalles}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notas del Director */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Notas del Director</h2>
        <div className="space-y-4">
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Añade notas o comentarios sobre esta solicitud..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
            rows="6"
          />
          <button
            onClick={handleGuardarNotas}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Guardar Notas
          </button>
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Acciones</h2>

        <div className="flex flex-wrap gap-3">
          {solicitud.estado === "pendiente_revision" && (
            <>
              <button
                onClick={() => handleEstadoChange("en_revision")}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Iniciar Revisión
              </button>
              <button
                onClick={() => handleEstadoChange("rechazada")}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Rechazar
              </button>
            </>
          )}

          {solicitud.estado === "en_revision" && (
            <>
              <button
                onClick={() => handleEstadoChange("aprobada")}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-medium"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Aprobar
              </button>
              <button
                onClick={() => handleEstadoChange("rechazada")}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                Rechazar
              </button>
            </>
          )}

          {(solicitud.estado === "aprobada" || solicitud.estado === "rechazada") && (
            <div className="text-gray-600 py-2">
              <p className="text-sm">Esta solicitud ya ha sido {solicitud.estado === "aprobada" ? "aprobada" : "rechazada"}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
