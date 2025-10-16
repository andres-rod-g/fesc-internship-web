import React, { useState } from "react";
import { ChevronDown, ChevronUp, Search, FileText, Users, CreditCard, UserCheck } from "lucide-react";

export default function FlowDocumentation({ documentacion }) {
  const [expandedSections, setExpandedSections] = useState({
    stage1: true,
    stage2: false,
    stage3: false,
    estados: false,
  });
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSection = (section) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section]
    });
  };

  const stages = [
    {
      id: "stage1",
      title: "STAGE 1: PREINSCRIPCIÓN",
      icon: FileText,
      color: "blue",
      description: "El estudiante completa formulario inicial con información personal, académica y profesional",
      details: [
        { label: "Acceso", value: "Público (sin autenticación)" },
        { label: "URL", value: "/preinscripcion" },
        { label: "API", value: "POST /api/preinscripciones" },
        { label: "Estado resultante", value: "estado_preinscripcion: 'preinscrito'" },
        { label: "Siguiente paso", value: "Esperar habilitación manual por admin" }
      ]
    },
    {
      id: "stage2",
      title: "STAGE 2: VALIDACIÓN DE PAGO",
      icon: CreditCard,
      color: "yellow",
      description: "Proceso de dos partes: estudiante sube comprobante y admin valida",
      details: [
        { label: "2A: Estudiante Sube", value: "POST /api/validacion-pago/subir" },
        { label: "2B: Admin Valida", value: "POST /api/validacion-pago/validar" },
        { label: "Roles validadores", value: "admin, registro_control" },
        { label: "Ubicación admin", value: "/admin/validaciones-pago" },
        { label: "Estado aprobado", value: "estado_preinscripcion: 'pago_validado'" }
      ]
    },
    {
      id: "stage3",
      title: "STAGE 3: CREACIÓN DE ESTUDIANTE",
      icon: UserCheck,
      color: "green",
      description: "Admin crea usuario en sistema con rol estudiante",
      details: [
        { label: "Acceso", value: "Solo rol admin" },
        { label: "URL", value: "/admin/estudiantes-por-crear" },
        { label: "API", value: "POST /api/estudiantes/crear" },
        { label: "Rol asignado", value: "estudiante" },
        { label: "Estado final", value: "estado_preinscripcion: 'estudiante_creado'" }
      ]
    }
  ];

  const estados = [
    { nombre: "preinscrito", descripcion: "Formulario inicial completado", color: "blue" },
    { nombre: "pago_pendiente", descripcion: "Comprobante subido, esperando validación", color: "yellow" },
    { nombre: "pago_validado", descripcion: "Comprobante aprobado, esperando creación de usuario", color: "green" },
    { nombre: "estudiante_creado", descripcion: "Usuario creado exitosamente", color: "purple" },
    { nombre: "rechazado", descripcion: "Rechazado en algún stage", color: "red" }
  ];

  const colorClasses = {
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    green: "bg-green-100 text-green-800 border-green-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    red: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar en la documentación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-sm p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">Flujo Visual Completo</h2>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <span className="text-sm font-medium">Preinscripción</span>
          </div>
          <div className="flex-1 h-1 bg-white mx-2"></div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2">
              <CreditCard className="w-8 h-8 text-yellow-600" />
            </div>
            <span className="text-sm font-medium">Validación Pago</span>
          </div>
          <div className="flex-1 h-1 bg-white mx-2"></div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2">
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
            <span className="text-sm font-medium">Creación Usuario</span>
          </div>
          <div className="flex-1 h-1 bg-white mx-2"></div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <span className="text-sm font-medium">Estudiante Activo</span>
          </div>
        </div>
      </div>

      {stages.map((stage) => {
        const Icon = stage.icon;
        const isExpanded = expandedSections[stage.id];

        return (
          <div
            key={stage.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
          >
            <button
              onClick={() => toggleSection(stage.id)}
              className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stage.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-gray-800">{stage.title}</h3>
                  <p className="text-sm text-gray-600">{stage.description}</p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-6 h-6 text-gray-400" />
              ) : (
                <ChevronDown className="w-6 h-6 text-gray-400" />
              )}
            </button>

            {isExpanded && (
              <div className="px-6 pb-6 border-t border-gray-200">
                <div className="mt-4 space-y-3">
                  {stage.details.map((detail, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="text-sm font-semibold text-gray-700 min-w-[140px]">
                        {detail.label}:
                      </span>
                      <span className="text-sm text-gray-600 font-mono bg-gray-50 px-2 py-1 rounded">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <button
          onClick={() => toggleSection("estados")}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-800">Estados Posibles</h3>
            <p className="text-sm text-gray-600">Todos los estados del flujo de preinscripción</p>
          </div>
          {expandedSections.estados ? (
            <ChevronUp className="w-6 h-6 text-gray-400" />
          ) : (
            <ChevronDown className="w-6 h-6 text-gray-400" />
          )}
        </button>

        {expandedSections.estados && (
          <div className="px-6 pb-6 border-t border-gray-200">
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {estados.map((estado) => (
                <div
                  key={estado.nombre}
                  className={`p-4 rounded-lg border-2 ${colorClasses[estado.color]}`}
                >
                  <p className="font-semibold text-sm font-mono mb-1">{estado.nombre}</p>
                  <p className="text-xs">{estado.descripcion}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-lg">
        <h3 className="text-lg font-bold text-orange-900 mb-2">⚠️ Importante</h3>
        <ul className="space-y-2 text-sm text-orange-800">
          <li>• Los estados deben seguir el orden: preinscrito → pago_pendiente → pago_validado → estudiante_creado</li>
          <li>• No se puede saltar stages ni retroceder (excepto a "rechazado")</li>
          <li>• Solo admin puede crear estudiantes (Stage 3)</li>
          <li>• Admin y registro_control pueden validar pagos (Stage 2B)</li>
        </ul>
      </div>
    </div>
  );
}
