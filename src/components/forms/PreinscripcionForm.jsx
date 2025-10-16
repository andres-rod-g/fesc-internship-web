import React, { useState, useRef, useEffect } from "react";
import { AlertCircle, CheckCircle, Loader2, Plus, Minus, Upload, X } from "lucide-react";

export default function PreinscripcionForm() {
  const [form, setForm] = useState({
    // Información Personal
    programa: "",
    ciclo: "",
    modalidad: [],
    foto: null,
    nombres: "",
    apellidos: "",
    tipo_documento: "",
    numero_documento: "",
    fecha_nacimiento: "",
    lugar_nacimiento: "",
    direccion_residencia: "",
    telefono_fijo: "",
    telefono_celular: "",
    correo_institucional: "",
    correo_personal: "",
    estado_laboral: "", // seeking_internship, working, entrepreneur
    
    // Información Académica (array)
    informacion_academica: [{
      tipo: "",
      institucion: "",
      titulo: "",
      anio_finalizacion: ""
    }],
    
    // Perfil Profesional
    perfil_profesional: "",
    
    // Herramientas (array)
    herramientas: [""],
    
    // Experiencia Laboral (array) - Empieza vacío
    experiencia_laboral: [],
    
    // Firma Digital
    firma_png: null
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Canvas para firma
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [firmaModificada, setFirmaModificada] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleModalidadChange = (value) => {
    const newModalidad = form.modalidad.includes(value)
      ? form.modalidad.filter(m => m !== value)
      : [...form.modalidad, value];
    setForm({ ...form, modalidad: newModalidad });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, firma_png: file });
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido (JPG, PNG, etc.)');
        return;
      }
      
      // Validar tamaño máximo (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB');
        return;
      }
      
      setForm({ ...form, foto: file });
      setError(''); // Limpiar error si había uno
    }
  };

  // Funciones para manejar arrays dinámicos
  const addEducationEntry = () => {
    setForm({
      ...form,
      informacion_academica: [...form.informacion_academica, {
        tipo: "",
        institucion: "",
        titulo: "",
        anio_finalizacion: ""
      }]
    });
  };

  const removeEducationEntry = (index) => {
    const newEducation = form.informacion_academica.filter((_, i) => i !== index);
    setForm({ ...form, informacion_academica: newEducation });
  };

  const handleEducationChange = (index, field, value) => {
    const newEducation = [...form.informacion_academica];
    newEducation[index][field] = value;
    setForm({ ...form, informacion_academica: newEducation });
  };

  const addTool = () => {
    setForm({ ...form, herramientas: [...form.herramientas, ""] });
  };

  const removeTool = (index) => {
    const newTools = form.herramientas.filter((_, i) => i !== index);
    setForm({ ...form, herramientas: newTools });
  };

  const handleToolChange = (index, value) => {
    const newTools = [...form.herramientas];
    newTools[index] = value;
    setForm({ ...form, herramientas: newTools });
  };

  const addExperienceEntry = () => {
    setForm({
      ...form,
      experiencia_laboral: [...form.experiencia_laboral, {
        empresa: "",
        nombre_jefe: "",
        cargo_jefe: "",
        telefono_empresa: "",
        cargo: "",
        fecha_inicio: "",
        fecha_fin: "",
        funciones: "",
        logros: ""
      }]
    });
  };

  const removeExperienceEntry = (index) => {
    const newExperience = form.experiencia_laboral.filter((_, i) => i !== index);
    setForm({ ...form, experiencia_laboral: newExperience });
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...form.experiencia_laboral];
    newExperience[index][field] = value;
    setForm({ ...form, experiencia_laboral: newExperience });
  };

  // Funciones para el canvas de firma
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
    }
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if (e.touches && e.touches[0]) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    setFirmaModificada(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const coords = getCoordinates(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (e) e.preventDefault();
    setIsDrawing(false);
  };

  const limpiarFirma = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setFirmaModificada(true);
    setForm({ ...form, firma_png: null });
  };

  const validateForm = () => {
    // Validar campos requeridos
    if (!form.programa || !form.ciclo || !form.modalidad.length || !form.foto || !form.nombres || !form.apellidos || !form.numero_documento || !form.correo_institucional || !form.estado_laboral) {
      setError("Los campos marcados con * son obligatorios.");
      return false;
    }
    
    // Validar correos electrónicos
    if (form.correo_institucional && !/\S+@\S+\.\S+/.test(form.correo_institucional)) {
      setError("Por favor ingresa un correo institucional válido.");
      return false;
    }
    
    if (form.correo_personal && !/\S+@\S+\.\S+/.test(form.correo_personal)) {
      setError("Por favor ingresa un correo personal válido.");
      return false;
    }
    
    // Validar teléfonos
    if (form.telefono_celular && !/^\d{10}$/.test(form.telefono_celular.replace(/\D/g, ""))) {
      setError("Por favor ingresa un teléfono celular válido (10 dígitos).");
      return false;
    }
    
    // Validar que hay al menos una entrada de educación
    if (form.informacion_academica.length === 0 || !form.informacion_academica[0].institucion) {
      setError("Por favor completa al menos una entrada de información académica.");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    
    try {
      const formData = new FormData();
      
      // Añadir todos los campos del formulario
      Object.keys(form).forEach(key => {
        if (key === 'firma_png') {
          // Manejar firma del canvas o archivo subido
          if (firmaModificada && canvasRef.current) {
            // Convertir canvas a blob de forma síncrona
            const imageData = canvasRef.current.toDataURL('image/png');
            const byteString = atob(imageData.split(',')[1]);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: 'image/png' });
            formData.append('firma_png', blob, 'firma.png');
          } else if (form[key]) {
            formData.append('firma_png', form[key]);
          }
        } else if (key === 'foto' && form[key]) {
          formData.append('foto', form[key]);
        } else if (typeof form[key] === 'object' && form[key] !== null) {
          formData.append(key, JSON.stringify(form[key]));
        } else if (form[key] !== null) {
          formData.append(key, form[key]);
        }
      });

      
      const res = await fetch("/api/preinscripciones", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const nombreCompleto = `${form.nombres} ${form.apellidos}`;
        window.location.href = `/preinscripcion/confirmacion?nombre=${encodeURIComponent(nombreCompleto)}`;
      } else {
        const data = await res.json();

        // Manejo específico de rate limit
        if (data.code === "RATE_LIMIT_EXCEEDED" || res.status === 429) {
          const details = data.details || {};
          setError(
            `⚠️ Límite de solicitudes alcanzado\n\n` +
            `${details.message || data.error}\n\n` +
            `Por favor, intenta de nuevo en ${details.retryAfter || 'algunos'} segundos.`
          );
        } else {
          setError(data.error || "Error al registrar la preinscripción.");
        }
      }
    } catch (err) {
      setError("Error de conexión al servidor. Por favor intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Preinscripción a Prácticas Profesionales</h2>
        <p className="text-gray-600">Completa todos los campos para realizar tu preinscripción. Este es el primer paso del proceso.</p>
      </div>
      
      <form className="space-y-8" onSubmit={handleSubmit}>
        {/* 1. INFORMACIÓN PERSONAL */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">1. Información Personal</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="programa" className="block text-sm font-medium text-gray-700 mb-2">
                Programa Académico *
              </label>
              <select
                id="programa"
                name="programa"
                className="input-primary"
                value={form.programa}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un programa</option>
                <option value="Ingeniería de Software">Ingeniería de Software</option>
                <option value="Tecnología en Desarrollo de Software">Tecnología en Desarrollo de Software</option>
                <option value="Diseño de Modas">Diseño de Modas</option>
                <option value="Mercadeo">Mercadeo</option>
                <option value="Administración de Empresas">Administración de Empresas</option>
                <option value="Contaduría Pública">Contaduría Pública</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="ciclo" className="block text-sm font-medium text-gray-700 mb-2">
                Ciclo *
              </label>
              <select
                id="ciclo"
                name="ciclo"
                className="input-primary"
                value={form.ciclo}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona un ciclo</option>
                <option value="Tecnólogo">Tecnólogo</option>
                <option value="Profesional">Profesional</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modalidad * (Puedes seleccionar varias)
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['Presencial', 'Virtual', 'Diurna', 'Nocturna', 'Distancia', 'Ocaña'].map((modalidad) => (
                  <label key={modalidad} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={form.modalidad.includes(modalidad)}
                      onChange={() => handleModalidadChange(modalidad)}
                      className="w-4 h-4 text-accent focus:ring-accent border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">{modalidad}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="md:col-span-2">
              <label htmlFor="foto" className="block text-sm font-medium text-gray-700 mb-2">
                Foto Personal *
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    id="foto"
                    type="file"
                    accept="image/*"
                    onChange={handleFotoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-white hover:file:bg-red-700 transition-colors"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
                  </p>
                </div>
                {form.foto && (
                  <div className="flex-shrink-0">
                    <img 
                      src={URL.createObjectURL(form.foto)} 
                      alt="Vista previa" 
                      className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-2">
                Nombres *
              </label>
              <input
                id="nombres"
                type="text"
                name="nombres"
                placeholder="Ingrese sus nombres"
                className="input-primary"
                value={form.nombres}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-2">
                Apellidos *
              </label>
              <input
                id="apellidos"
                type="text"
                name="apellidos"
                placeholder="Ingrese sus apellidos"
                className="input-primary"
                value={form.apellidos}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="tipo_documento" className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Documento *
              </label>
              <select
                id="tipo_documento"
                name="tipo_documento"
                className="input-primary"
                value={form.tipo_documento}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona</option>
                <option value="TI">Tarjeta de Identidad</option>
                <option value="CC">Cédula de Ciudadanía</option>
                <option value="CE">Cédula de Extranjería</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="numero_documento" className="block text-sm font-medium text-gray-700 mb-2">
                Número de Documento *
              </label>
              <input
                id="numero_documento"
                type="text"
                name="numero_documento"
                placeholder="Ingrese número de documento"
                className="input-primary"
                value={form.numero_documento}
                onChange={handleChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="fecha_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Nacimiento
              </label>
              <input
                id="fecha_nacimiento"
                type="date"
                name="fecha_nacimiento"
                className="input-primary"
                value={form.fecha_nacimiento}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="mt-6 space-y-6">
            <div>
              <label htmlFor="lugar_nacimiento" className="block text-sm font-medium text-gray-700 mb-2">
                Lugar de Nacimiento
              </label>
              <input
                id="lugar_nacimiento"
                type="text"
                name="lugar_nacimiento"
                placeholder="Ingrese lugar de nacimiento"
                className="input-primary"
                value={form.lugar_nacimiento}
                onChange={handleChange}
              />
            </div>
            
            <div>
              <label htmlFor="direccion_residencia" className="block text-sm font-medium text-gray-700 mb-2">
                Dirección de Residencia
              </label>
              <input
                id="direccion_residencia"
                type="text"
                name="direccion_residencia"
                placeholder="Ingrese su dirección de residencia"
                className="input-primary"
                value={form.direccion_residencia}
                onChange={handleChange}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="telefono_fijo" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono Fijo
                </label>
                <input
                  id="telefono_fijo"
                  type="tel"
                  name="telefono_fijo"
                  placeholder="Ingrese teléfono fijo"
                  className="input-primary"
                  value={form.telefono_fijo}
                  onChange={handleChange}
                />
              </div>
              
              <div>
                <label htmlFor="telefono_celular" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono Celular
                </label>
                <input
                  id="telefono_celular"
                  type="tel"
                  name="telefono_celular"
                  placeholder="Ingrese teléfono celular"
                  className="input-primary"
                  value={form.telefono_celular}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="correo_institucional" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Institucional *
                </label>
                <input
                  id="correo_institucional"
                  type="email"
                  name="correo_institucional"
                  placeholder="nombre.apellido@fesc.edu.co"
                  className="input-primary"
                  value={form.correo_institucional}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="correo_personal" className="block text-sm font-medium text-gray-700 mb-2">
                  Correo Personal
                </label>
                <input
                  id="correo_personal"
                  type="email"
                  name="correo_personal"
                  placeholder="Ingrese correo personal"
                  className="input-primary"
                  value={form.correo_personal}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="estado_laboral" className="block text-sm font-medium text-gray-700 mb-2">
                Estado Laboral *
              </label>
              <select
                id="estado_laboral"
                name="estado_laboral"
                className="input-primary"
                value={form.estado_laboral}
                onChange={handleChange}
                required
              >
                <option value="">Selecciona tu situación actual</option>
                <option value="seeking_internship">Busco prácticas profesionales</option>
                <option value="working">Actualmente trabajo</option>
                <option value="entrepreneur">Tengo emprendimiento propio</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* 2. INFORMACIÓN ACADÉMICA */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">2. Información Académica</h3>
            <button
              type="button"
              onClick={addEducationEntry}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>
          
          {form.informacion_academica.map((edu, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-800">Formación {index + 1}</h4>
                {form.informacion_academica.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeEducationEntry(index)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Formación *
                  </label>
                  <select
                    className="input-primary"
                    value={edu.tipo}
                    onChange={(e) => handleEducationChange(index, 'tipo', e.target.value)}
                    required
                  >
                    <option value="">Selecciona</option>
                    <option value="Secundaria">Secundaria</option>
                    <option value="Educación superior">Educación Superior</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institución *
                  </label>
                  <input
                    type="text"
                    className="input-primary"
                    value={edu.institucion}
                    onChange={(e) => handleEducationChange(index, 'institucion', e.target.value)}
                    placeholder="Nombre de la institución"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título Obtenido *
                  </label>
                  <input
                    type="text"
                    className="input-primary"
                    value={edu.titulo}
                    onChange={(e) => handleEducationChange(index, 'titulo', e.target.value)}
                    placeholder="Título obtenido"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Año de Finalización *
                  </label>
                  <input
                    type="number"
                    className="input-primary"
                    value={edu.anio_finalizacion}
                    onChange={(e) => handleEducationChange(index, 'anio_finalizacion', e.target.value)}
                    placeholder="Año"
                    min="1990"
                    max="2030"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 3. PERFIL PROFESIONAL */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">3. Perfil Profesional</h3>
          
          <div>
            <label htmlFor="perfil_profesional" className="block text-sm font-medium text-gray-700 mb-2">
              Describe tu perfil profesional, habilidades y experiencia
            </label>
            <textarea
              id="perfil_profesional"
              name="perfil_profesional"
              rows="6"
              className="input-primary resize-none"
              value={form.perfil_profesional}
              onChange={handleChange}
              placeholder="Describe tu perfil profesional, habilidades y experiencia..."
            />
          </div>
        </div>
        
        {/* 4. HERRAMIENTAS */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">4. Herramientas</h3>
              <p className="text-sm text-gray-600 mt-1">Herramientas que sabes utilizar: programas como Adobe, LibreOffice, lenguajes de programación, librerías, frameworks, etc.</p>
            </div>
            <button
              type="button"
              onClick={addTool}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {form.herramientas.map((tool, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  className="input-primary"
                  value={tool}
                  onChange={(e) => handleToolChange(index, e.target.value)}
                  placeholder="Nombre de la herramienta..."
                />
                {form.herramientas.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTool(index)}
                    className="text-red-600 hover:text-red-700 transition-colors p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* 5. EXPERIENCIA LABORAL */}
        <div className="border-b border-gray-200 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">5. Experiencia Laboral</h3>
            <button
              type="button"
              onClick={addExperienceEntry}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>
          
          {form.experiencia_laboral.map((exp, index) => (
            <div key={index} className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-800">Experiencia {index + 1}</h4>
                {form.experiencia_laboral.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeExperienceEntry(index)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa *
                  </label>
                  <input
                    type="text"
                    className="input-primary"
                    value={exp.empresa}
                    onChange={(e) => handleExperienceChange(index, 'empresa', e.target.value)}
                    placeholder="Nombre de la empresa"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    className="input-primary"
                    value={exp.cargo}
                    onChange={(e) => handleExperienceChange(index, 'cargo', e.target.value)}
                    placeholder="Cargo desempeñado"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del Jefe
                  </label>
                  <input
                    type="text"
                    className="input-primary"
                    value={exp.nombre_jefe}
                    onChange={(e) => handleExperienceChange(index, 'nombre_jefe', e.target.value)}
                    placeholder="Nombre del jefe inmediato"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cargo del Jefe
                  </label>
                  <input
                    type="text"
                    className="input-primary"
                    value={exp.cargo_jefe}
                    onChange={(e) => handleExperienceChange(index, 'cargo_jefe', e.target.value)}
                    placeholder="Cargo del jefe inmediato"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono de la Empresa
                  </label>
                  <input
                    type="tel"
                    className="input-primary"
                    value={exp.telefono_empresa}
                    onChange={(e) => handleExperienceChange(index, 'telefono_empresa', e.target.value)}
                    placeholder="Ingrese teléfono celular"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio *
                  </label>
                  <input
                    type="month"
                    className="input-primary"
                    value={exp.fecha_inicio}
                    onChange={(e) => handleExperienceChange(index, 'fecha_inicio', e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Fin *
                  </label>
                  <input
                    type="month"
                    className="input-primary"
                    value={exp.fecha_fin}
                    onChange={(e) => handleExperienceChange(index, 'fecha_fin', e.target.value)}
                    placeholder="Deja vacío si es trabajo actual"
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funciones Realizadas
                  </label>
                  <textarea
                    rows="3"
                    className="input-primary resize-none"
                    value={exp.funciones}
                    onChange={(e) => handleExperienceChange(index, 'funciones', e.target.value)}
                    placeholder="Describe las principales funciones y responsabilidades..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logros Obtenidos
                  </label>
                  <textarea
                    rows="3"
                    className="input-primary resize-none"
                    value={exp.logros}
                    onChange={(e) => handleExperienceChange(index, 'logros', e.target.value)}
                    placeholder="Describe los principales logros y resultados obtenidos..."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 6. FIRMA DIGITAL */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">6. Firma Digital</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dibuja tu firma digital
              </label>
              <canvas
                ref={canvasRef}
                width="400"
                height="200"
                className="border border-gray-300 rounded-lg cursor-crosshair bg-white w-full max-w-full"
                style={{ touchAction: 'none', maxWidth: '100%' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseOut={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
              
              <div className="flex gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={limpiarFirma}
                  className="text-sm px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Limpiar Firma
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-1">
                Dibuja tu firma usando el mouse o toca la pantalla en dispositivos móviles
              </p>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div>
                <label htmlFor="firma_png" className="block text-sm font-medium text-gray-700 mb-2">
                  O subir imagen de firma (PNG/JPG)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    id="firma_png"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="firma_png"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4" />
                    Seleccionar Archivo
                  </label>
                  {form.firma_png && (
                    <span className="text-sm text-green-600">
                      {form.firma_png.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mensajes de estado */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          </div>
        )}
        
        {/* Botón de envío */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-accent text-white rounded-lg px-8 py-3 font-semibold hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Registrando...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Registrar Hoja de Vida
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
