// Rate limiter en memoria
// Estructura: { "ip": [timestamp1, timestamp2, ...] }
const requestStore = new Map();

// Limpiar automáticamente cada 5 minutos
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;

  for (const [ip, timestamps] of requestStore.entries()) {
    // Remover timestamps fuera de la ventana
    const validTimestamps = timestamps.filter(ts => ts > fiveMinutesAgo);

    if (validTimestamps.length === 0) {
      requestStore.delete(ip);
    } else {
      requestStore.set(ip, validTimestamps);
    }
  }
}, 60 * 1000); // Limpiar cada 1 minuto

/**
 * Verifica si una IP ha excedido el límite de rate
 * @param {string} ip - Dirección IP pública
 * @param {number} maxRequests - Máximo de requests permitidos (default: 30)
 * @param {number} windowMs - Ventana de tiempo en ms (default: 5 minutos)
 * @returns {object} { allowed: boolean, remaining: number, retryAfter: number }
 */
export function checkRateLimit(ip, maxRequests = 30, windowMs = 5 * 60 * 1000) {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Obtener timestamps para esta IP
  let timestamps = requestStore.get(ip) || [];

  // Filtrar requests dentro de la ventana
  timestamps = timestamps.filter(ts => ts > windowStart);

  // Calcular si está dentro del límite
  const isAllowed = timestamps.length < maxRequests;
  const remaining = Math.max(0, maxRequests - timestamps.length);

  // Si está permitido, agregar el nuevo request
  if (isAllowed) {
    timestamps.push(now);
    requestStore.set(ip, timestamps);
  }

  // Calcular cuándo se puede volver a intentar (en segundos)
  const oldestTimestamp = timestamps[0];
  const retryAfter = oldestTimestamp ? Math.ceil((oldestTimestamp + windowMs - now) / 1000) : 0;

  return {
    allowed: isAllowed,
    remaining,
    retryAfter: isAllowed ? 0 : retryAfter,
    requestCount: timestamps.length,
    maxRequests,
    windowSeconds: Math.floor(windowMs / 1000)
  };
}

/**
 * Obtiene la IP del cliente desde la solicitud
 */
export function getClientIP(request) {
  // Primero intentar obtener de headers comunes de proxies
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for puede contener múltiples IPs, tomar la primera
    return forwarded.split(',')[0].trim();
  }

  const clientIP = request.headers.get('x-real-ip') ||
                   request.headers.get('cf-connecting-ip') ||
                   request.socket?.remoteAddress ||
                   'unknown';

  return clientIP;
}
