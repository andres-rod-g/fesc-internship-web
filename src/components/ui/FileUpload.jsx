import React, { useState } from "react";
import { Upload, X } from "lucide-react";

export default function FileUpload({
  label,
  name,
  onChange,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024,
  required = false,
  error = "",
  preview = false,
  currentFile = null,
  className = "",
  ...props
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fileName, setFileName] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > maxSize) {
        const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
        onChange({ target: { name, value: null, error: `El archivo debe ser menor a ${maxSizeMB}MB` } });
        return;
      }

      if (accept && !file.type.match(accept.replace('*', '.*'))) {
        onChange({ target: { name, value: null, error: 'Tipo de archivo no permitido' } });
        return;
      }

      setFileName(file.name);

      if (preview && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(file);
      }

      onChange({ target: { name, value: file } });
    }
  };

  const clearFile = () => {
    setPreviewUrl(null);
    setFileName("");
    onChange({ target: { name, value: null } });
    const input = document.getElementById(name);
    if (input) input.value = "";
  };

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <input
            id={name}
            name={name}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            required={required && !currentFile}
            className="hidden"
            {...props}
          />
          <label
            htmlFor={name}
            className={`flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer border-2 border-dashed border-gray-300 ${className}`}
          >
            <Upload className="w-5 h-5" />
            <span>Seleccionar Archivo</span>
          </label>

          {fileName && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-green-600">{fileName}</span>
              <button
                type="button"
                onClick={clearFile}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <p className="mt-1 text-xs text-gray-500">
            Tamaño máximo: {(maxSize / (1024 * 1024)).toFixed(1)}MB
          </p>
        </div>

        {preview && previewUrl && (
          <div className="flex-shrink-0">
            <img
              src={previewUrl}
              alt="Vista previa"
              className="w-20 h-20 object-cover rounded-lg border border-gray-300"
            />
          </div>
        )}

        {preview && !previewUrl && currentFile && (
          <div className="flex-shrink-0">
            <img
              src={typeof currentFile === 'string' ? currentFile : URL.createObjectURL(currentFile)}
              alt="Archivo actual"
              className="w-20 h-20 object-cover rounded-lg border border-gray-300"
            />
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
