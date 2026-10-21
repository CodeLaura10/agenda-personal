import { useState } from 'react'
import CamposFrecuencia from './CamposFrecuencia'
import SelectorDias from './SelectorDias'
import SelectorTipoHorario from './SelectorTipoHorario'
import { opcionesRecordatorio } from '../data/opciones'
import { useCerrarModal } from '../hooks/useCerrarModal'
import { nuevoIdItem, validarHoras } from '../utils/actividades'
import './FormularioActividad.css'
import './EditorRutina.css'

function itemVacio(fechaInicio) {
  return {
    id: nuevoIdItem(),
    titulo: '',
    descripcion: '',
    dias: [],
    frecuencia: 'semanal',
    semanaDelMes: '1',
    fecha: fechaInicio,
    sinHora: false,
    horaInicio: '',
    horaFin: '',
    recordatorio: '',
  }
}

function EditorRutina({
  categoria,
  itemsIniciales,
  fechaInicio,
  rutinaExiste,
  onGuardar,
  onEliminarRutina,
  onCancelar,
}) {
  const [items, setItems] = useState(() =>
    itemsIniciales.length > 0
      ? itemsIniciales.map((item) => ({ ...item, sinHora: !item.horaInicio }))
      : [itemVacio(fechaInicio)],
  )
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)
  const [error, setError] = useState('')

  const manejarClicEnFondo = useCerrarModal(onCancelar)

  function cambiarItem(id, campo, valor) {
    setItems(items.map((item) => (item.id === id ? { ...item, [campo]: valor } : item)))
  }

  function agregarItem() {
    setItems([...items, itemVacio(fechaInicio)])
  }

  function quitarItem(id) {
    setItems(items.filter((item) => item.id !== id))
  }

  function manejarEnvio(evento) {
    evento.preventDefault()

    for (const [indice, item] of items.entries()) {
      const nombre = item.titulo.trim() || `Actividad ${indice + 1}`
      if (item.dias.length === 0) {
        setError(`"${nombre}": elige al menos un día de la semana.`)
        return
      }
      if (item.frecuencia === 'quincenal' && !item.fecha) {
        setError(`"${nombre}": elige desde qué fecha se repite cada 15 días.`)
        return
      }
      if (!item.sinHora && !item.horaInicio) {
        setError(`"${nombre}": pon la hora de inicio o elige "Tarea del día".`)
        return
      }
      const errorHoras = item.sinHora ? '' : validarHoras(item.horaInicio, item.horaFin)
      if (errorHoras) {
        setError(`"${nombre}": ${errorHoras}`)
        return
      }
    }

    onGuardar(
      items.map((item) =>
        item.sinHora ? { ...item, horaInicio: '', horaFin: '', recordatorio: '' } : item,
      ),
    )
  }

  return (
    <div className="modal-fondo" onClick={manejarClicEnFondo}>
      <div
        className="modal modal-ancho"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-rutina"
        style={{ '--color-categoria': categoria.color }}
      >
        <h2 id="titulo-rutina">
          Rutina semanal · {categoria.icono} {categoria.nombre}
        </h2>
        <p className="nota">
          Agrega cada actividad, elige sus días, cada cuánto se repite y su horario. Al guardar, el
          calendario se organiza solo.
          {!rutinaExiste && itemsIniciales.length > 0 && ' Te dejamos algunas sugerencias: cámbialas o quítalas.'}
        </p>

        <form className="formulario" onSubmit={manejarEnvio}>
          <ul className="lista-items-rutina">
            {items.map((item, indice) => (
              <li key={item.id} className="item-rutina">
                <div className="item-rutina-cabecera">
                  <label>
                    Actividad {indice + 1}
                    <input
                      type="text"
                      value={item.titulo}
                      onChange={(e) => cambiarItem(item.id, 'titulo', e.target.value)}
                      placeholder="Ej.: Lavar baños"
                      required
                    />
                  </label>
                  <button
                    type="button"
                    className="boton-quitar"
                    onClick={() => quitarItem(item.id)}
                    aria-label={`Quitar ${item.titulo || `actividad ${indice + 1}`}`}
                  >
                    Quitar
                  </button>
                </div>

                <SelectorDias dias={item.dias} onCambiar={(dias) => cambiarItem(item.id, 'dias', dias)} />

                <CamposFrecuencia
                  frecuencia={item.frecuencia}
                  semanaDelMes={item.semanaDelMes}
                  onCambiarFrecuencia={(valor) => cambiarItem(item.id, 'frecuencia', valor)}
                  onCambiarSemanaDelMes={(valor) => cambiarItem(item.id, 'semanaDelMes', valor)}
                />

                {item.frecuencia === 'quincenal' && (
                  <label>
                    A partir de
                    <input
                      type="date"
                      value={item.fecha}
                      onChange={(e) => cambiarItem(item.id, 'fecha', e.target.value)}
                    />
                    <span className="nota">
                      Se hace la semana de esta fecha y luego cada dos semanas.
                    </span>
                  </label>
                )}

                <SelectorTipoHorario
                  sinHora={item.sinHora}
                  onCambiar={(sinHora) => cambiarItem(item.id, 'sinHora', sinHora)}
                />

                {item.sinHora ? (
                  <p className="nota">Aparecerá como tarea de esos días, sin hora.</p>
                ) : (
                  <>
                    <div className="fila-horas">
                      <label>
                        Hora de inicio
                        <input
                          type="time"
                          value={item.horaInicio}
                          onChange={(e) => cambiarItem(item.id, 'horaInicio', e.target.value)}
                        />
                      </label>
                      <label>
                        Hora de fin (opcional)
                        <input
                          type="time"
                          value={item.horaFin}
                          onChange={(e) => cambiarItem(item.id, 'horaFin', e.target.value)}
                        />
                      </label>
                    </div>

                    <label>
                      Recordatorio
                      <select
                        value={item.recordatorio}
                        onChange={(e) => cambiarItem(item.id, 'recordatorio', e.target.value)}
                      >
                        {opcionesRecordatorio.map((opcion) => (
                          <option key={opcion.valor} value={opcion.valor}>
                            {opcion.texto}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                )}

                <label>
                  Descripción (opcional)
                  <textarea
                    value={item.descripcion}
                    onChange={(e) => cambiarItem(item.id, 'descripcion', e.target.value)}
                    rows={2}
                    maxLength={500}
                  />
                </label>
              </li>
            ))}
          </ul>

          <button type="button" className="boton-agregar-item" onClick={agregarItem}>
            + Agregar actividad a la rutina
          </button>

          {error && <p className="error">{error}</p>}

          {confirmandoEliminar ? (
            <div className="confirmar-eliminar">
              <p>¿Eliminar toda la rutina de {categoria.nombre}? Se quitará del calendario.</p>
              <div className="acciones">
                <button type="button" className="boton-secundario" onClick={() => setConfirmandoEliminar(false)}>
                  No eliminar
                </button>
                <button type="button" className="boton-peligro" onClick={onEliminarRutina}>
                  Sí, eliminar
                </button>
              </div>
            </div>
          ) : (
            <div className="acciones">
              {rutinaExiste && (
                <button type="button" className="boton-eliminar" onClick={() => setConfirmandoEliminar(true)}>
                  Eliminar rutina
                </button>
              )}
              <button type="button" className="boton-secundario" onClick={onCancelar}>
                Cancelar
              </button>
              <button type="submit" className="boton-primario">
                Guardar rutina
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default EditorRutina
