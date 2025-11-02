import React, { useState, useCallback, useEffect } from "react";
import { Search, Filter, ArrowUpDown } from "lucide-react";

export default function ValidacionFirmasFilters({
  onSearch,
  onFilterChange,
  onSortChange,
  isLoading = false
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedSort, setSelectedSort] = useState("createdAt_desc");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, onSearch]);

  const handleFilterChange = (e) => {
    const type = e.target.value;
    setSelectedType(type);
    onFilterChange(type);
  };

  const handleSortChange = (e) => {
    const sort = e.target.value;
    setSelectedSort(sort);
    onSortChange(sort);
  };

  const resourceTypes = [
    { value: "", label: "Todos los tipos" },
    { value: "arl", label: "ARL" },
    { value: "atlas", label: "ATLAS" },
    { value: "seguimiento", label: "Seguimiento" },
    { value: "evaluacion", label: "Evaluación" },
    { value: "autoevaluacion", label: "Autoevaluación" },
    { value: "certificado", label: "Certificado" },
    { value: "anexo", label: "Anexo" }
  ];

  const sortOptions = [
    { value: "createdAt_desc", label: "Más recientes primero" },
    { value: "createdAt_asc", label: "Más antiguos primero" },
    { value: "updatedAt_desc", label: "Modificados recientemente" },
    { value: "updatedAt_asc", label: "Modificados hace tiempo" }
  ];

  return (
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div class="relative">
          <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, estudiante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
          />
          {isLoading && (
            <span class="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg class="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
          )}
        </div>

        {/* Filter by Type */}
        <div class="relative">
          <Filter class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={selectedType}
            onChange={handleFilterChange}
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent appearance-none bg-white cursor-pointer"
          >
            {resourceTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Options */}
        <div class="relative">
          <ArrowUpDown class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={selectedSort}
            onChange={handleSortChange}
            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent appearance-none bg-white cursor-pointer"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
