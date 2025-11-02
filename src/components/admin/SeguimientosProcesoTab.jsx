import React, { useState, useEffect } from "react";
import { AlertCircle, Loader2, CheckCircle, Clock, Save } from "lucide-react";
import RecursoSeguimiento from "./RecursoSeguimiento";

export default function SeguimientosProcesoTab({
  procesoPracticasId,
  grupoId,
  estudianteId,
  estudiantes = []
}) {
  const [seguimientos, setSeguimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recursosConEstudiante, setRecursosConEstudiante] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Crear mapa de estudiantes para búsqueda rápida
  const estudianteMap = {};
  estudiantes.forEach((est) => {
    estudianteMap[est._id] = est;
  });

  useEffect(() => {
    if (grupoId && estudianteId) {
      cargarSeguimientos();
    }
  }, [grupoId, estudianteId]);

  const cargarSeguimientos = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/recursos-practicas/seguimientos-grupo?grupoId=${grupoId}`);
      if (res.ok) {
        const data = await res.json();

        // Filtrar solo los recursos del estudiante actual
        const seguimientosDelEstudiante = (data.seguimientos || []).map((seg) => ({
          ...seg,
          recursos: seg.recursos.filter((r) => r.usuarioId === estudianteId)
        })).filter((seg) => seg.recursos.length > 0); // Solo mostrar seguimientos que tengan recursos para este estudiante

        setSeguimientos(seguimientosDelEstudiante);

        // Inicializar estado de recursos del estudiante
        const recursosInit = {};
        seguimientosDelEstudiante.forEach((seg) => {
          seg.recursos.forEach((recurso) => {
            const key = seg._id;
            recursosInit[key] = {
              recursoId: recurso._id,
              titulo: recurso.titulo || "",
              url: recurso.url || "",
              nota: recurso.nota || null,
              notasAdicionales: recurso.notasAdicionales || ""
            };
          });
        });
        setRecursosConEstudiante(recursosInit);
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

  const handleChangeRecurso = (key, nuevoRecurso) => {
    setRecursosConEstudiante({
      ...recursosConEstudiante,
      [key]: {
        ...recursosConEstudiante[key],
        ...nuevoRecurso
      }
    });
  };

  const handleGuardarRecurso = async (key) => {
    try {
      const recurso = recursosConEstudiante[key];
      if (!recurso) {
        throw new Error("Recurso no encontrado");
      }

      console.log("Guardando recurso:", { key, recursoId: recurso.recursoId, recurso });

      const res = await fetch(`/api/recursos-practicas/${recurso.recursoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: recurso.url,
          nota: recurso.nota || null,
          notasAdicionales: recurso.notasAdicionales || ""
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Error al guardar recurso");
      }

      alert("Recurso guardado correctamente");
      // Recargar después de guardar
      await cargarSeguimientos();
    } catch (err) {
      console.error("Error al guardar recurso:", err);
      alert(`Error: ${err.message}`);
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

  return (
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Seguimientos List */}
      <div className="space-y-6">
        {seguimientos.map((seguimiento) => {
          const recursoKey = seguimiento._id;
          const recursoData = recursosConEstudiante[recursoKey] || {};

          return (
            <div
              key={seguimiento._id}
              className="p-4 rounded-lg border-2 border-gray-200 bg-white"
            >
              <div className="mb-6">
                <h4 className="text-lg font-bold text-gray-800">{seguimiento.titulo}</h4>
                {seguimiento.descripcion && (
                  <p className="text-gray-600 text-sm mt-1">{seguimiento.descripcion}</p>
                )}
              </div>

              {/* Recurso del estudiante */}
              <div className="p-3 rounded-lg border border-blue-200 bg-blue-50">
                {recursoData.titulo && (
                  <div className="mb-4 p-3 bg-blue-100 rounded-lg border border-blue-300">
                    <p className="text-sm font-semibold text-blue-900">
                      📋 Título del recurso: <span className="font-bold">{recursoData.titulo}</span>
                    </p>
                  </div>
                )}
                <RecursoSeguimiento
                  recurso={recursoData}
                  label={`Información del recurso`}
                  onChange={(nuevoRecurso) => handleChangeRecurso(recursoKey, nuevoRecurso)}
                />
                <button
                  onClick={() => handleGuardarRecurso(recursoKey)}
                  className="mt-3 w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
                {recursoData.recursoId && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <span>🆔</span>
                    <span>ID recurso: {recursoData.recursoId}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
