"use client"
import { useEffect, useState } from "react"
import "./styles.css"
interface TasklistUsuario{
  hostId: number;
}
export function Tasklist({hostId}:TasklistUsuario) {
  interface Rating {
    comportamiento: number
    cuidadoVehiculo: number
    puntualidad: number
  }

  interface Renter {
    idReserva: number
    usuarioNombre: string
    usuarioId: number
    autoNombre: string
    fechaFin: string
    estado: string
    rated?: boolean
  }

  interface Calificacion {
    idCalificacion: number
    comportamiento: number
    cuidadoVehiculo: number
    puntualidad: number
    comentario?: string
    reservaId: number
    calificadorNombre: string
    calificadoNombre: string
    fechaCreacion: string
  }
  const [renters, setRenters] = useState<Renter[]>([])
  const [selected, setSelected] = useState<Renter | null>(null)
  const [rating, setRating] = useState<Rating>({
    comportamiento: 0,
    cuidadoVehiculo: 0,
    puntualidad: 0,
  })
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch rentals data from API
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true)
      try {
        // Fetch rentals
        const rentalsResponse = await fetch(`http://localhost:4000/api/rentas/completadas/${hostId}`)
        const rentalsData = await rentalsResponse.json()
        // Fetch ratings
        const ratingsResponse = await fetch(`http://localhost:4000/api/rentas/calificaciones/${hostId}`)
        const ratingsData = await ratingsResponse.json()
        // Process data
        if (Array.isArray(rentalsData)) {
          // Mark rentals that have been rated
          const processedRenters = rentalsData.map((renter) => {
            const hasRating =
              Array.isArray(ratingsData) && ratingsData.some((cal) => cal.reservaId === renter.idReserva)
            return { ...renter, rated: hasRating }
          })

          setRenters(processedRenters)
          setCalificaciones(Array.isArray(ratingsData) ? ratingsData : [])

          console.log("Rentas procesadas:", processedRenters)
          console.log("Calificaciones:", ratingsData)
        } else {
          console.error("La respuesta de rentas no es un array:", rentalsData)
          setRenters([])
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setRenters([])
        setCalificaciones([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, []) // Solo se ejecuta una vez al montar el componente

  function estaDentroDePeriodoCalificacion(fechaFin: string): boolean {
    const fechaFinRenta = new Date(fechaFin)
    const fechaActual = new Date()

    // Resetear las horas, minutos y segundos para comparar solo fechas
    fechaFinRenta.setHours(0, 0, 0, 0)
    fechaActual.setHours(0, 0, 0, 0)

    // Calcular la diferencia en días
    const diferenciaTiempo = fechaActual.getTime() - fechaFinRenta.getTime()
    const diferenciaDias = Math.floor(diferenciaTiempo / (1000 * 3600 * 24))

    // Permitir calificar si no han pasado más de 2 días
    return diferenciaDias <= 2
  }

  function handleSeleccionar(renter: Renter) {
    // Si ya está calificado, siempre permitir ver la calificación
    // Si no está calificado, solo permitir seleccionar si está dentro del período
    if (renter.rated || estaDentroDePeriodoCalificacion(renter.fechaFin)) {
      const calificacion = calificaciones.find((c) => c.reservaId === renter.idReserva)
      if (calificacion) {
        setRating({
          comportamiento: calificacion.comportamiento,
          cuidadoVehiculo: calificacion.cuidadoVehiculo,
          puntualidad: calificacion.puntualidad,
        })
      } else {
        setRating({
          comportamiento: 0,
          cuidadoVehiculo: 0,
          puntualidad: 0,
        })
      }

      setSelected(renter)
    } else {
      alert("No es posible calificar esta renta porque han pasado más de 2 días desde su finalización.")
    }
  }

  async function handleGuardar() {
    if (!selected) return
    // Verificar si está dentro del período de calificación antes de guardar
    if (!estaDentroDePeriodoCalificacion(selected.fechaFin)) {
      alert("No es posible guardar la calificación porque han pasado más de 2 días desde la finalización de la renta.")
      return
    }
    try {
      // Prepare the data to send to the backend
      const ratingData = {
        id_reserva: selected.idReserva,
        comportamiento: rating.comportamiento,
        cuidadovehiculo: rating.cuidadoVehiculo,
        puntualidad: rating.puntualidad,
        id_calificador: hostId,
        id_calificado: selected.usuarioId,
      }
      // Check if this is an update or a new rating
      const existingRating = calificaciones.find((c) => c.reservaId === selected.idReserva)
      const url = existingRating
        ? `http://localhost:4000/api/rentas/calificaciones/${hostId}}/${existingRating.idCalificacion}`
        : `http://localhost:4000/api/rentas/calificaciones/${hostId}`
      const method = existingRating ? "PUT" : "POST"
      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ratingData),
      })
      if (!response.ok) {
        throw new Error("Error al guardar la calificación")
      }
      const savedRating = await response.json()
      // Update local state
      if (existingRating) {
        setCalificaciones((prev) =>
          prev.map((c) => (c.idCalificacion === existingRating.idCalificacion ? savedRating : c)),
        )
      } else {
        setCalificaciones((prev) => [...prev, savedRating])
      }
      // Update the renter to show as rated
      setRenters((prev) =>
        prev.map((renter) => (renter.idReserva === selected.idReserva ? { ...renter, rated: true } : renter)),
      )
      alert(`Calificación guardada para ${selected.usuarioNombre}`)
      setSelected(null)
      setRating({
        comportamiento: 0,
        cuidadoVehiculo: 0,
        puntualidad: 0,
      })
    } catch (error) {
      console.error("Error al guardar la calificación:", error)
      alert("Error al guardar la calificación")
    }
  }

  async function handleBorrar(renter: Renter) {
    // Verificar si está dentro del período de calificación antes de borrar
    if (!estaDentroDePeriodoCalificacion(renter.fechaFin)) {
      alert("No es posible eliminar la calificación porque han pasado más de 2 días desde la finalización de la renta.")
      return
    }
    if (!window.confirm(`¿Estás seguro de que deseas eliminar la calificación para ${renter.usuarioNombre}?`)) {
      return
    }
    try {
      const calificacion = calificaciones.find((c) => c.reservaId === renter.idReserva)
      if (!calificacion) {
        throw new Error("No se encontró la calificación")
      }
      const response = await fetch(`http://localhost:4000/api/rentas/calificaciones/${hostId}/${calificacion.idCalificacion}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error("Error al eliminar la calificación")
      }
      // Update local state
      setCalificaciones((prev) => prev.filter((c) => c.idCalificacion !== calificacion.idCalificacion))
      setRenters((prev) => prev.map((item) => (item.idReserva === renter.idReserva ? { ...item, rated: false } : item)))

      if (selected && selected.idReserva === renter.idReserva) {
        setSelected(null)
      }
      alert(`Calificación eliminada para ${renter.usuarioNombre}`)
    } catch (error) {
      console.error("Error al eliminar la calificación:", error)
      alert("Error al eliminar la calificación")
    }
  }

  function calcularPromedio() {
    if (!rating.comportamiento && !rating.cuidadoVehiculo && !rating.puntualidad) return 0

    const suma = rating.comportamiento + rating.cuidadoVehiculo + rating.puntualidad
    const categoriasPuntuadas = [rating.comportamiento, rating.cuidadoVehiculo, rating.puntualidad].filter(
      (val) => val > 0,
    ).length

    return categoriasPuntuadas > 0 ? Math.round((suma / categoriasPuntuadas) * 10) / 10 : 0
  }

  function renderPromedioStars() {
    const promedio = calcularPromedio()
    const stars = []

    for (let i = 1; i <= 5; i++) {
      // Para mostrar medias estrellas
      const starFill = i <= promedio ? 100 : i - 0.5 <= promedio && i > promedio ? 50 : 0
      stars.push(
        <span
          key={i}
          style={{
            fontSize: "28px",
            color: starFill > 0 ? "#facc15" : "#e5e7eb",
            marginRight: "4px",
          }}
        >
          {starFill === 50 ? "★" : "★"}
        </span>,
      )
    }

    return (
      <div className="promedio-stars">
        {stars}
        <span className="promedio-valor">{promedio.toFixed(1)}</span>
      </div>
    )
  }

  function renderStars(category: keyof Rating) {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={() => {
            if (selected && !selected.rated && estaDentroDePeriodoCalificacion(selected.fechaFin)) {
              setRating((prev) => ({ ...prev, [category]: i }))
            }
          }}
          style={{
            cursor:
              selected && !selected.rated && estaDentroDePeriodoCalificacion(selected.fechaFin) ? "pointer" : "default",
            fontSize: "24px",
            color: i <= rating[category] ? "#facc15" : "#e5e7eb",
            marginRight: "4px",
          }}
        >
          ★
        </span>,
      )
    }
    return stars
  }

  return (
    <div className="container">
      <div className="panel">
        <h2>Historial de rentas</h2>
        {isLoading ? (
          <p>Cargando datos...</p>
        ) : (
          <ul className="renter-list">
            {Array.isArray(renters) && renters.length > 0 ? (
              renters.map((renter) => (
                <li key={renter.idReserva} className="renter">
                  <span className="renter-name">{renter.usuarioNombre}</span>
                  <span className="renter-car">{renter.autoNombre}</span>
                  <span className="renter-date">{new Date(renter.fechaFin).toLocaleDateString()}</span>
                  <div className="renter-actions">
                    {renter.rated ? (
                      <button onClick={() => handleSeleccionar(renter)} className="button-rated">
                        Ver calificación
                      </button>
                    ) : estaDentroDePeriodoCalificacion(renter.fechaFin) ? (
                      <button onClick={() => handleSeleccionar(renter)} className="button-rate">
                        Calificar
                      </button>
                    ) : (
                      <button
                        className="button-disabled"
                        title="Han pasado más de 2 días desde la finalización de la renta"
                      >
                        Fuera de plazo
                      </button>
                    )}
                    {renter.rated && estaDentroDePeriodoCalificacion(renter.fechaFin) && (
                      <button onClick={() => handleBorrar(renter)} className="delete-button">
                        ❌
                      </button>
                    )}
                  </div>
                </li>
              ))
            ) : (
              <li className="renter">No hay rentas completadas disponibles</li>
            )}
          </ul>
        )}
      </div>

      <div className="details">
        {selected ? (
          <>
            <h3>Información del arrendatario:</h3>
            <p>
              <strong>Nombre:</strong> {selected.usuarioNombre} <br />
              <strong>Auto:</strong> {selected.autoNombre} <br />
              <strong>Fecha de entrega:</strong> {new Date(selected.fechaFin).toLocaleDateString()}
            </p>
            <div className="calificacion-final">
              <label>Calificación Final</label>
              {renderPromedioStars()}
            </div>
            <h4>{selected.rated ? "Calificación" : "Calificar arrendatario"}</h4>
           

            <div className="calificacion-form">
              <div className="rating-row">
                <label>Comportamiento</label>
                <div className="estrellas">{renderStars("comportamiento")}</div>
              </div>

              <div className="rating-row">
                <label>Cuidado del vehículo</label>
                <div className="estrellas">{renderStars("cuidadoVehiculo")}</div>
              </div>

              <div className="rating-row">
                <label>Puntualidad</label>
                <div className="estrellas">{renderStars("puntualidad")}</div>
              </div>

              <div className="botones">
                <button onClick={() => setSelected(null)}>Cancelar</button>
                {!selected.rated && estaDentroDePeriodoCalificacion(selected.fechaFin) && (
                  <button
                    onClick={handleGuardar}
                    disabled={!rating.comportamiento || !rating.cuidadoVehiculo || !rating.puntualidad}
                  >
                    Guardar
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <p>Seleccione una renta para calificar al arrendatario</p>
        )}
      </div>
    </div>
  )
}
