import React, { useState } from "react";
import ModalSeguimiento from "./ModalSeguimiento";

export default function ListaSeguimientosEstudiante({ seguimientosPorGrupo, onSeguimientoSaved }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSeguimiento, setSelectedSeguimiento] = useState(null);

  const handleOpenModal = (seguimiento) => {
    setSelectedSeguimiento(seguimiento);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSeguimiento(null);
  };

  const handleSaveModal = () => {
    if (onSeguimientoSaved) {
      onSeguimientoSaved();
    }
  };

  return (
    <>
      {seguimientosPorGrupo.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Mis Seguimientos</h2>
          <div className="space-y-6">
            {seguimientosPorGrupo.map((grupoData) => (
              <div key={grupoData.grupo._id}>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">{grupoData.grupo.nombre}</h3>
                <div className="space-y-3 ml-2">
                  {grupoData.seguimientos.length > 0 ? (
                    grupoData.seguimientos.map((seg) => {
                      const estado = seg.estado;
                      const bgColor = estado === "validado" ? "bg-green-50" :
                                    estado === "rechazado" ? "bg-red-50" :
                                    "bg-yellow-50";
                      const borderColor = estado === "validado" ? "border-green-200" :
                                        estado === "rechazado" ? "border-red-200" :
                                        "border-yellow-200";
                      const badgeBg = estado === "validado" ? "bg-green-100" :
                                     estado === "rechazado" ? "bg-red-100" :
                                     "bg-yellow-100";
                      const badgeText = estado === "validado" ? "text-green-700" :
                                       estado === "rechazado" ? "text-red-700" :
                                       "text-yellow-700";
                      const statusLabel = estado === "validado" ? "Validado" :
                                         estado === "rechazado" ? "Rechazado" :
                                         "Pendiente";

                      return (
                        <button
                          key={seg._id}
                          onClick={() => handleOpenModal(seg)}
                          className={`w-full text-left p-4 rounded-lg border ${bgColor} ${borderColor} hover:shadow-md transition-all cursor-pointer`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">{seg.titulo}</p>
                              {seg.descripcion && <p className="text-sm text-gray-600 mt-1">{seg.descripcion}</p>}
                            </div>
                            {estado && (
                              <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${badgeBg} ${badgeText} flex-shrink-0`}>
                                {statusLabel}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 italic">No hay seguimientos en este grupo</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <p className="text-blue-800 font-medium">No hay seguimientos disponibles aún</p>
        </div>
      )}

      {/* Modal */}
      <ModalSeguimiento
        isOpen={modalOpen}
        seguimiento={selectedSeguimiento}
        onClose={handleCloseModal}
        onSave={handleSaveModal}
      />
    </>
  );
}
