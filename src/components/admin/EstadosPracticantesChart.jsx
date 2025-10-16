import React from 'react';

export default function EstadosPracticantesChart({
  pendientes,
  revisando,
  finalizados,
  rechazados,
  otrosEstados = 0,
  totalPracticantes
}) {
  const datos = [
    { label: 'Pendientes', value: pendientes, color: '#F59E0B', bgColor: 'bg-yellow-50', textColor: 'text-yellow-900', borderColor: 'border-yellow-200', dotColor: 'bg-yellow-500' },
    { label: 'En Revisión', value: revisando, color: '#3B82F6', bgColor: 'bg-blue-50', textColor: 'text-blue-900', borderColor: 'border-blue-200', dotColor: 'bg-blue-500' },
    { label: 'Finalizados', value: finalizados, color: '#10B981', bgColor: 'bg-green-50', textColor: 'text-green-900', borderColor: 'border-green-200', dotColor: 'bg-green-500' },
    { label: 'Rechazados', value: rechazados, color: '#EF4444', bgColor: 'bg-red-50', textColor: 'text-red-900', borderColor: 'border-red-200', dotColor: 'bg-red-500' },
    ...(otrosEstados > 0 ? [{ label: 'Otros', value: otrosEstados, color: '#8B5CF6', bgColor: 'bg-purple-50', textColor: 'text-purple-900', borderColor: 'border-purple-200', dotColor: 'bg-purple-500' }] : [])
  ];

  // Calcular ángulos para el gráfico de pastel
  const getSlices = () => {
    let currentAngle = 0;
    return datos.map((dato) => {
      const sliceAngle = totalPracticantes > 0 ? (dato.value / totalPracticantes) * 360 : 0;
      const slice = {
        ...dato,
        startAngle: currentAngle,
        endAngle: currentAngle + sliceAngle,
        angle: sliceAngle,
        percentage: totalPracticantes > 0 ? (dato.value / totalPracticantes) * 100 : 0
      };
      currentAngle += sliceAngle;
      return slice;
    });
  };

  const slices = getSlices();

  // Generar SVG para el gráfico de pastel
  const generatePieSlice = (slice, radius = 120) => {
    const centerX = 150;
    const centerY = 150;

    const startRad = (slice.startAngle * Math.PI) / 180;
    const endRad = (slice.endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startRad);
    const y1 = centerY + radius * Math.sin(startRad);
    const x2 = centerX + radius * Math.cos(endRad);
    const y2 = centerY + radius * Math.sin(endRad);

    const largeArc = slice.angle > 180 ? 1 : 0;

    const path = `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return path;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico de Pastel SVG */}
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg width="300" height="300" viewBox="0 0 300 300" className="drop-shadow-lg">
              {/* Fondo del pastel */}
              <circle cx="150" cy="150" r="120" fill="#f3f4f6" strokeWidth="0" />

              {/* Slices */}
              {slices.map((slice, idx) => (
                <path
                  key={idx}
                  d={generatePieSlice(slice)}
                  fill={slice.color}
                  opacity="0.9"
                  strokeWidth="2"
                  stroke="white"
                  className="transition-opacity hover:opacity-100 cursor-pointer"
                />
              ))}

              {/* Centro blanco */}
              <circle cx="150" cy="150" r="60" fill="white" strokeWidth="0" />

              {/* Texto en el centro */}
              <text
                x="150"
                y="145"
                textAnchor="middle"
                className="text-3xl font-bold fill-gray-800"
                fontSize="32"
                fontWeight="bold"
              >
                {totalPracticantes}
              </text>
              <text
                x="150"
                y="165"
                textAnchor="middle"
                className="fill-gray-500"
                fontSize="14"
              >
                Total
              </text>
            </svg>
          </div>
        </div>

        {/* Leyenda y detalles */}
        <div className="space-y-4">
          {slices.map((slice, idx) => (
            <div
              key={idx}
              className={`${slice.bgColor} border-l-4 ${slice.borderColor} rounded-lg p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${slice.dotColor}`}></div>
                  <span className="font-semibold text-gray-800">{slice.label}</span>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${slice.textColor}`}>
                    {slice.value}
                  </div>
                  <div className="text-xs text-gray-500">
                    {slice.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
              {/* Barra de progreso */}
              <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    backgroundColor: slice.color,
                    width: `${slice.percentage}%`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cards informativos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {slices.map((slice, idx) => (
          <div key={idx} className={`${slice.bgColor} border-2 ${slice.borderColor} rounded-lg p-4 text-center hover:shadow-md transition-shadow`}>
            <div className={`text-3xl font-bold ${slice.textColor} mb-1`}>
              {slice.value}
            </div>
            <div className={`text-xs font-medium ${slice.textColor} line-clamp-2`}>
              {slice.label}
            </div>
            <div className={`text-xs ${slice.textColor} opacity-75 mt-1 font-semibold`}>
              {slice.percentage.toFixed(1)}%
            </div>
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Total de practicantes:</span> <span className="text-lg font-bold text-gray-900">{totalPracticantes}</span>
        </p>
        <p className="text-xs text-gray-600 mt-2">
          {totalPracticantes > 0
            ? `${((finalizados / totalPracticantes) * 100).toFixed(1)}% completados | ${((pendientes / totalPracticantes) * 100).toFixed(1)}% por procesar`
            : 'Sin datos de practicantes'
          }
        </p>
      </div>
    </div>
  );
}
