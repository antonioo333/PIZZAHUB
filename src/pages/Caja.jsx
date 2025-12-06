import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CButton,
  CFormInput,
  CFormLabel,
} from "@coreui/react";
import { getCajaAbierta, abrirCaja, cerrarCaja } from "../api/caja";
import { getMiEmpleado } from "../api/empleados";

const Caja = ({ token, empleadoId }) => {
  const [cajaAbierta, setCajaAbierta] = useState(null);
  const [saldoInicial, setSaldoInicial] = useState("");
  const [saldoFinal, setSaldoFinal] = useState("");
  const [fechaApertura, setFechaApertura] = useState("");
  const [empleadoIdLocal, setEmpleadoIdLocal] = useState(empleadoId || "");
  const tokenLocal = token || localStorage.getItem("token");
  const [aperturaDiaCompleto, setAperturaDiaCompleto] = useState(false);

  // Obtener caja abierta al cargar
  const fetchCaja = async () => {
    try {
      const caja = await getCajaAbierta(tokenLocal);
      setCajaAbierta(caja);
    } catch (error) {
      console.error("Error al obtener caja:", error);
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

      if (!fechaApertura) {
        alert("Seleccione la fecha de apertura.");
        return;
      }

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

      const windowMinutes = aperturaDiaCompleto ? 1440 : 5;
      console.log("Abrir caja payload:", { saldoInicial, empleadoParaEnviar, fechaApertura, windowMinutes });
      await abrirCaja(tokenLocal, saldoInicial, empleadoParaEnviar, fechaApertura, windowMinutes);

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

        await cerrarCaja(tokenLocal, cajaAbierta.id, saldoFinal);

      alert("Caja cerrada correctamente.");
      fetchCaja();
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

                <div className="mt-2">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      checked={aperturaDiaCompleto}
                      onChange={(e) => setAperturaDiaCompleto(e.target.checked)}
                    />
                    <span style={{ fontSize: '14px' }}>Abrir para todo el día</span>
                  </label>
                </div>

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
    </CRow>
  );
};

export default Caja;
