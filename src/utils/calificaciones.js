// Utility functions for managing student grades/calificaciones

export function calcularPromedio(calificaciones = []) {
  if (!calificaciones || calificaciones.length === 0) {
    return null;
  }

  const notasValidas = calificaciones.filter(n => n !== null && n !== undefined && n !== "");
  if (notasValidas.length === 0) {
    return null;
  }

  const suma = notasValidas.reduce((acc, nota) => {
    const num = parseFloat(nota);
    return !isNaN(num) ? acc + num : acc;
  }, 0);

  return (suma / notasValidas.length).toFixed(2);
}

export function formatearCalificacion(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return "-";
  }

  const num = parseFloat(valor);
  if (isNaN(num)) {
    return "-";
  }

  return num.toFixed(2);
}

export function obtenerColorCalificacion(promedio) {
  if (promedio === null || promedio === undefined) {
    return { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" };
  }

  const valor = parseFloat(promedio);

  if (valor >= 4.0) {
    return { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" };
  } else if (valor >= 3.5) {
    return { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-300" };
  } else if (valor >= 3.0) {
    return { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" };
  } else {
    return { bg: "bg-red-100", text: "text-red-700", border: "border-red-300" };
  }
}
