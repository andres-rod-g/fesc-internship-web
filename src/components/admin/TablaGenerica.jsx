import React, { useState, useEffect } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function TablaGenerica({
  columnas = [],
  datos = [],
  titulo = "Tabla",
  buscarPlaceholder = "Buscar...",
  camposBusqueda = [],
  itemsPorPagina = 10,
  renderFila = null,
  hideBuscador = false,
}) {
  const [search, setSearch] = useState("");
  const [filteredDatos, setFilteredDatos] = useState(datos);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredDatos(datos);
    } else {
      const filtered = datos.filter(item =>
        camposBusqueda.some(campo =>
          String(item[campo]).toLowerCase().includes(search.toLowerCase())
        )
      );
      setFilteredDatos(filtered);
    }
    setCurrentPage(1);
  }, [search, datos, camposBusqueda]);

  const startIndex = (currentPage - 1) * itemsPorPagina;
  const endIndex = startIndex + itemsPorPagina;
  const paginatedDatos = filteredDatos.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredDatos.length / itemsPorPagina);

  return (
    <div className="space-y-6">
      {/* Buscador */}
      {!hideBuscador && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Buscar y Filtrar</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={buscarPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">{titulo}</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200 table-auto">
            <thead className="bg-gray-50">
              <tr>
                {columnas.map((columna) => (
                  <th
                    key={columna.key}
                    style={columna.key === "accion" ? { width: "0px" } : {}}
                    className={`py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      columna.key === "accion" ? "p-0" : "px-6"
                    }`}
                  >
                    {columna.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedDatos.length > 0 ? (
                paginatedDatos.map((fila) => (
                  <tr key={fila._id || fila.id} className="hover:bg-gray-50">
                    {columnas.map((columna) => (
                      <td
                        key={`${fila._id}-${columna.key}`}
                        style={columna.key === "accion" ? { width: "0px" } : {}}
                        className={`whitespace-nowrap text-sm text-gray-900 ${
                          columna.key === "accion" ? "p-0" : "px-6 py-4"
                        }`}
                      >
                        {columna.render ? columna.render(fila) : fila[columna.key] || "-"}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columnas.length}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {search ? "No se encontraron resultados" : "Sin datos"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredDatos.length)} de{" "}
              {filteredDatos.length} resultados
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => {
                const page = i + 1;
                // Mostrar siempre primera, última y páginas alrededor de la actual
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
                        currentPage === page
                          ? "bg-accent text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
                // Mostrar puntos suspensivos
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return (
                    <span key={`dots-${page}`} className="px-2 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Siguiente página"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
