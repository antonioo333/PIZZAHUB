import callApi from "../utils/apiProxy";

/**
 * Obtener la caja abierta actual
 */
export const getCajaAbierta = async (token) => {
  const response = await callApi('/api/Caja/abierta', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return null; // No hay caja abierta
  }

  if (!response.ok) {
    // Try to read error body safely
    let text = '';
    try {
      text = await response.text();
    } catch (e) {
      text = String(e || '');
    }
    throw new Error(text || "Error al obtener la caja abierta");
  }

  try {
    return await response.json();
  } catch (e) {
    // If body is empty or not JSON, return null to indicate no caja
    return null;
  }
};

/**
 * Abrir una nueva caja
 */
/**
 * Abrir una nueva caja (con fecha elegida manualmente)
 */
export const abrirCaja = async (token, saldoInicial, empleadoId, fechaApertura, windowMinutes) => {
  const bodyObj = {
    saldoInicial: parseFloat(saldoInicial),
    empleadoId: empleadoId || null,
  };

  if (fechaApertura) {
    bodyObj.fecha = new Date(fechaApertura).toISOString();
  }

  if (windowMinutes) {
    bodyObj.windowMinutes = parseInt(windowMinutes, 10);
  }

  const response = await callApi('/api/Caja/abrir', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(bodyObj),
  });

  if (!response.ok) {
    // Try to parse JSON error, fall back to text
    try {
      const errJson = await response.json();
      throw new Error(errJson.message || JSON.stringify(errJson));
    } catch (e) {
      const text = await response.text().catch(() => '');
      throw new Error(text || 'Error al abrir la caja');
    }
  }

  try {
    return await response.json();
  } catch (e) {
    // If backend returned empty body on success, return an empty object
    return {};
  }
};


/**
 * Cerrar caja y obtener resumen
 */
export const cerrarCaja = async (token, cajaId, saldoFinal) => {
  const response = await callApi(`/api/Caja/${cajaId}/cerrar`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      saldoFinal: parseFloat(saldoFinal),
    }),
  });

  if (!response.ok) {
    try {
      const errJson = await response.json();
      throw new Error(errJson.message || JSON.stringify(errJson));
    } catch (e) {
      const text = await response.text().catch(() => '');
      throw new Error(text || 'Error al cerrar la caja');
    }
  }

  try {
    return await response.json();
  } catch (e) {
    return {};
  }
};

/**
 * Obtener resumen de una caja específica
 */
export const getResumenCaja = async (token, cajaId) => {
  const response = await callApi(`/api/Caja/${cajaId}/resumen`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let text = '';
    try { text = await response.text(); } catch (e) { text = String(e || ''); }
    throw new Error(text || "Error al obtener el resumen de la caja");
  }

  try { return await response.json(); } catch (e) { return null; }
};

/**
 * Obtener historial de cajas
 */
export const getHistorialCajas = async (token) => {
  const response = await callApi('/api/Caja', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let text = '';
    try { text = await response.text(); } catch (e) { text = String(e || ''); }
    throw new Error(text || "Error al obtener el historial de cajas");
  }

  try { return await response.json(); } catch (e) { return []; }
};
