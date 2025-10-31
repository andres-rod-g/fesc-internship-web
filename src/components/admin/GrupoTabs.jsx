import React, { useState } from "react";
import TablaEstudiantesGrupo from "./TablaEstudiantesGrupo";
import SeguimientosSection from "./SeguimientosSection";

export default function GrupoTabs({ grupoId, estudiantes = [], userRole = "" }) {
  const [activeTab, setActiveTab] = useState("estudiantes");

  const canViewSeguimientos = userRole === "admin" || userRole === "profesor";

  return (
    <div className="space-y-4">
      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab("estudiantes")}
          className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
            activeTab === "estudiantes"
              ? "border-red-600 text-red-600"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Estudiantes ({estudiantes.length})
        </button>

        {canViewSeguimientos && (
          <button
            onClick={() => setActiveTab("seguimientos")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "seguimientos"
                ? "border-red-600 text-red-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Seguimientos
          </button>
        )}
      </div>

      {/* Tabs Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {activeTab === "estudiantes" && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Estudiantes ({estudiantes.length})</h3>
            <TablaEstudiantesGrupo
              estudiantes={estudiantes}
              grupoId={grupoId}
              buscarEnBaseDatos={false}
            />
          </div>
        )}

        {activeTab === "seguimientos" && canViewSeguimientos && (
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-4">Seguimientos de Prácticas</h3>
            <SeguimientosSection
              grupoId={grupoId}
              estudiantes={estudiantes}
            />
          </div>
        )}
      </div>
    </div>
  );
}
