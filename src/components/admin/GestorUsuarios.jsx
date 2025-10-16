import React, { useState } from "react";
import { Users, Loader2, AlertCircle, User, Mail, Calendar, Plus } from "lucide-react";
import ModalCrearUsuario from "./ModalCrearUsuario";
import ListaUsuarios from "./ListaUsuarios";

export default function GestorUsuarios() {
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUsuarioCreado = (usuario) => {
    // Disparar actualización de la lista
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      {/* Botón para abrir modal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Crear Usuario</h3>
            <p className="text-sm text-gray-600 mt-1">
              Haz clic en el botón para crear un nuevo usuario del sistema
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Crear Usuario
          </button>
        </div>
      </div>

      {/* Modal */}
      <ModalCrearUsuario
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUsuarioCreado={handleUsuarioCreado}
      />

      {/* Lista de Usuarios */}
      <ListaUsuarios refresh={refreshKey} />
    </>
  );
}
