import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CFormInput,
  CFormLabel,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from "@coreui/react";
import { getCajaAbierta, abrirCaja, cerrarCaja, getHistorialCajas } from "../api/caja";
import { getMiEmpleado } from "../api/empleados";

const Caja = ({ token, empleadoId }) => {
  const [cajaAbierta, setCajaAbierta] = useState(null);
  const [saldoInicial, setSaldoInicial] = useState("");
  const [saldoFinal, setSaldoFinal] = useState("");
  const [fechaApertura, setFechaApertura] = useState("");
  const [empleadoIdLocal, setEmpleadoIdLocal] = useState(empleadoId || "");
  const tokenLocal = token || localStorage.getItem("token");
  const [resumenCaja, setResumenCaja] = useState(null);
  const [resumenVisible, setResumenVisible] = useState(false);

  // Obtener caja abierta al cargar
  const fetchCaja = async () => {
    try {
      const data = await getHistorialCajas(tokenLocal);
      const cajasAbiertas = (Array.isArray(data) ? data : []).filter(c => c.estado === 1 || c.Estado === 1);
      setCajaAbierta(cajasAbiertas.length > 0 ? cajasAbiertas[0] : null);
    } catch (error) {
      console.error('Error al obtener caja:', error);
      // Fallback: intentar endpoint dedicado
      try {
        const caja = await getCajaAbierta(tokenLocal);
        setCajaAbierta(caja);
      } catch (err) {
        console.warn('Fallback getCajaAbierta also failed:', err);
      }
    }
  };

  useEffect(() => {
    fetchCaja();
  }, []);

  // Si no se recibió empleadoId por props, intentar obtenerlo desde el usuario logueado
  useEffect(() => {
    const ensureEmpleado = async () => {
      if (empleadoIdLocal) return;
      try {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        if (user && user.id) {
          const miEmpleado = await getMiEmpleado(tokenLocal, user.id);
          if (miEmpleado && miEmpleado.id) {
            setEmpleadoIdLocal(String(miEmpleado.id));
          }
        }
      } catch (err) {
        console.warn("No se pudo determinar empleadoId desde el usuario:", err);
      }
    };

    ensureEmpleado();
  }, [tokenLocal, empleadoIdLocal]);

  // Abrir caja
  const handleAbrirCaja = async () => {
    try {
      if (!saldoInicial) {
        alert("Ingrese el saldo inicial.");
        return;
      }

      // Fecha de apertura es opcional: si no se especifica, enviaremos el JSON mínimo

      // Usar el empleadoId local si existe
      let empleadoParaEnviar = empleadoIdLocal || empleadoId || null;

      // Si aún no tenemos empleado, intentar obtenerlo ahora (por si token no estaba antes)
      if (!empleadoParaEnviar) {
        try {
          const userStr = localStorage.getItem("user");
          const user = userStr ? JSON.parse(userStr) : null;
          if (user && user.id) {
            const miEmpleado = await getMiEmpleado(tokenLocal, user.id);
            if (miEmpleado && miEmpleado.id) {
              empleadoParaEnviar = String(miEmpleado.id);
              setEmpleadoIdLocal(empleadoParaEnviar);
            }
          }
        } catch (err) {
          console.warn("No se pudo obtener empleado antes de abrir caja:", err);
        }
      }

      if (!empleadoParaEnviar) {
        alert("No se detectó el ID del empleado. Inicia sesión o ingresa el ID manualmente.");
        return;
      }

      // Si no hay fechaApertura, enviar el JSON simple que probaste en Swagger
      if (!fechaApertura) {
        console.log("Abrir caja payload (simple):", { saldoInicial, empleadoParaEnviar });
        await abrirCaja(tokenLocal, saldoInicial, empleadoParaEnviar);
      } else {
        console.log("Abrir caja payload:", { saldoInicial, empleadoParaEnviar, fechaApertura });
        await abrirCaja(tokenLocal, saldoInicial, empleadoParaEnviar, fechaApertura);
      }

      alert("Caja abierta correctamente.");
      fetchCaja();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // Cerrar caja
  const handleCerrarCaja = async () => {
    try {
      if (!saldoFinal) {
        alert("Ingrese el saldo final.");
        return;
      }

      const resumen = await cerrarCaja(tokenLocal, cajaAbierta.id, saldoFinal);
      // Mostrar resumen si viene en la respuesta
      setResumenCaja(resumen || null);
      setResumenVisible(true);
      // Actualizar estado de caja
      await fetchCaja();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <CRow>
      <CCol md={6}>
        <CCard>
          <CCardBody>
            {!cajaAbierta ? (
              <>
                <h4>Abrir Caja</h4>

                <CFormLabel>Saldo Inicial</CFormLabel>
                <CFormInput
                  type="number"
                  value={saldoInicial}
                  onChange={(e) => setSaldoInicial(e.target.value)}
                />

                <CFormLabel className="mt-3">Fecha de apertura</CFormLabel>
                <CFormInput
                  type="date"
                  value={fechaApertura}
                  onChange={(e) => setFechaApertura(e.target.value)}
                />


                {empleadoIdLocal && (
                  <p className="mt-2" style={{ fontSize: '14px', color: '#6B7280' }}>
                    Empleado detectado: <strong>{empleadoIdLocal}</strong>
                  </p>
                )}

                <CButton className="mt-3" color="primary" onClick={handleAbrirCaja}>
                  Abrir Caja
                </CButton>
              </>
            ) : (
              <>
                <h4>Caja Abierta</h4>

                <p>
                  <strong>ID:</strong> {cajaAbierta.id}
                </p>
                <p>
                  <strong>Fecha Apertura:</strong> {cajaAbierta.fechaApertura}
                </p>
                <p>
                  <strong>Saldo Inicial:</strong> ${cajaAbierta.saldoInicial}
                </p>

                <CFormLabel>Saldo Final</CFormLabel>
                <CFormInput
                  type="number"
                  value={saldoFinal}
                  onChange={(e) => setSaldoFinal(e.target.value)}
                />

                <CButton className="mt-3" color="danger" onClick={handleCerrarCaja}>
                  Cerrar Caja
                </CButton>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
      {/* Modal con resumen de cierre */}
      <CModal visible={resumenVisible} onClose={() => setResumenVisible(false)} alignment="center">
        <CModalHeader>
          <CModalTitle>Resumen de Cierre</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {resumenCaja ? (
            <div>
              {/* Mostrar campos comunes si existen */}
              {resumenCaja.cajaId && <p><strong>Caja:</strong> #{resumenCaja.cajaId}</p>}
              {resumenCaja.empleadoId && <p><strong>Empleado ID:</strong> {resumenCaja.empleadoId}</p>}
              {resumenCaja.totalVentas !== undefined && <p><strong>Total Ventas:</strong> ${Number(resumenCaja.totalVentas).toFixed(2)}</p>}
              {resumenCaja.ganancias !== undefined && <p><strong>Ganancias:</strong> ${Number(resumenCaja.ganancias).toFixed(2)}</p>}
              {resumenCaja.diferencia !== undefined && <p><strong>Diferencia:</strong> ${Number(resumenCaja.diferencia).toFixed(2)}</p>}
              {resumenCaja.ventasCount !== undefined && <p><strong>Número de Ventas:</strong> {resumenCaja.ventasCount}</p>}
              {/* Si hay un detalle de ventas, mostrar un resumen pequeño */}
              {Array.isArray(resumenCaja.ventas) && resumenCaja.ventas.length > 0 && (
                <div>
                  <h6>Ventas ({resumenCaja.ventas.length}):</h6>
                  <ul>
                    {resumenCaja.ventas.slice(0, 10).map((v, i) => (
                      <li key={i}>#{v.id} - ${v.total}</li>
                    ))}
                    {resumenCaja.ventas.length > 10 && <li>...({resumenCaja.ventas.length - 10} más)</li>}
                  </ul>
                </div>
              )}
              {/* Fallback: mostrar JSON completo para debugging */}
              <div style={{ marginTop: 10, fontSize: 12, color: '#374151' }}>
                <strong>Detalles crudos:</strong>
                <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 250, overflow: 'auto' }}>{JSON.stringify(resumenCaja, null, 2)}</pre>
              </div>
            </div>
          ) : (
            <p>No se recibió detalle del cierre.</p>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setResumenVisible(false)}>Cerrar</CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  );
};

export default Caja;
