import React, { useState } from 'react';
import { Users, Building2, FileText, CreditCard, UserCheck, Briefcase, ChevronDown, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const stagesEstudiantes = [
  {
    id: "stage1",
    numero: "PASO 1",
    title: "Preinscripción del Estudiante",
    icon: "FileText",
    color: "blue",
    descripcion: "El estudiante completa su información básica para iniciar el proceso",
    queHace: "El estudiante llena un formulario público con:",
    pasos: [
      "Información personal (nombres, documento, foto)",
      "Programa académico y ciclo",
      "Información académica previa",
      "Experiencia laboral (si tiene)",
      "Firma digital"
    ],
    quienLoHace: "El estudiante",
    queDebeHacerAdmin: [
      "El estudiante recibirá una confirmación automática",
      "El registro aparecerá en la sección 'Preinscripciones' del panel admin",
      "Esperar a que el estudiante esté en semestre válido para continuar"
    ],
    notaAlternativa: null,
    siguientePaso: "Cuando el estudiante esté listo, se le notificará para subir el comprobante de pago"
  },
  {
    id: "stage2",
    numero: "PASO 2",
    title: "Validación del Comprobante de Pago",
    icon: "CreditCard",
    color: "yellow",
    descripcion: "El estudiante sube su comprobante y tú lo validas",
    queHace: "Proceso de dos partes:",
    pasos: [
      "El estudiante sube una imagen del comprobante de pago",
      "El comprobante aparece en 'Validar Pagos' del menú",
      "Tú revisas la imagen del comprobante",
      "Puedes aprobar o rechazar el pago"
    ],
    quienLoHace: "Estudiante sube, Admin o Registro y Control validan",
    queDebeHacerAdmin: [
      "Ve a 'Validar Pagos' en el menú lateral",
      "Verás una lista de pagos pendientes con foto del comprobante",
      "Haz clic en 'Aprobar' si el pago es válido",
      "O haz clic en 'Rechazar' si hay algún problema (puedes agregar comentarios)"
    ],
    notaAlternativa: "El estudiante recibe automáticamente el link de 'Subir Comprobante' apenas completa su preinscripción. También puedes copiar este link manualmente desde el perfil del estudiante en 'Preinscripciones' para enviárselo directamente.",
    siguientePaso: "Si apruebas el pago, el practicante pasará a 'Estudiantes por Crear'"
  },
  {
    id: "stage3",
    numero: "PASO 3",
    title: "Creación del Usuario Estudiante",
    icon: "UserCheck",
    color: "green",
    descripcion: "Creas el usuario para que el estudiante acceda al sistema",
    queHace: "El administrador crea las credenciales de acceso:",
    pasos: [
      "Los practicantes con pago validado aparecen aquí",
      "Seleccionas un practicante para crear su usuario",
      "Asignas un nombre de usuario (por defecto su documento)",
      "Generas o escribes una contraseña temporal",
      "El sistema crea el usuario automáticamente"
    ],
    quienLoHace: "Solo el Administrador",
    queDebeHacerAdmin: [
      "Ve a 'Crear Estudiantes' en el menú lateral",
      "Haz clic en 'Crear Estudiante' en la tarjeta del practicante",
      "Confirma o cambia el nombre de usuario",
      "Genera una contraseña (hay un botón para generar automáticamente)",
      "Guarda las credenciales y envíaselas al estudiante por email/WhatsApp",
      "¡Listo! El estudiante ya puede acceder al sistema"
    ],
    notaAlternativa: null,
    siguientePaso: "El estudiante ya tiene acceso al sistema y puede ver su perfil y opciones de prácticas"
  }
];

const stagesEmpresas = [
  {
    id: "stage1",
    numero: "PASO 1",
    title: "Solicitud de Practicantes",
    icon: "Briefcase",
    color: "blue",
    descripcion: "La empresa completa el formulario de solicitud de practicantes",
    queHace: "La empresa llena un formulario público con:",
    pasos: [
      "Datos generales de la empresa (nombre, NIT, sector, tamaño)",
      "Información de contacto (responsable, cargo, email, teléfono)",
      "Solicitud de practicantes (nivel de formación, programa, cargo, área, perfil)",
      "Detalles adicionales (remuneración, tipo de contrato)"
    ],
    quienLoHace: "La empresa o representante autorizado",
    queDebeHacerAdmin: [
      "La solicitud aparecerá automáticamente en 'Solicitudes Recibidas'",
      "Se registrará con estado 'Pendiente de Revisión'",
      "Recibirás una notificación de la nueva solicitud",
      "Puedes revisar los detalles de la solicitud"
    ],
    siguientePaso: "Se le notificará a la empresa cuando inicie la revisión de su solicitud"
  },
  {
    id: "stage2",
    numero: "PASO 2",
    title: "Revisión de Solicitud",
    icon: "FileText",
    color: "yellow",
    descripcion: "El director o admin revisa la solicitud y proporciona retroalimentación",
    queHace: "El proceso de revisión incluye:",
    pasos: [
      "El director/admin abre la solicitud en detalle",
      "Revisa toda la información de la empresa y requerimientos",
      "Puede agregar notas internas",
      "Valida que la empresa tenga convenio vigente",
      "Verifica que los perfiles solicitados sean válidos"
    ],
    quienLoHace: "Director de prácticas o Administrador",
    queDebeHacerAdmin: [
      "Ve a 'Empresas' → 'Solicitudes Recibidas'",
      "Haz clic en la solicitud para ver los detalles",
      "Revisa toda la información proporcionada",
      "Agrega notas internas si es necesario",
      "Cambia el estado según corresponda"
    ],
    siguientePaso: "El estado de la solicitud pasará a 'En Revisión' mientras la analiza"
  },
  {
    id: "stage3",
    numero: "PASO 3",
    title: "Aprobación o Rechazo",
    icon: "UserCheck",
    color: "green",
    descripcion: "Apruebas o rechazas la solicitud de la empresa",
    queHace: "El administrador toma una decisión final:",
    pasos: [
      "Cambias el estado a 'Aprobada' si todo está correcto",
      "O cambias a 'Rechazada' si hay problemas",
      "La empresa recibe una notificación automática",
      "Si es aprobada, la empresa aparece en el listado de empresas"
    ],
    quienLoHace: "Director de prácticas o Administrador",
    queDebeHacerAdmin: [
      "En la página de detalles de la solicitud",
      "Selecciona el botón 'Aprobar' o 'Rechazar'",
      "Si rechazas, puedes agregar un comentario explicativo",
      "La empresa recibirá una notificación automática",
      "El cambio se registra en el historial"
    ],
    siguientePaso: "Si es aprobada, la empresa puede comenzar a solicitar practicantes específicos"
  }
];

export default function DocumentacionFlujoSelector() {
  const [selectedFlow, setSelectedFlow] = useState(null);

  const renderIcon = (icon) => {
    const iconMap = {
      FileText: <FileText className="w-8 h-8" />,
      CreditCard: <CreditCard className="w-8 h-8" />,
      UserCheck: <UserCheck className="w-8 h-8" />,
      Briefcase: <Briefcase className="w-8 h-8" />,
      Users: <Users className="w-8 h-8" />,
      Building2: <Building2 className="w-8 h-8" />
    };
    return iconMap[icon] || null;
  };

  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800 border-2 border-blue-300',
      yellow: 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300',
      green: 'bg-green-100 text-green-800 border-2 border-green-300'
    };
    return colorMap[color] || colorMap.blue;
  };

  const getColorTextClasses = (color) => {
    const colorMap = {
      blue: 'text-blue-600',
      yellow: 'text-yellow-600',
      green: 'text-green-600'
    };
    return colorMap[color] || colorMap.blue;
  };

  const stages = selectedFlow === 'estudiantes' ? stagesEstudiantes : stagesEmpresas;

  if (!selectedFlow) {
    return (
      <div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            Documentación del Sistema de Flujos
          </h1>
          <p class="text-gray-600">
            Selecciona el flujo que deseas entender para ver la guía completa del proceso
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-6">
          {/* Card Flujo Estudiantes */}
          <button
            onClick={() => setSelectedFlow('estudiantes')}
            className="group bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-blue-500 hover:shadow-lg transition-all p-8 text-left cursor-pointer"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">3 PASOS</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
              Flujo de Estudiantes
            </h2>
            <p class="text-gray-600 mb-4">
              Guía completa del proceso de preinscripción, validación de pagos y creación de usuarios para estudiantes
            </p>
            <div class="space-y-2 mb-6">
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span class="text-blue-500">✓</span>
                <span>Preinscripción automática</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span class="text-blue-500">✓</span>
                <span>Validación de comprobantes</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span class="text-blue-500">✓</span>
                <span>Creación de credenciales</span>
              </div>
            </div>
            <div class="inline-flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
              Ver documentación
              <span>→</span>
            </div>
          </button>

          {/* Card Flujo Empresas */}
          <button
            onClick={() => setSelectedFlow('empresas')}
            className="group bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-purple-500 hover:shadow-lg transition-all p-8 text-left cursor-pointer"
          >
            <div class="flex items-start justify-between mb-4">
              <div class="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Building2 className="w-8 h-8 text-purple-600" />
              </div>
              <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">3 PASOS</span>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
              Flujo de Empresas
            </h2>
            <p class="text-gray-600 mb-4">
              Guía completa del proceso de solicitud de practicantes, revisión y aprobación de solicitudes de empresas
            </p>
            <div class="space-y-2 mb-6">
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span class="text-purple-500">✓</span>
                <span>Solicitud de practicantes</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span class="text-purple-500">✓</span>
                <span>Revisión de solicitudes</span>
              </div>
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span class="text-purple-500">✓</span>
                <span>Aprobación o rechazo</span>
              </div>
            </div>
            <div class="inline-flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-3 transition-all">
              Ver documentación
              <span>→</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Resumen de estados para estudiantes
  const estadosEstudiantes = [
    {
      estado: "Preinscrito",
      color: "blue",
      icon: <AlertCircle className="w-5 h-5" />,
      description: "Completó el formulario inicial, esperando subir comprobante de pago"
    },
    {
      estado: "Pago Pendiente",
      color: "yellow",
      icon: <AlertCircle className="w-5 h-5" />,
      description: "Subió comprobante, esperando que tú lo valides"
    },
    {
      estado: "Pago Validado",
      color: "green",
      icon: <CheckCircle className="w-5 h-5" />,
      description: "Aprobaste el pago, listo para crear su usuario"
    },
    {
      estado: "Estudiante Creado",
      color: "purple",
      icon: <CheckCircle className="w-5 h-5" />,
      description: "Usuario creado, ya puede acceder al sistema"
    },
    {
      estado: "Rechazado",
      color: "red",
      icon: <XCircle className="w-5 h-5" />,
      description: "Rechazaste el pago o hay algún problema"
    }
  ];

  // Resumen de estados para empresas
  const estadosEmpresas = [
    {
      estado: "Pendiente de Revisión",
      color: "blue",
      icon: <AlertCircle className="w-5 h-5" />,
      description: "Solicitud recibida, esperando ser revisada"
    },
    {
      estado: "En Revisión",
      color: "yellow",
      icon: <AlertCircle className="w-5 h-5" />,
      description: "Director/Admin está revisando la solicitud"
    },
    {
      estado: "Aprobada",
      color: "green",
      icon: <CheckCircle className="w-5 h-5" />,
      description: "Solicitud aprobada, empresa puede solicitar practicantes"
    },
    {
      estado: "Rechazada",
      color: "red",
      icon: <XCircle className="w-5 h-5" />,
      description: "Solicitud rechazada, requiere revisión"
    }
  ];

  const estadosActuales = selectedFlow === 'estudiantes' ? estadosEstudiantes : estadosEmpresas;
  const tipsActuales = selectedFlow === 'estudiantes'
    ? [
        { titulo: "Orden del proceso", desc: "Los estudiantes siempre siguen el orden Paso 1 → Paso 2 → Paso 3. No se puede saltar pasos." },
        { titulo: "Validar pagos", desc: "Tanto tú (admin) como los usuarios con rol 'Registro y Control' pueden validar pagos." },
        { titulo: "Crear estudiantes", desc: "Solo tú como administrador puedes crear los usuarios estudiantes (Paso 3)." },
        { titulo: "Badges en el menú", desc: "Los números que ves en el menú lateral te indican cuántas tareas tienes pendientes en cada sección." },
        { titulo: "Rechazo de pagos", desc: "Si rechazas un pago, el estudiante verá tus comentarios y podrá volver a subir otro comprobante." }
      ]
    : [
        { titulo: "Validar convenios", desc: "Antes de aprobar una solicitud, verifica que la empresa tenga un convenio vigente de prácticas con FESC." },
        { titulo: "Revisar perfiles", desc: "Valida que los perfiles solicitados coincidan con los programas académicos ofrecidos por FESC." },
        { titulo: "Notas internas", desc: "Usa la sección de notas para documentar motivos de rechazo o condiciones especiales." },
        { titulo: "Notificaciones", desc: "Las empresas recibirán notificaciones automáticas cuando cambie el estado de su solicitud." },
        { titulo: "Requerimientos", desc: "Verifica que la información de contacto y detalles de practicantes sean completos antes de aprobar." }
      ];

  return (
    <div>
      <div class="flex items-center gap-4 mb-8">
        <button
          onClick={() => setSelectedFlow(null)}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <span>←</span>
          Atrás
        </button>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1">
          <h1 class="text-3xl font-bold text-gray-800 mb-2">
            Documentación: Flujo de {selectedFlow === 'estudiantes' ? 'Estudiantes' : 'Empresas'}
          </h1>
          <p class="text-gray-600">
            Guía completa paso a paso del proceso
          </p>
        </div>
      </div>

      {/* Flujo Visual Completo */}
      <div className={`bg-gradient-to-r ${selectedFlow === 'estudiantes'
        ? 'from-blue-500 to-indigo-600'
        : 'from-purple-500 to-violet-600'} rounded-xl shadow-sm p-6 text-white mb-6`}>
        <h2 class="text-2xl font-bold mb-4">Flujo Visual Completo</h2>
        <div class="flex items-center justify-between flex-wrap gap-4">
          {stages.map((stage, idx) => (
            <React.Fragment key={stage.id}>
              <div class="flex flex-col items-center">
                <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2">
                  <div className={`${
                    selectedFlow === 'estudiantes'
                      ? idx === 0 ? 'text-blue-600' : idx === 1 ? 'text-yellow-600' : 'text-green-600'
                      : idx === 0 ? 'text-purple-600' : idx === 1 ? 'text-orange-600' : 'text-green-600'
                  }`}>
                    {renderIcon(stage.icon)}
                  </div>
                </div>
                <span class="text-sm font-medium text-center">{stage.title}</span>
              </div>
              {idx < stages.length - 1 && (
                <div class="flex-1 h-1 bg-white/50 mx-2 min-w-[40px]"></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Stages */}
      <div class="space-y-4">
        {stages.map((stage, index) => (
          <details key={stage.id} class="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" open={index === 0}>
            <summary class="cursor-pointer p-6 hover:bg-gray-50 transition-colors list-none flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${getColorClasses(stage.color)}`}>
                  {renderIcon(stage.icon)}
                </div>
                <div class="text-left">
                  <span className={`text-xs font-bold uppercase tracking-wider ${getColorTextClasses(stage.color)}`}>
                    {stage.numero}
                  </span>
                  <h3 class="text-xl font-bold text-gray-800">{stage.title}</h3>
                  <p class="text-sm text-gray-600 mt-1">{stage.descripcion}</p>
                </div>
              </div>
              <ChevronDown className="w-6 h-6 text-gray-400 group-open:rotate-180 transition-transform" />
            </summary>

            <div class="px-6 pb-6 border-t border-gray-200 bg-gray-50">
              <div class="mt-6 space-y-6">
                {/* Qué hace */}
                <div>
                  <h4 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">?</span>
                    ¿Qué sucede en este paso?
                  </h4>
                  <p class="text-sm text-gray-600 mb-2">{stage.queHace}</p>
                  <ul class="space-y-2">
                    {stage.pasos.map((paso) => (
                      <li key={paso} class="flex items-start gap-2 text-sm text-gray-700">
                        <span class="text-blue-500 mt-1">✓</span>
                        <span>{paso}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quién lo hace */}
                <div class="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 class="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <span class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">👤</span>
                    ¿Quién lo hace?
                  </h4>
                  <p class="text-sm text-gray-700 font-medium">{stage.quienLoHace}</p>
                </div>

                {/* Qué debe hacer el admin */}
                <div>
                  <h4 class="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <span class="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">✓</span>
                    Instrucciones para ti:
                  </h4>
                  <ol class="space-y-3">
                    {stage.queDebeHacerAdmin.map((instruccion, idx) => (
                      <li key={idx} class="flex items-start gap-3 text-sm text-gray-700">
                        <span class="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <span class="pt-0.5">{instruccion}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Nota importante */}
                {stage.notaAlternativa && (
                  <div class="bg-cyan-50 border-l-4 border-cyan-500 p-4 rounded">
                    <h4 class="text-sm font-bold text-cyan-900 mb-2">ℹ️ Nota a tener en cuenta:</h4>
                    <p class="text-sm text-cyan-800">{stage.notaAlternativa}</p>
                  </div>
                )}

                {/* Siguiente paso */}
                <div class="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
                  <h4 class="text-sm font-bold text-indigo-900 mb-2">➡️ Siguiente paso:</h4>
                  <p class="text-sm text-indigo-800">{stage.siguientePaso}</p>
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>

      {/* Resumen Visual de Estados */}
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
        <h3 class="text-xl font-bold text-gray-800 mb-4">
          📊 {selectedFlow === 'estudiantes' ? '¿Dónde está cada estudiante?' : '¿En qué estado está cada solicitud?'}
        </h3>
        <p class="text-sm text-gray-600 mb-6">
          {selectedFlow === 'estudiantes'
            ? 'Estos son los estados en los que puede estar un estudiante durante el proceso:'
            : 'Estos son los estados en los que puede estar una solicitud de empresa:'}
        </p>

        <div class="space-y-3">
          {estadosActuales.map((item) => {
            const colorMap = {
              blue: 'bg-blue-50 border-l-4 border-blue-500',
              yellow: 'bg-yellow-50 border-l-4 border-yellow-500',
              green: 'bg-green-50 border-l-4 border-green-500',
              purple: 'bg-purple-50 border-l-4 border-purple-500',
              red: 'bg-red-50 border-l-4 border-red-500'
            };
            const textColorMap = {
              blue: 'text-blue-900',
              yellow: 'text-yellow-900',
              green: 'text-green-900',
              purple: 'text-purple-900',
              red: 'text-red-900'
            };
            const iconColorMap = {
              blue: 'text-blue-600',
              yellow: 'text-yellow-600',
              green: 'text-green-600',
              purple: 'text-purple-600',
              red: 'text-red-600'
            };
            return (
              <div key={item.estado} className={`flex items-center gap-3 p-4 rounded ${colorMap[item.color]}`}>
                <div className={`flex-shrink-0 ${iconColorMap[item.color]}`}>
                  {item.icon}
                </div>
                <div>
                  <p className={`font-bold ${textColorMap[item.color]}`}>{item.estado}</p>
                  <p className={`text-sm ${textColorMap[item.color]} opacity-90`}>{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tips y Consejos */}
      <div class="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6 mt-8">
        <h3 class="text-lg font-bold text-orange-900 mb-4 flex items-center gap-2">
          💡 Tips y Recordatorios Importantes
        </h3>
        <div class="space-y-3 text-sm text-orange-900">
          {tipsActuales.map((tip, idx) => (
            <div key={idx} class="flex items-start gap-3">
              <span class="text-orange-500 font-bold flex-shrink-0">{idx + 1}.</span>
              <p><strong>{tip.titulo}:</strong> {tip.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Ayuda adicional */}
      <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center mt-8">
        <h3 class="text-lg font-bold text-blue-900 mb-2">¿Necesitas más ayuda?</h3>
        <p class="text-sm text-blue-700 mb-4">
          Si tienes dudas sobre cómo usar el sistema, contacta al equipo técnico o revisa esta guía nuevamente.
        </p>
        <p class="text-xs text-blue-600">
          Esta documentación se actualiza automáticamente con cada cambio en el sistema.
        </p>
      </div>
    </div>
  );
}
