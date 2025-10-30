import React, { useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown } from "lucide-react";

export default function Combobox({
  label,
  options = [],
  value = [],
  onChange,
  placeholder = "Busca y selecciona...",
  multiple = true,
  required = false,
  disabled = false,
  error = "",
  className = "",
  debounceDelay = 300,
  maxResults = 10
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    // Clear previous timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timeout for filtering
    debounceTimerRef.current = setTimeout(() => {
      if (search.trim() === "") {
        setFilteredOptions(options.slice(0, maxResults));
      } else {
        const filtered = options.filter(option =>
          option.label.toLowerCase().includes(search.toLowerCase()) ||
          option.searchText?.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredOptions(filtered.slice(0, maxResults));
      }
    }, debounceDelay);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [search, options, debounceDelay, maxResults]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    if (multiple) {
      const newValue = value.includes(option.value)
        ? value.filter(v => v !== option.value)
        : [...value, option.value];
      onChange(newValue);
    } else {
      onChange([option.value]);
      setOpen(false);
      setSearch("");
    }
  };

  const handleRemove = (itemValue) => {
    const newValue = value.filter(v => v !== itemValue);
    onChange(newValue);
  };

  const handleFocus = () => {
    setOpen(true);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const getSelectedLabels = () => {
    return value
      .map(v => options.find(opt => opt.value === v)?.label)
      .filter(Boolean);
  };

  const selectedLabels = getSelectedLabels();

  return (
    <div className="w-full" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-600">*</span>}
        </label>
      )}

      <div
        className={`relative border rounded-lg bg-white transition-all ${
          error ? "border-red-500" : open ? "border-accent ring-2 ring-accent ring-opacity-20" : "border-gray-300"
        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${className}`}
      >
        {/* Selected Items */}
        <div className="flex flex-wrap gap-1 p-2 min-h-10">
          {selectedLabels.length > 0 ? (
            <>
              {selectedLabels.map((label, idx) => {
                const selectedValue = value[idx];
                return (
                  <span
                    key={selectedValue}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-white text-sm rounded"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => handleRemove(selectedValue)}
                      disabled={disabled}
                      className="hover:bg-red-600 rounded p-0.5 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </>
          ) : null}

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={handleFocus}
            disabled={disabled}
            placeholder={selectedLabels.length === 0 ? placeholder : ""}
            className="flex-1 outline-none text-sm bg-transparent min-w-32 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Dropdown Icon */}
        <button
          type="button"
          onClick={handleFocus}
          disabled={disabled}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronDown className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Menu */}
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 text-center">
                No hay opciones disponibles
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                    value.includes(option.value)
                      ? "bg-accent text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {multiple && (
                      <input
                        type="checkbox"
                        checked={value.includes(option.value)}
                        readOnly
                        className="w-4 h-4 rounded border-gray-300"
                      />
                    )}
                    <div>
                      <div className="font-medium">{option.label}</div>
                      {option.sublabel && (
                        <div className="text-xs opacity-75">{option.sublabel}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
