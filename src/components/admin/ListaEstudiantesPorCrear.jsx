import React from "react";
import { Users } from "lucide-react";
import EstudiantePorCrearCard from "./EstudiantePorCrearCard";

export default function ListaEstudiantesPorCrear({ practicantes }) {
  const [refresh, setRefresh] = React.useState(0);

  const handleCrearEstudiante = () => {
    setRefresh(prev => prev + 1);
    // Recargar página después de 3 segundos para ver cambios
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };

  if (!practicantes || practicantes.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          No hay estudiantes por crear
        </h3>
        <p className="text-gray-600">
          Todos los practicantes validados ya tienen usuario creado
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {practicantes.map((practicante) => (
        <EstudiantePorCrearCard
          key={practicante._id}
          practicante={practicante}
          onCrear={handleCrearEstudiante}
        />
      ))}
    </div>
  );
}
