// ...existing code...
import React, { useState, useEffect } from "react"
import {
  CCard,
  CCardHeader,
  CCardBody,
  CForm,
  CRow,
  CCol,
  CFormLabel,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CButton,
  CFormCheck,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CSpinner,
  CBadge
} from "@coreui/react"
import callApi from "../utils/apiProxy"
 
const RegistrarProductos = () => {
  const initialFormState = {
    nombre: "",
    descripcion: "",
    tipo: "",
    precio: "",
    almacenable: false,
    imagenUrl: ""
  }
 
  const [formData, setFormData] = useState(initialFormState)
  const [loading, setLoading] = useState(false)
  const [productos, setProductos] = useState([])
  const [loadingProductos, setLoadingProductos] = useState(true)
  const [deleting, setDeleting] = useState(null)

  const token = localStorage.getItem("token")
 
  // Cargar productos
  const fetchProductos = async () => {
    try {
      setLoadingProductos(true)
      const res = await callApi('/api/Productos', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) return

      const data = await res.json()
      setProductos(data)
    } catch (err) {
      console.error("Error al cargar productos:", err)
    } finally {
      setLoadingProductos(false)
    }
  }

  useEffect(() => {
    fetchProductos()
  }, [])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    })
  }
 
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
 
    try {
      const dataToSend = {
        Nombre: formData.nombre,
        Descripcion: formData.descripcion,
        Tipo: formData.tipo,
        Precio: parseFloat(formData.precio),
        Almacenable: formData.almacenable,
        ImagenUrl: formData.imagenUrl && formData.imagenUrl.trim() !== "" 
          ? formData.imagenUrl 
          : null
      }

      console.log('Datos a enviar:', dataToSend)
 
      const res = await callApi('/api/Productos', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(dataToSend)
      })
 
      if (!res.ok) {
        const errorText = await res.text()
        console.error('Error completo del servidor:', errorText)
        
        let errorMessage = "Error al registrar producto"
        try {
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.message || errorData.title || errorMessage
          
          if (errorData.errors) {
            const validationErrors = Object.values(errorData.errors).flat().join(', ')
            errorMessage = validationErrors
          }
        } catch {
          errorMessage = errorText
        }
        
        throw new Error(errorMessage)
      }
 
      alert("✅ Producto registrado correctamente")
      setFormData(initialFormState)
      fetchProductos() // Recargar lista
 
    } catch (err) {
      console.error('Error completo:', err)
      alert(`❌ Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Eliminar producto
  const eliminarProducto = async (id, nombre) => {
    const confirmar = window.confirm(
      `¿Estás seguro de eliminar el producto "${nombre}"?`
    )

    if (!confirmar) return

    try {
      setDeleting(id)
      const res = await callApi(`/api/Productos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!res.ok) {
        throw new Error("Error al eliminar producto")
      }

      alert("✅ Producto eliminado correctamente")
      fetchProductos()
    } catch (err) {
      console.error("Error:", err)
      alert("❌ Error al eliminar producto")
    } finally {
      setDeleting(null)
    }
  }
 
  const inputStyle = {
    padding: "12px",
    borderRadius: "10px",
    border: "2px solid #E5E7EB",
    transition: "0.25s",
  }
 
  const inputFocus = (e) => (e.target.style.borderColor = "#FF6600")
  const inputBlur = (e) => (e.target.style.borderColor = "#E5E7EB")
 
  return (
    <div
      className="page-container"
      style={{
        background: "#F3F4F6",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        margin: 0
      }}
    >
      {/* FORMULARIO DE REGISTRO */}
      <CCard
        className="shadow-lg fade-in"
        style={{
          borderRadius: "20px",
          overflow: "hidden",
          border: "none",
          marginBottom: "30px"
        }}
      >
        <CCardHeader
          style={{
            background: "white",
            borderBottom: "3px solid #FF6600",
            padding: "20px 30px"
          }}
        >
          <h3 className="mb-0" style={{ fontWeight: "700", color: "#1A1C20" }}>
            ➕ Registrar Nuevo Producto
          </h3>
          <p className="mb-0 mt-2" style={{ color: "#6B7280", fontSize: "14px" }}>
            Agrega pizzas, bebidas y más productos al menú
          </p>
        </CCardHeader>
 
        <CCardBody style={{ backgroundColor: "#ffffff", padding: "35px" }}>
          <CForm onSubmit={handleSubmit}>
            <CRow className="g-4">
 
              <CCol md={6}>
                <CFormLabel style={{ fontWeight: "600", color: "#374151" }}>
                  Nombre del Producto *
                </CFormLabel>
                <CFormInput
                  name="nombre"
                  placeholder="Ej: Pizza Pepperoni Grande"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
 
              <CCol md={6}>
                <CFormLabel style={{ fontWeight: "600", color: "#374151" }}>
                  Tipo de Producto *
                </CFormLabel>
                <CFormSelect
                  name="tipo"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  value={formData.tipo}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Seleccione tipo...</option>
                  <option value="Pizza">Pizza</option>
                  <option value="Bebida">Bebida</option>
                  <option value="Postre">Postre</option>
                  <option value="Entrada">Entrada</option>
                  <option value="Complemento">Complemento</option>
                  <option value="Otro">Otro</option>
                </CFormSelect>
              </CCol>
 
              <CCol xs={12}>
                <CFormLabel style={{ fontWeight: "600", color: "#374151" }}>
                  Descripción *
                </CFormLabel>
                <CFormTextarea
                  rows={3}
                  name="descripcion"
                  placeholder="Ej: Pizza de 40cm con pepperoni premium y queso mozzarella"
                  style={{ ...inputStyle, resize: "none" }}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
 
              <CCol md={6}>
                <CFormLabel style={{ fontWeight: "600", color: "#374151" }}>
                  Precio (MXN) *
                </CFormLabel>
                <CFormInput
                  type="number"
                  step="0.01"
                  min="0"
                  name="precio"
                  placeholder="180.00"
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  value={formData.precio}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
 
              <CCol md={6}>
                <CFormLabel style={{ fontWeight: "600", color: "#374151" }}>
                  URL de Imagen (Opcional - máx 255 caracteres)
                </CFormLabel>
                <CFormInput
                  name="imagenUrl"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  maxLength={255}
                  style={inputStyle}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  value={formData.imagenUrl}
                  onChange={handleInputChange}
                />
                <small style={{ color: "#6B7280", display: "block", marginTop: "8px" }}>
                  Caracteres: {formData.imagenUrl.length}/255
                </small>
                {formData.imagenUrl.length > 255 && (
                  <small style={{ color: "#DC2626", display: "block", marginTop: "4px", fontWeight: "600" }}>
                    ⚠️ La URL es demasiado larga. Máximo 255 caracteres.
                  </small>
                )}
              </CCol>
 
              <CCol xs={12}>
                <div
                  style={{
                    padding: "20px",
                    background: "#F9FAFB",
                    borderRadius: "12px",
                    border: "2px solid #E5E7EB"
                  }}
                >
                  <CFormCheck
                    id="almacenable"
                    name="almacenable"
                    checked={formData.almacenable}
                    onChange={handleInputChange}
                    label={
                      <span style={{ fontWeight: "600", color: "#374151" }}>
                        ¿Es un producto almacenable?
                      </span>
                    }
                  />
                  <small style={{ color: "#6B7280", display: "block", marginTop: "8px" }}>
                    Marca esta opción si el producto requiere control de inventario (ej: bebidas embotelladas).
                  </small>
                </div>
              </CCol>
 
              <CCol xs={12}>
                <hr style={{ margin: "20px 0", border: "1px solid #E5E7EB" }} />
              </CCol>
 
              <CCol xs={12} className="d-flex justify-content-end gap-3">
                <CButton
                  type="button"
                  onClick={() => setFormData(initialFormState)}
                  disabled={loading}
                  style={{
                    padding: "14px 28px",
                    fontWeight: "600",
                    background: "white",
                    border: "2px solid #E5E7EB",
                    color: "#6B7280",
                    borderRadius: "12px",
                    transition: "0.2s"
                  }}
                >
                  Limpiar
                </CButton>
 
                <CButton
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: "14px 28px",
                    fontWeight: "700",
                    background: loading
                      ? "#9CA3AF"
                      : "linear-gradient(135deg, #FF6600 0%, #FF8533 100%)",
                    border: "none",
                    borderRadius: "12px",
                    color: "white",
                    boxShadow: "0 4px 6px -1px rgba(255, 102, 0, 0.3)",
                    transition: "0.2s"
                  }}
                >
                  {loading ? "Registrando..." : "➕ Registrar Producto"}
                </CButton>
              </CCol>
 
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>

      {/* VISTA PREVIA */}
      {formData.nombre && (
        <CCard
          className="mt-4 shadow-lg"
          style={{
            borderRadius: "20px",
            overflow: "hidden",
            border: "none",
            marginBottom: "30px"
          }}
        >
          <CCardHeader
            style={{
              background: "white",
              borderBottom: "3px solid #10B981",
              padding: "20px 30px"
            }}
          >
            <h4 className="mb-0" style={{ fontWeight: "700", color: "#1A1C20" }}>
              👁️ Vista Previa
            </h4>
          </CCardHeader>
          <CCardBody style={{ backgroundColor: "#ffffff", padding: "35px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "20px",
                alignItems: "start"
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "200px",
                  background: formData.imagenUrl
                    ? `url(${formData.imagenUrl}) center/cover`
                    : "linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#9CA3AF",
                  fontSize: "48px",
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}
              >
                {!formData.imagenUrl && "🍕"}
              </div>
 
              <div>
                <h3 style={{ fontWeight: "700", color: "#1A1C20", marginBottom: "8px" }}>
                  {formData.nombre || "Nombre del producto"}
                </h3>
                <p style={{ color: "#6B7280", marginBottom: "12px" }}>
                  {formData.descripcion || "Descripción del producto"}
                </p>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  {formData.tipo && (
                    <span
                      style={{
                        padding: "6px 12px",
                        background: "#FEF3C7",
                        color: "#92400E",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    >
                      {formData.tipo}
                    </span>
                  )}
                  {formData.precio && (
                    <span
                      style={{
                        padding: "6px 12px",
                        background: "#D1FAE5",
                        color: "#065F46",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "600"
                      }}
                    >
                      ${parseFloat(formData.precio).toFixed(2)} MXN
                    </span>
                  )}
                  <span
                    style={{
                      padding: "6px 12px",
                      background: formData.almacenable ? "#DBEAFE" : "#FEE2E2",
                      color: formData.almacenable ? "#1E40AF" : "#991B1B",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600"
                    }}
                  >
                    {formData.almacenable ? "Almacenable" : "No almacenable"}
                  </span>
                </div>
              </div>
            </div>
          </CCardBody>
        </CCard>
      )}

      {/* TABLA DE PRODUCTOS REGISTRADOS */}
      <CCard
        className="shadow-lg fade-in"
        style={{
          borderRadius: "20px",
          overflow: "hidden",
          border: "none"
        }}
      >
        <CCardHeader
          style={{
            background: "white",
            borderBottom: "3px solid #EF4444",
            padding: "20px 30px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 className="mb-0" style={{ fontWeight: "700", color: "#1A1C20" }}>
                📋 Productos Registrados
              </h3>
              <p className="mb-0 mt-2" style={{ color: "#6B7280", fontSize: "14px" }}>
                Gestiona y elimina productos del menú
              </p>
            </div>
            <CButton
              onClick={fetchProductos}
              disabled={loadingProductos}
              style={{
                padding: "10px 20px",
                fontWeight: "600",
                background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
                border: "none",
                borderRadius: "10px",
                color: "white"
              }}
            >
              🔄 Actualizar
            </CButton>
          </div>
        </CCardHeader>

        <CCardBody style={{ backgroundColor: "#ffffff", padding: "35px" }}>
          {loadingProductos ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <CSpinner color="primary" />
              <p style={{ marginTop: "20px", color: "#6B7280" }}>
                Cargando productos...
              </p>
            </div>
          ) : productos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>📦</div>
              <h4 style={{ color: "#6B7280" }}>No hay productos registrados</h4>
            </div>
          ) : (
            <>
              <div style={{ overflowX: "auto" }}>
                <CTable hover responsive>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell style={{ background: "#F9FAFB", fontWeight: "700", color: "#374151", padding: "16px" }}>
                        ID
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ background: "#F9FAFB", fontWeight: "700", color: "#374151", padding: "16px" }}>
                        Imagen
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ background: "#F9FAFB", fontWeight: "700", color: "#374151", padding: "16px" }}>
                        Nombre
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ background: "#F9FAFB", fontWeight: "700", color: "#374151", padding: "16px" }}>
                        Tipo
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ background: "#F9FAFB", fontWeight: "700", color: "#374151", padding: "16px" }}>
                        Precio
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ background: "#F9FAFB", fontWeight: "700", color: "#374151", padding: "16px" }}>
                        Estado
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ background: "#F9FAFB", fontWeight: "700", color: "#374151", padding: "16px", textAlign: "center" }}>
                        Acciones
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {productos.map((producto) => (
                      <CTableRow key={producto.id}>
                        <CTableDataCell style={{ padding: "16px", fontWeight: "600", color: "#6B7280" }}>
                          #{producto.id}
                        </CTableDataCell>
                        <CTableDataCell style={{ padding: "16px" }}>
                          <div
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "10px",
                              background: producto.imagenUrl
                                ? `url(${producto.imagenUrl}) center/cover`
                                : "linear-gradient(135deg, #FFF5EB 0%, #FFE8D6 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "28px",
                              backgroundSize: "cover",
                              backgroundPosition: "center"
                            }}
                          >
                            {!producto.imagenUrl && "🍕"}
                          </div>
                        </CTableDataCell>
                        <CTableDataCell style={{ padding: "16px", fontWeight: "600", color: "#1F2937" }}>
                          {producto.nombre}
                        </CTableDataCell>
                        <CTableDataCell style={{ padding: "16px" }}>
                          <CBadge style={{ padding: "6px 12px", background: "#FEF3C7", color: "#92400E", fontWeight: "600", border: "none" }}>
                            {producto.tipo}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell style={{ padding: "16px", fontWeight: "700", color: "#FF6600", fontSize: "16px" }}>
                          ${producto.precio.toFixed(2)}
                        </CTableDataCell>
                        <CTableDataCell style={{ padding: "16px" }}>
                          <CBadge
                            style={{
                              padding: "6px 12px",
                              background: producto.activo ? "#D1FAE5" : "#FEE2E2",
                              color: producto.activo ? "#065F46" : "#991B1B",
                              fontWeight: "600",
                              border: "none"
                            }}
                          >
                            {producto.activo ? "✓ Activo" : "✗ Inactivo"}
                          </CBadge>
                        </CTableDataCell>
                        <CTableDataCell style={{ padding: "16px", textAlign: "center" }}>
                          <CButton
                            color="danger"
                            onClick={() => eliminarProducto(producto.id, producto.nombre)}
                            disabled={deleting === producto.id}
                            style={{
                              padding: "8px 20px",
                              fontWeight: "600",
                              borderRadius: "8px",
                              border: "none",
                              background: deleting === producto.id
                                ? "#9CA3AF"
                                : "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                              color: "white",
                              boxShadow: "0 2px 4px rgba(239, 68, 68, 0.3)",
                              transition: "all 0.2s ease"
                            }}
                          >
                            {deleting === producto.id ? (
                              <>
                                <CSpinner size="sm" /> Eliminando...
                              </>
                            ) : (
                              "🗑️ Eliminar"
                            )}
                          </CButton>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>

              {/* Resumen */}
              <div
                style={{
                  marginTop: "30px",
                  padding: "20px",
                  background: "#F9FAFB",
                  borderRadius: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div style={{ display: "flex", gap: "30px" }}>
                  <div>
                    <span style={{ color: "#6B7280", fontSize: "14px" }}>
                      Total de productos:
                    </span>
                    <span style={{ marginLeft: "8px", fontWeight: "700", fontSize: "18px", color: "#1F2937" }}>
                      {productos.length}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#6B7280", fontSize: "14px" }}>
                      Activos:
                    </span>
                    <span style={{ marginLeft: "8px", fontWeight: "700", fontSize: "18px", color: "#10B981" }}>
                      {productos.filter((p) => p.activo).length}
                    </span>
                  </div>
                  <div>
                    <span style={{ color: "#6B7280", fontSize: "14px" }}>
                      Inactivos:
                    </span>
                    <span style={{ marginLeft: "8px", fontWeight: "700", fontSize: "18px", color: "#EF4444" }}>
                      {productos.filter((p) => !p.activo).length}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CCardBody>
      </CCard>
    </div>
  )
}
 
export default RegistrarProductos
// ...existing code...