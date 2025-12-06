import React, { useState, useEffect } from "react"
import callApi from "../utils/apiProxy"
import {
  CCol,
  CRow,
  CButton,
  CForm,
  CFormInput,
  CFormLabel,
  CCard,
  CCardBody,
  CCardHeader,
  CInputGroup,
  CInputGroupText,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CFormSelect,
  CSpinner
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilLockLocked, cilEnvelopeClosed, cilUserPlus, cilPhone } from '@coreui/icons'

// 🔹 Convertir rol numérico a texto
const rolToText = (rol) => {
  switch (rol) {
    case 0: return "Administrador"
    case 1: return "Repartidor"
    case 2: return "Empleado"
    case 3: return "Cliente"
    default: return "Desconocido"
  }
}

// 🔹 Convertir texto a número de rol
const textToRol = (texto) => {
  switch (texto) {
    case "Administrador": return 0
    case "Repartidor": return 1
    case "Empleado": return 2
    case "Cliente": return 3
    default: return 3
  }
}

const Usuarios = () => {

  const [formData, setFormData] = useState({
    nombreUsuario: '',
    email: '',
    password: '',
    telefonoContacto: ''
  })

  const [usuarios, setUsuarios] = useState([])
  const [cambiandoRol, setCambiandoRol] = useState(null)

  // 🔹 Cargar usuarios
  const fetchUsuarios = async () => {
    try {
      const token = localStorage.getItem("token")

      const res = await callApi('/api/Clientes', { headers: { "Authorization": `Bearer ${token}` } })

      if (!res.ok) {
        console.error("Error cargando usuarios:", res.status)
        return
      }

      const data = await res.json()
      setUsuarios(data)

    } catch (err) {
      console.error("Error:", err)
    }
  }

  useEffect(() => {
    fetchUsuarios()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await callApi('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const err = await response.text()
        console.log("Error:", err)
        alert("Error al registrar usuario (400)")
        return
      }

      alert("Cliente registrado correctamente ✔")

      setFormData({
        nombreUsuario: "",
        email: "",
        password: "",
        telefonoContacto: ""
      })

      fetchUsuarios()

    } catch (error) {
      console.error("Error:", error)
      alert("Error en el servidor")
    }
  }

  // 🔹 Cambiar rol de usuario
  const cambiarRol = async (usuarioId, nuevoRolTexto) => {
    const confirmar = window.confirm(
      `¿Estás seguro de cambiar el rol a "${nuevoRolTexto}"?`
    )

    if (!confirmar) return

    try {
      setCambiandoRol(usuarioId)
      const token = localStorage.getItem("token")

      const payload = {
        usuarioId: usuarioId,
        nuevoRol: nuevoRolTexto
      }

      const res = await callApi('/api/v1/auth/cambiar-rol', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errorText = await res.text()
        console.error('Error al cambiar rol:', errorText)
        throw new Error('Error al cambiar rol')
      }

      alert(`✅ Rol cambiado a "${nuevoRolTexto}" correctamente`)
      fetchUsuarios() // Recargar lista

    } catch (err) {
      console.error('Error:', err)
      alert('❌ Error al cambiar el rol')
    } finally {
      setCambiandoRol(null)
    }
  }

  return (
    <div className="page-container" style={{ background: '#F3F4F6', minHeight: '100vh', width: '100%', maxWidth: '100%', margin: 0 }}>

      {/* ------------------ FORMULARIO MODERNO ------------------ */}
      <CCard className="shadow-lg mb-4 fade-in" style={{ borderRadius: '20px', border: 'none' }}>
        <CCardHeader
          style={{
            background: 'white',
            borderBottom: '3px solid #FF6600',
            padding: '20px 30px',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px'
          }}
        >
          <div className="d-flex align-items-center">
            <CIcon icon={cilUser} size="lg" className="me-2" style={{ color: '#FF6600' }} />
            <h5 className="mb-0 fw-bold" style={{ color: '#1A1C20' }}>Registrar Nuevo Usuario</h5>
          </div>
        </CCardHeader>

        <CCardBody style={{ backgroundColor: 'white', padding: '30px' }}>
          <CForm onSubmit={handleSubmit}>
            <CRow className="g-4">

              <CCol md={6}>
                <CFormLabel className="fw-semibold">Nombre de Usuario</CFormLabel>
                <CInputGroup className="shadow-sm">
                  <CInputGroupText><CIcon icon={cilUser} /></CInputGroupText>
                  <CFormInput
                    name="nombreUsuario"
                    value={formData.nombreUsuario}
                    onChange={handleInputChange}
                    placeholder="usuario123"
                  />
                </CInputGroup>
              </CCol>

              <CCol md={6}>
                <CFormLabel className="fw-semibold">Correo Electrónico</CFormLabel>
                <CInputGroup className="shadow-sm">
                  <CInputGroupText><CIcon icon={cilEnvelopeClosed} /></CInputGroupText>
                  <CFormInput
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="correo@ejemplo.com"
                  />
                </CInputGroup>
              </CCol>

              <CCol md={6}>
                <CFormLabel className="fw-semibold">Contraseña</CFormLabel>
                <CInputGroup className="shadow-sm">
                  <CInputGroupText><CIcon icon={cilLockLocked} /></CInputGroupText>
                  <CFormInput
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="•••••••"
                  />
                </CInputGroup>
              </CCol>

              <CCol md={6}>
                <CFormLabel className="fw-semibold">Teléfono</CFormLabel>
                <CInputGroup className="shadow-sm">
                  <CInputGroupText><CIcon icon={cilPhone} /></CInputGroupText>
                  <CFormInput
                    name="telefonoContacto"
                    value={formData.telefonoContacto}
                    onChange={handleInputChange}
                    placeholder="4771234567"
                  />
                </CInputGroup>
              </CCol>

              <CCol xs={12}>
                <CButton
                  type="submit"
                  className="w-100"
                  style={{
                    background: 'linear-gradient(135deg, #FF6600 0%, #FF8533 100%)',
                    border: 'none',
                    padding: '14px',
                    fontWeight: '700',
                    color: 'white',
                    borderRadius: '12px'
                  }}
                >
                  <CIcon icon={cilUserPlus} className="me-2" />
                  Registrar Usuario
                </CButton>
              </CCol>

            </CRow>
          </CForm>
        </CCardBody>
      </CCard>



      {/* ------------------ TABLA DE USUARIOS ------------------ */}
      <CCard className="shadow-lg fade-in" style={{ borderRadius: '20px', border: 'none' }}>
        <CCardHeader
          style={{
            background: 'white',
            borderBottom: '3px solid #FF6600',
            borderTopLeftRadius: '20px',
            borderTopRightRadius: '20px',
            padding: '20px 30px'
          }}
        >
          <h5 className="mb-0 fw-bold" style={{ color: '#1A1C20' }}>📋 Lista de Usuarios</h5>
        </CCardHeader>

        <CCardBody style={{ padding: '30px', background: 'white' }}>
          <CTable hover responsive>
            <CTableHead style={{ backgroundColor: '#F3F4F6' }}>
              <CTableRow>
                <CTableHeaderCell className="fw-bold">Nombre</CTableHeaderCell>
                <CTableHeaderCell className="fw-bold">Correo</CTableHeaderCell>
                <CTableHeaderCell className="fw-bold">Teléfono</CTableHeaderCell>
                <CTableHeaderCell className="fw-bold">Rol Actual</CTableHeaderCell>
                <CTableHeaderCell className="fw-bold">Fecha</CTableHeaderCell>
                <CTableHeaderCell className="fw-bold text-center">Cambiar Rol</CTableHeaderCell>
              </CTableRow>
            </CTableHead>

            <CTableBody>
              {usuarios.map((u) => {
                const usuarioObj = u.usuario || {}
                const usuarioId = usuarioObj.id
                const rolActual = usuarioObj.rol

                return (
                  <CTableRow key={u.id}>
                    <CTableDataCell>{usuarioObj.nombreUsuario || u.nombre}</CTableDataCell>
                    <CTableDataCell>{usuarioObj.correo || '-'}</CTableDataCell>
                    <CTableDataCell>{u.telefono || usuarioObj.telefono || '-'}</CTableDataCell>
                    <CTableDataCell>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: '6px',
                          fontSize: '13px',
                          fontWeight: '600',
                          background: rolActual === 0 ? '#DBEAFE' : 
                                     rolActual === 1 ? '#FEF3C7' :
                                     rolActual === 2 ? '#D1FAE5' : '#FEE2E2',
                          color: rolActual === 0 ? '#1E40AF' :
                                 rolActual === 1 ? '#92400E' :
                                 rolActual === 2 ? '#065F46' : '#991B1B'
                        }}
                      >
                        {rolToText(rolActual)}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell>
                      {usuarioObj.fechaCreacion
                        ? new Date(usuarioObj.fechaCreacion).toLocaleDateString()
                        : '-'}
                    </CTableDataCell>
                    <CTableDataCell>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                        <CFormSelect
                          size="sm"
                          disabled={cambiandoRol === usuarioId}
                          style={{
                            maxWidth: '160px',
                            borderRadius: '6px',
                            border: '2px solid #E5E7EB'
                          }}
                          onChange={(e) => {
                            if (e.target.value && e.target.value !== rolToText(rolActual)) {
                              cambiarRol(usuarioId, e.target.value)
                              e.target.value = '' // Reset select
                            }
                          }}
                        >
                          <option value="">Seleccionar...</option>
                          {rolActual !== 0 && <option value="Administrador">Administrador</option>}
                          {rolActual !== 1 && <option value="Repartidor">Repartidor</option>}
                          {rolActual !== 2 && <option value="Empleado">Empleado</option>}
                          {rolActual !== 3 && <option value="Cliente">Cliente</option>}
                        </CFormSelect>
                        
                        {cambiandoRol === usuarioId && (
                          <CSpinner size="sm" style={{ color: '#FF6600' }} />
                        )}
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                )
              })}
            </CTableBody>

          </CTable>

          {usuarios.length === 0 && (
            <div className="text-center text-muted py-4">
              <p>No hay usuarios registrados</p>
            </div>
          )}
        </CCardBody>
      </CCard>

    </div>
  )
}

export default Usuarios