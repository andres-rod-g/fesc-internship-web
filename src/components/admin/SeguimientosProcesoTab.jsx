import React, { useState, useEffect } from "react";
import { AlertCircle, Loader2, CheckCircle, Clock } from "lucide-react";
import RecursoSeguimiento from "./RecursoSeguimiento";

export default function SeguimientosProcesoTab({
  procesoPracticasId,
  grupoId,
  estudiantes = []
}) {
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recursos, setRecursos] = useState({});
  const [isSaving, setIsSaving] = useState(false);

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
        // Inicializar recursos vacíos
        const recursosInit = {};
        (data.seguimientos || []).forEach((seg) => {
          recursosInit[seg._id] = {
            url: "",
            nota: null,
            notasAdicionales: "",
            verificado: false
          };
        });
        setRecursos(recursosInit);
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

  const handleChangeRecurso = (seguimientoId, nuevoRecurso) => {
    setRecursos({
      ...recursos,
      [seguimientoId]: nuevoRecurso
    });
  };

  const handleGuardarAsignaciones = async () => {
    try {
      setIsSaving(true);
      setError("");

      // Validar que todos los seguimientos tengan un URL de recurso
      const seguimientosIncompletos = Object.entries(recursos).filter(
        ([_, recurso]) => !recurso.url
      );

      if (seguimientosIncompletos.length > 0) {
        setError("Debe asignar un recurso (enlace) a todos los seguimientos");
        return;
      }

      // Actualizar los recursos en la base de datos
      for (const [seguimientoId, recurso] of Object.entries(recursos)) {
        const seguimiento = seguimientos.find((s) => s._id === seguimientoId);
        if (seguimiento && recurso.url) {
          // Encontrar las entradas de este seguimiento que necesitan actualización
          const entradasActualizadas = seguimiento.entradas.map((entrada) => ({
            ...entrada,
            recursoUrl: recurso.url,
            recursNota: recurso.nota,
            recursoObservaciones: recurso.notasAdicionales || ""
          }));

          const res = await fetch(`/api/seguimientos-practicas/${seguimientoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              titulo: seguimiento.titulo,
              descripcion: seguimiento.descripcion,
              entradas: entradasActualizadas
            })
          });

          if (!res.ok) {
            throw new Error(`Error al actualizar seguimiento ${seguimientoId}`);
          }
        }
      }

      // Recargar seguimientos
      await cargarSeguimientos();
      setError("");
      alert("Recursos asignados correctamente");
    } catch (err) {
      console.error("Error al guardar asignaciones:", err);
      setError("Error al guardar las asignaciones");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (seguimientos.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <AlertCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
        <p className="text-blue-900 font-medium">No hay seguimientos en este grupo</p>
        <p className="text-blue-700 text-sm mt-2">
          Los seguimientos se crean en la sección de Seguimientos de Prácticas
        </p>
      </div>
    );
  }

  // Calcular seguimientos completados
  const seguimientosCompletados = seguimientos.filter(
    (seg) => recursos[seg._id]?.url
  ).length;

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Progress Banner */}
      <div className={`p-4 rounded-lg border flex items-center gap-3 ${
        seguimientosCompletados === seguimientos.length
          ? "bg-green-50 border-green-200"
          : "bg-yellow-50 border-yellow-200"
      }`}>
        {seguimientosCompletados === seguimientos.length ? (
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        ) : (
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
        )}
        <div>
          <p className={`font-medium ${
            seguimientosCompletados === seguimientos.length
              ? "text-green-900"
              : "text-yellow-900"
          }`}>
            {seguimientosCompletados}/{seguimientos.length} seguimientos completados
          </p>
          {seguimientosCompletados < seguimientos.length && (
            <p className="text-sm text-yellow-800 mt-1">
              Faltan {seguimientos.length - seguimientosCompletados} seguimiento(s) por completar
            </p>
          )}
        </div>
      </div>

      {/* Seguimientos List */}
      <div className="space-y-4">
        {seguimientos.map((seguimiento) => {
          const isCompleto = !!recursos[seguimiento._id]?.url;

          return (
            <div
              key={seguimiento._id}
              className={`p-4 rounded-lg border-2 transition-colors ${
                isCompleto
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-gray-800">{seguimiento.titulo}</h4>
                  {seguimiento.descripcion && (
                    <p className="text-gray-600 text-sm mt-1">{seguimiento.descripcion}</p>
                  )}
                </div>
                <div className="flex-shrink-0 ml-4">
                  {isCompleto ? (
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Completado
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-3 py-1 bg-red-200 text-red-800 rounded-full text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      Pendiente
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <RecursoSeguimiento
                  recurso={recursos[seguimiento._id] || {}}
                  label={`Recurso: ${seguimiento.titulo}`}
                  onChange={(nuevoRecurso) => handleChangeRecurso(seguimiento._id, nuevoRecurso)}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex gap-3">
        <button
          onClick={handleGuardarAsignaciones}
          disabled={isSaving}
          className={`flex-1 px-4 py-3 rounded-lg font-medium text-white transition-colors ${
            isSaving
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Guardando...
            </span>
          ) : (
            "Guardar Seguimientos"
          )}
        </button>
      </div>
    </div>
  );
}
