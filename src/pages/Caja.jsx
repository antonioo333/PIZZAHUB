import React, { useEffect, useState } from "react";
import {
  CCard,
  CCardHeader,
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
  CBadge,
} from "@coreui/react";
import { getCajaAbierta, abrirCaja, cerrarCaja, getResumenCaja } from "../api/caja";
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

      const cerrarResult = await cerrarCaja(tokenLocal, cajaAbierta.id, saldoFinal);

      // After closing, fetch the resumen from the dedicated endpoint
      let resumen = null;
      try {
        resumen = await getResumenCaja(tokenLocal, cajaAbierta.id);
      } catch (err) {
        // if resumen endpoint fails, try to use the response from close
        resumen = cerrarResult || null;
        console.warn("No se pudo obtener resumen vía GET, usando respuesta de cierre:", err);
      }

      alert("Caja cerrada correctamente.");
      fetchCaja();
      setResumenCaja(resumen);
      setShowResumen(true);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // Estado para mostrar el resumen tras cerrar
  const [resumenCaja, setResumenCaja] = useState(null);
  const [showResumen, setShowResumen] = useState(false);

  const formatCurrency = (v) => {
    if (v === null || v === undefined) return '-';
    const n = Number(v) || 0;
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);
  };

  const highlightStyle = (ok) => ({
    padding: '6px 10px',
    borderRadius: 6,
    background: ok ? '#ECFDF5' : '#FEF2F2',
    color: ok ? '#065F46' : '#991B1B',
    display: 'inline-block',
    fontWeight: 700,
  });

  const computeResumenNumbers = (r) => {
    if (!r) return { si: 0, tv: 0, sf: 0, expected: 0, diff: 0 };
    const si = Number(r.saldoInicial ?? r.SaldoInicial ?? 0) || 0;
    const tv = Number(r.totalVentas ?? r.TotalVentas ?? 0) || 0;
    const sf = Number(r.saldoFinal ?? r.SaldoFinal ?? 0) || 0;
    const expected = si + tv;
    const diff = sf - expected;
    return { si, tv, sf, expected, diff };
  };

  return (
    <>
    <CRow className="justify-content-center">
      <CCol md={6} style={{ maxWidth: 760 }}>
        <CCard>
          <CCardBody>
            {!cajaAbierta ? (
              <>
                <CCardHeader style={{ background: '#fff', borderBottom: '1px solid #eef2f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>Abrir Caja</div>
                      <div style={{ fontSize: 13, color: '#6B7280' }}>Registra el saldo inicial y la fecha de apertura</div>
                    </div>
                  </div>
                </CCardHeader>

                <div style={{ padding: 18, display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <CFormLabel style={{ fontWeight: 700 }}>Saldo Inicial</CFormLabel>
                    <CFormInput
                      placeholder="0.00"
                      style={{ height: 44, fontSize: 15 }}
                      type="number"
                      value={saldoInicial}
                      onChange={(e) => setSaldoInicial(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <CFormLabel style={{ fontWeight: 700 }}>Fecha de apertura</CFormLabel>
                      <CFormInput
                        style={{ height: 44 }}
                        type="date"
                        value={fechaApertura}
                        onChange={(e) => setFechaApertura(e.target.value)}
                      />
                    </div>
                    <div style={{ width: 170 }}>
                      <CFormLabel style={{ fontWeight: 700 }}>Opciones</CFormLabel>
                      <div style={{ fontSize: 13, color: '#6B7280' }}>Sin opciones visibles</div>
                    </div>
                  </div>

                  {empleadoIdLocal && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <CBadge color="info">Empleado</CBadge>
                      <div style={{ fontSize: 14 }}><strong>{empleadoIdLocal}</strong></div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                    <CButton color="primary" onClick={handleAbrirCaja} style={{ padding: '8px 20px', fontWeight: 700 }}>Abrir Caja</CButton>
                  </div>
                </div>
              </>
            ) : (
              <>
                <CCardHeader style={{ background: '#fff', borderBottom: '1px solid #eef2f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>Caja Abierta</div>
                      <div style={{ fontSize: 13, color: '#6B7280' }}>Información de la sesión actual</div>
                    </div>
                    <div>
                      <div style={{ color: '#065F46', fontWeight: 700 }}>Abierta</div>
                    </div>
                  </div>
                </CCardHeader>

                <div style={{ padding: 18, display: 'grid', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#6B7280', fontSize: 13 }}>Fecha Apertura</div>
                      <div style={{ fontSize: 16 }}><strong>{cajaAbierta.fechaApertura}</strong></div>
                    </div>
                    <div style={{ width: 200 }}>
                      <div style={{ color: '#6B7280', fontSize: 13 }}>Saldo Inicial</div>
                      <div style={{ fontSize: 16 }}><strong>{formatCurrency(cajaAbierta.saldoInicial)}</strong></div>
                    </div>
                  </div>

                  <div>
                    <CFormLabel style={{ fontWeight: 700 }}>Saldo Final</CFormLabel>
                    <CFormInput
                      style={{ height: 44 }}
                      type="number"
                      value={saldoFinal}
                      onChange={(e) => setSaldoFinal(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <CButton color="danger" onClick={handleCerrarCaja} style={{ padding: '8px 20px', fontWeight: 700 }}>Cerrar Caja</CButton>
                  </div>
                </div>
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    <CModal visible={showResumen} onClose={() => setShowResumen(false)} size="lg">
      <CModalHeader>
        <CModalTitle>Resumen de Cierre de Caja</CModalTitle>
      </CModalHeader>
      <CModalBody>
        {resumenCaja && (() => {
          const { si, tv, sf, expected, diff } = computeResumenNumbers(resumenCaja);
          const ok = Math.abs(diff) < 0.01;
          return (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={highlightStyle(ok)}>{ok ? 'Balance OK' : `Diferencia ${formatCurrency(diff)}`}</div>
                <div style={{ fontSize: 13, color: '#6B7280' }}>Esperado: {formatCurrency(expected)} • Real: {formatCurrency(sf)}</div>
              </div>
            </>
          )
        })()}
        {resumenCaja ? (
          <div style={{ gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div>
                <div><strong>Fecha:</strong> {resumenCaja.fecha ? new Date(resumenCaja.fecha).toLocaleString() : (resumenCaja.Fecha ? new Date(resumenCaja.Fecha).toLocaleString() : '-')}</div>
                <div><strong>Empleado:</strong> {resumenCaja.empleadoNombre || resumenCaja.EmpleadoNombre || '-'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div><strong>Saldo Inicial:</strong> {formatCurrency(resumenCaja.saldoInicial || resumenCaja.SaldoInicial)}</div>
                <div><strong>Saldo Final:</strong> {formatCurrency(resumenCaja.saldoFinal || resumenCaja.SaldoFinal)}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <div><strong>Total Ventas:</strong> {formatCurrency(resumenCaja.totalVentas || resumenCaja.TotalVentas)}</div>
              <div><strong>Cantidad Ventas:</strong> {resumenCaja.cantidadVentas || resumenCaja.CantidadVentas || 0}</div>
            </div>

            { (resumenCaja.ventasPorMetodoPago || resumenCaja.VentasPorMetodoPago) && (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 600, marginBottom: 6 }}>Ventas por método</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <tbody>
                    {Object.entries(resumenCaja.ventasPorMetodoPago || resumenCaja.VentasPorMetodoPago).map(([k, v]) => (
                      <tr key={k}>
                        <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee' }}>{k}</td>
                        <td style={{ padding: '6px 8px', borderBottom: '1px solid #eee', textAlign: 'right' }}>{formatCurrency(v)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

          </div>
        ) : (
          <div>No hay resumen disponible.</div>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={() => setShowResumen(false)}>Cerrar</CButton>
      </CModalFooter>
    </CModal>
    </>
  );
};

export default Caja;
