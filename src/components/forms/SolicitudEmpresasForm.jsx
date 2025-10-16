import React, { useState } from "react";
import { AlertCircle, CheckCircle, Loader2, ArrowRight, ArrowLeft, Plus, X } from "lucide-react";

export default function SolicitudEmpresasForm({ isAdmin = false }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    // Step 1: Datos Generales
    nombre_empresa: "",
    representante_legal: "",
    nit: "",
    actividad_economica: "",
    sector_economico: "",
    nacionalidad: "",
    tamano_empresa: "",
    pagina_web: "",
    direccion: "",
    telefonos: "",
    convenio_vigente: false,

    // Step 2: Información de Contacto
    nombre_responsable: "",
    cargo_responsable: "",
    correo_responsable: "",
    telefono_responsable: "",

    // Step 3: Solicitud de Practicante (array)
    solicitudes_practicantes: [
      {
        nivel_formacion: "",
        programa_academico: "",
        municipio: "",
        cargo: "",
        area_departamento: "",
        perfil_profesional: "",
        remuneracion: false,
        valor_remuneracion: "",
        contrato_aprendizaje: false,
        otros_detalles: ""
      }
    ]
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const steps = [
    { id: 1, label: "Datos Empresa" },
    { id: 2, label: "Contacto" },
    { id: 3, label: "Practicante" },
    { id: 4, label: "Confirmación" }
  ];

  const renderStepIndicator = () => (
    <div className="flex justify-between mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
              step.id <= currentStep
                ? "bg-accent text-white"
                : "bg-gray-300 text-gray-600"
            }`}
          >
            {step.id}
          </div>
          <div className="text-sm font-medium text-gray-700 ml-2">{step.label}</div>
          {index < steps.length - 1 && (
            <div
              className={`flex-1 h-1 mx-2 rounded transition-colors ${
                step.id < currentStep ? "bg-accent" : "bg-gray-300"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const validateStep1 = () => {
    if (!form.nombre_empresa || !form.representante_legal || !form.nit ||
        !form.actividad_economica || !form.sector_economico || !form.nacionalidad ||
        !form.tamano_empresa || !form.direccion || !form.telefonos || !form.convenio_vigente) {
      setError("Por favor completa todos los campos obligatorios del paso 1");
      return false;
    }
    setError("");
    return true;
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Datos Generales de la Empresa</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Empresa *
          </label>
          <input
            type="text"
            name="nombre_empresa"
            value={form.nombre_empresa}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Representante Legal *
          </label>
          <input
            type="text"
            name="representante_legal"
            value={form.representante_legal}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NIT *
          </label>
          <input
            type="text"
            name="nit"
            value={form.nit}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Actividad Económica *
          </label>
          <input
            type="text"
            name="actividad_economica"
            value={form.actividad_economica}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sector Económico *
          </label>
          <select
            name="sector_economico"
            value={form.sector_economico}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          >
            <option value="">Selecciona sector</option>
            <option value="Tecnología">Tecnología</option>
            <option value="Salud">Salud</option>
            <option value="Educación">Educación</option>
            <option value="Finanzas">Finanzas</option>
            <option value="Manufactura">Manufactura</option>
            <option value="Comercio">Comercio</option>
            <option value="Servicios">Servicios</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nacionalidad *
          </label>
          <input
            type="text"
            name="nacionalidad"
            value={form.nacionalidad}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tamaño Empresa *
          </label>
          <select
            name="tamano_empresa"
            value={form.tamano_empresa}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          >
            <option value="">Selecciona tamaño</option>
            <option value="Microempresa">Microempresa</option>
            <option value="Pequeña">Pequeña</option>
            <option value="Mediana">Mediana</option>
            <option value="Grande">Grande</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Página Web
          </label>
          <input
            type="url"
            name="pagina_web"
            value={form.pagina_web}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dirección *
        </label>
        <input
          type="text"
          name="direccion"
          value={form.direccion}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teléfonos *
        </label>
        <input
          type="text"
          name="telefonos"
          value={form.telefonos}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          required
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="convenio_vigente"
            checked={form.convenio_vigente}
            onChange={handleChange}
            className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent"
          />
          <span className="text-sm font-medium text-gray-800">
            Confirmo que nuestra empresa tiene convenio vigente con FESC *
          </span>
        </label>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Información de Contacto</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre Responsable *
          </label>
          <input
            type="text"
            name="nombre_responsable"
            value={form.nombre_responsable}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cargo del Responsable *
          </label>
          <input
            type="text"
            name="cargo_responsable"
            value={form.cargo_responsable}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Correo Electrónico *
          </label>
          <input
            type="email"
            name="correo_responsable"
            value={form.correo_responsable}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Teléfono de Contacto *
          </label>
          <input
            type="tel"
            name="telefono_responsable"
            value={form.telefono_responsable}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            required
          />
        </div>
      </div>
    </div>
  );

  const validateStep2 = () => {
    if (!form.nombre_responsable || !form.cargo_responsable ||
        !form.correo_responsable || !form.telefono_responsable) {
      setError("Por favor completa todos los campos obligatorios del paso 2");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(form.correo_responsable)) {
      setError("Por favor ingresa un correo electrónico válido");
      return false;
    }
    setError("");
    return true;
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Solicitud de Practicante</h2>
        <button
          type="button"
          onClick={addPracticantRequest}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar Practicante
        </button>
      </div>

      {form.solicitudes_practicantes.map((practicante, index) => (
        <div key={index} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Practicante {index + 1}</h3>
            {form.solicitudes_practicantes.length > 1 && (
              <button
                type="button"
                onClick={() => removePracticantRequest(index)}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel de Formación *
              </label>
              <select
                value={practicante.nivel_formacion}
                onChange={(e) => handlePracticantChange(index, 'nivel_formacion', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                required
              >
                <option value="">Selecciona nivel</option>
                <option value="Tecnología">Tecnología</option>
                <option value="Profesional Universitario">Profesional Universitario</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programa Académico *
              </label>
              <input
                type="text"
                value={practicante.programa_academico}
                onChange={(e) => handlePracticantChange(index, 'programa_academico', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Ej: Ingeniería de Software"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Municipio *
              </label>
              <input
                type="text"
                value={practicante.municipio}
                onChange={(e) => handlePracticantChange(index, 'municipio', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Ej: Cúcuta"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cargo a Asignar *
              </label>
              <input
                type="text"
                value={practicante.cargo}
                onChange={(e) => handlePracticantChange(index, 'cargo', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Ej: Desarrollador Junior"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área / Departamento *
              </label>
              <input
                type="text"
                value={practicante.area_departamento}
                onChange={(e) => handlePracticantChange(index, 'area_departamento', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                placeholder="Ej: Desarrollo"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción del Perfil Profesional *
            </label>
            <textarea
              value={practicante.perfil_profesional}
              onChange={(e) => handlePracticantChange(index, 'perfil_profesional', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              rows="4"
              placeholder="Describe las responsabilidades, habilidades requeridas y otros detalles del perfil..."
              required
            />
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded border border-gray-300">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={practicante.remuneracion}
                  onChange={(e) => handlePracticantChange(index, 'remuneracion', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-accent"
                />
                <span className="text-sm font-medium text-gray-800">¿Con remuneración?</span>
              </label>
              {practicante.remuneracion && (
                <input
                  type="number"
                  value={practicante.valor_remuneracion}
                  onChange={(e) => handlePracticantChange(index, 'valor_remuneracion', e.target.value)}
                  className="w-full px-3 py-2 mt-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="Valor mensual"
                  min="0"
                />
              )}
            </div>

            <div className="bg-white p-4 rounded border border-gray-300">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={practicante.contrato_aprendizaje}
                  onChange={(e) => handlePracticantChange(index, 'contrato_aprendizaje', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-accent"
                />
                <span className="text-sm font-medium text-gray-800">¿Contrato de aprendizaje?</span>
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Otros Detalles
            </label>
            <textarea
              value={practicante.otros_detalles}
              onChange={(e) => handlePracticantChange(index, 'otros_detalles', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
              rows="3"
              placeholder="Información adicional relevante..."
            />
          </div>
        </div>
      ))}
    </div>
  );

  const addPracticantRequest = () => {
    setForm({
      ...form,
      solicitudes_practicantes: [
        ...form.solicitudes_practicantes,
        {
          nivel_formacion: "",
          programa_academico: "",
          municipio: "",
          cargo: "",
          area_departamento: "",
          perfil_profesional: "",
          remuneracion: false,
          valor_remuneracion: "",
          contrato_aprendizaje: false,
          otros_detalles: ""
        }
      ]
    });
  };

  const removePracticantRequest = (index) => {
    setForm({
      ...form,
      solicitudes_practicantes: form.solicitudes_practicantes.filter((_, i) => i !== index)
    });
  };

  const handlePracticantChange = (index, field, value) => {
    const newSolicitudes = [...form.solicitudes_practicantes];
    newSolicitudes[index][field] = value;
    setForm({ ...form, solicitudes_practicantes: newSolicitudes });
  };

  const validateStep3 = () => {
    if (form.solicitudes_practicantes.length === 0) {
      setError("Por favor agrega al menos una solicitud de practicante");
      return false;
    }

    for (let practicante of form.solicitudes_practicantes) {
      if (!practicante.nivel_formacion || !practicante.programa_academico ||
          !practicante.municipio || !practicante.cargo ||
          !practicante.area_departamento || !practicante.perfil_profesional) {
        setError("Por favor completa todos los campos obligatorios de cada practicante");
        return false;
      }
    }
    setError("");
    return true;
  };

  const renderStep4 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Confirmación de Solicitud</h2>

      {/* Datos Empresa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-4">Información de la Empresa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Empresa:</span>
            <p className="text-gray-900">{form.nombre_empresa}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">NIT:</span>
            <p className="text-gray-900">{form.nit}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Representante Legal:</span>
            <p className="text-gray-900">{form.representante_legal}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Sector:</span>
            <p className="text-gray-900">{form.sector_economico}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Dirección:</span>
            <p className="text-gray-900">{form.direccion}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Teléfono:</span>
            <p className="text-gray-900">{form.telefonos}</p>
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="font-semibold text-green-900 mb-4">Responsable de Contacto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Nombre:</span>
            <p className="text-gray-900">{form.nombre_responsable}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Cargo:</span>
            <p className="text-gray-900">{form.cargo_responsable}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Correo:</span>
            <p className="text-gray-900">{form.correo_responsable}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Teléfono:</span>
            <p className="text-gray-900">{form.telefono_responsable}</p>
          </div>
        </div>
      </div>

      {/* Practicantes */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="font-semibold text-purple-900 mb-4">Solicitudes de Practicantes ({form.solicitudes_practicantes.length})</h3>
        <div className="space-y-4">
          {form.solicitudes_practicantes.map((practicante, index) => (
            <div key={index} className="bg-white p-4 rounded border border-purple-200">
              <h4 className="font-medium text-gray-800 mb-2">Practicante {index + 1}</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Nivel:</span>
                  <p className="text-gray-900">{practicante.nivel_formacion}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Programa:</span>
                  <p className="text-gray-900">{practicante.programa_academico}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Municipio:</span>
                  <p className="text-gray-900">{practicante.municipio}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Cargo:</span>
                  <p className="text-gray-900">{practicante.cargo}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Área:</span>
                  <p className="text-gray-900">{practicante.area_departamento}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Remuneración:</span>
                  <p className="text-gray-900">
                    {practicante.remuneracion ? `$${practicante.valor_remuneracion}` : "No"}
                  </p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-purple-100">
                <span className="font-medium text-gray-600">Descripción:</span>
                <p className="text-gray-900 text-sm mt-1">{practicante.perfil_profesional}</p>
              </div>
              {practicante.contrato_aprendizaje && (
                <p className="text-sm text-purple-700 mt-2 font-medium">✓ Con contrato de aprendizaje</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confirmación */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={success === "confirmed"}
            onChange={(e) => setSuccess(e.target.checked ? "confirmed" : "")}
            className="w-4 h-4 mt-1 rounded border-gray-300 text-accent"
          />
          <span className="text-sm text-gray-800">
            Confirmo que toda la información proporcionada es correcta y autorizo a FESC para revisar esta solicitud.
          </span>
        </label>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (success !== "confirmed") {
      setError("Por favor confirma que la información es correcta");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/solicitudes-practicantes/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        const data = await response.json();
        const redirectUrl = isAdmin
          ? `/admin/solicitudes-practicantes/${data.solicitudId}`
          : `/solicitar-practicantes/confirmacion?id=${data.solicitudId}`;
        window.location.href = redirectUrl;
      } else {
        const data = await response.json();
        setError(data.error || "Error al enviar la solicitud");
      }
    } catch (err) {
      setError("Error de conexión al servidor");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {renderStepIndicator()}

      <form className="space-y-6" onSubmit={handleSubmit}>
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="flex justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Atrás
          </button>

          {currentStep === 4 ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Solicitud"
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                let isValid = true;
                if (currentStep === 1) isValid = validateStep1();
                else if (currentStep === 2) isValid = validateStep2();
                else if (currentStep === 3) isValid = validateStep3();

                if (isValid) setCurrentStep(Math.min(4, currentStep + 1));
              }}
              className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Siguiente
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
