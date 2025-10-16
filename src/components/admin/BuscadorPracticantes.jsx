import React, { useState, useEffect, useRef } from "react";
import { Search, Filter, Loader2, AlertCircle } from "lucide-react";

export default function BuscadorPracticantes({
  onResultsChange,
  onPaginationChange,
  onSortChange
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [pagoFilter, setPagoFilter] = useState("");
  const [usuarioFilter, setUsuarioFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const debounceTimer = useRef(null);

  const buscarPracticantes = async (term, pago, usuario, page, sort = sortBy, order = sortOrder) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (term) params.append("q", term);
      if (pago) params.append("pago", pago);
      if (usuario) params.append("usuario", usuario);
      params.append("page", page);
      params.append("sortBy", sort);
      params.append("sortOrder", order);

      console.log("Buscando practicantes con params:", params.toString());

      const res = await fetch(`/api/practicantes/buscar?${params}`);
      console.log("Response status:", res.status);

      if (res.ok) {
        const data = await res.json();
        console.log("Data recibida:", data);

        // Put data in window and dispatch events so Astro script can listen
        window.currentResults = data.practicantes;
        window.currentPagination = data.pagination;

        console.log("Actualizando tabla con", data.practicantes.length, "resultados");

        // Dispatch custom event for Astro script to listen
        if (window.updateTablaVista) {
          console.log("Llamando updateTablaVista");
          window.updateTablaVista();
        }

        if (window.renderPaginacion) {
          console.log("Llamando renderPaginacion");
          window.renderPaginacion();
        }

        // Also call callbacks if they exist
        if (onResultsChange && typeof onResultsChange === 'function') {
          console.log("Llamando onResultsChange callback");
          onResultsChange(data.practicantes);
        }

        if (onPaginationChange && typeof onPaginationChange === 'function') {
          console.log("Llamando onPaginationChange callback");
          onPaginationChange(data.pagination);
        }

        setError("");
      } else {
        const data = await res.json();
        setError(data.error || "Error al buscar practicantes");
        console.error("Response not OK. Error:", data);
      }
    } catch (error) {
      setError("Error de conexión: " + error.message);
      console.error("Error completo:", error);
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda inicial
  useEffect(() => {
    console.log("Componente montado, haciendo búsqueda inicial");
    window.onPageChangeFromBuscador = (page) => {
      setCurrentPage(page);
    };
    window.onSortChangeFromBuscador = (field) => {
      handleSortChange(field);
    };
    buscarPracticantes("", "", "", 1, "createdAt", "desc");
  }, []);

  // Debounce para búsqueda
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setCurrentPage(1); // Reset a página 1 cuando cambia búsqueda
      buscarPracticantes(searchTerm, pagoFilter, usuarioFilter, 1);
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm, pagoFilter, usuarioFilter]);

  // Efecto para cambiar página
  useEffect(() => {
    if (currentPage !== 1) {
      buscarPracticantes(searchTerm, pagoFilter, usuarioFilter, currentPage, sortBy, sortOrder);
    }
  }, [currentPage]);

  // Efecto para cambiar sorting
  useEffect(() => {
    setCurrentPage(1);
    buscarPracticantes(searchTerm, pagoFilter, usuarioFilter, 1, sortBy, sortOrder);
  }, [sortBy, sortOrder]);

  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Change sort field and default to desc
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre, correo o cédula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
        />
        {loading && <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-accent animate-spin" />}
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Filter className="w-4 h-4 inline mr-1" />
            Estado de Pago
          </label>
          <select
            value={pagoFilter}
            onChange={(e) => setPagoFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
          >
            <option value="">Todos</option>
            <option value="validado">✅ Pago Validado</option>
            <option value="no_validado">❌ Pago No Validado</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Filter className="w-4 h-4 inline mr-1" />
            Registro de Estudiante
          </label>
          <select
            value={usuarioFilter}
            onChange={(e) => setUsuarioFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
          >
            <option value="">Todos</option>
            <option value="creado">✅ Usuario Creado</option>
            <option value="pendiente">⚠️ Usuario Pendiente (Incompleto)</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
