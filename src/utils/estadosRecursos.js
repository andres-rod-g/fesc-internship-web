// Estados para recursos de prácticas
export const ESTADOS_RECURSO = {
  PENDIENTE: "pendiente",
  VALIDADO: "validado",
  RECHAZADO: "rechazado"
};

export const ESTADOS_RECURSO_LABELS = {
  pendiente: "Pendiente",
  validado: "Validado",
  rechazado: "Rechazado"
};

export const ESTADOS_RECURSO_COLORS = {
  pendiente: {
    bg: "bg-yellow-100",
    text: "text-yellow-700",
    border: "border-yellow-300",
    badge: "bg-yellow-200"
  },
  validado: {
    bg: "bg-green-100",
    text: "text-green-700",
    border: "border-green-300",
    badge: "bg-green-200"
  },
  rechazado: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
    badge: "bg-red-200"
  }
};

export function getEstadoLabel(estado) {
  return ESTADOS_RECURSO_LABELS[estado] || "Desconocido";
}

export function getEstadoColors(estado) {
  return ESTADOS_RECURSO_COLORS[estado] || ESTADOS_RECURSO_COLORS.pendiente;
}

export function esEstadoValido(estado) {
  return Object.values(ESTADOS_RECURSO).includes(estado);
}
