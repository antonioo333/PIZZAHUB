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
import { getCajaAbierta, abrirCaja, cerrarCaja } from "../api/cajaApi";

const Caja = ({ token, empleadoId }) => {
  const [cajaAbierta, setCajaAbierta] = useState(null);
  const [saldoInicial, setSaldoInicial] = useState("");
  const [saldoFinal, setSaldoFinal] = useState("");
  const [fechaApertura, setFechaApertura] = useState("");

  // Obtener caja abierta al cargar
  const fetchCaja = async () => {
    try {
      const caja = await getCajaAbierta(token);
      setCajaAbierta(caja);
    } catch (error) {
      console.error("Error al obtener caja:", error);
    }
  };

  useEffect(() => {
    fetchCaja();
  }, []);

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

      await abrirCaja(token, saldoInicial, empleadoId, fechaApertura);

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

      await cerrarCaja(token, cajaAbierta.id, saldoFinal);

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
