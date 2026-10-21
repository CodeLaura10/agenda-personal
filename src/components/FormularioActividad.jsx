import { useState } from 'react'
import CamposFrecuencia from './CamposFrecuencia'
import SelectorDias from './SelectorDias'
import SelectorTipoHorario from './SelectorTipoHorario'
import { opcionesRecordatorio } from '../data/opciones'
import { useCerrarModal } from '../hooks/useCerrarModal'
import { estaCompletada, validarHoras } from '../utils/actividades'
import { diaDeLaSemana, formatearFechaLarga } from '../utils/fechas'
import './FormularioActividad.css'

function FormularioActividad({
  actividad,
  fechaOcurrencia,
  horaInicial,
  categoriaInicial,
  categorias,
  onGuardar,
  onEliminar,
  onEliminarDia,
  onCancelar,
}) {
  const editando = actividad !== null
  const esRutina = editando && (actividad.repeticion ?? 'ninguna') !== 'ninguna'
  const inicial = actividad ?? {}

  const [titulo, setTitulo] = useState(inicial.titulo ?? '')
  const [descripcion, setDescripcion] = useState(inicial.descripcion ?? '')
  const [categoria, setCategoria] = useState(inicial.categoria ?? categoriaInicial)
  const [fecha, setFecha] = useState(inicial.fecha ?? fechaOcurrencia)
  const [sinHora, setSinHora] = useState(!(inicial.horaInicio ?? horaInicial))
  const [horaInicio, setHoraInicio] = useState(inicial.horaInicio ?? horaInicial)
  const [horaFin, setHoraFin] = useState(inicial.horaFin ?? '')
  const [repeticion, setRepeticion] = useState(inicial.repeticion ?? 'ninguna')
  const [dias, setDias] = useState(inicial.dias ?? [])
  const [frecuencia, setFrecuencia] = useState(inicial.frecuencia ?? 'semanal')
  const [semanaDelMes, setSemanaDelMes] = useState(inicial.semanaDelMes ?? '1')
  const [repetirHasta, setRepetirHasta] = useState(inicial.repetirHasta ?? '')
  const [recordatorio, setRecordatorio] = useState(inicial.recordatorio ?? '')
  const [completada, setCompletada] = useState(editando && estaCompletada(actividad, fechaOcurrencia))
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)
  const [error, setError] = useState('')

  const manejarClicEnFondo = useCerrarModal(onCancelar)

  function cambiarRepeticion(nuevaRepeticion) {
    setRepeticion(nuevaRepeticion)
    if (nuevaRepeticion === 'dias' && dias.length === 0) {
      setDias([diaDeLaSemana(fecha)])
    }
  }

  function manejarEnvio(evento) {
    evento.preventDefault()

    if (!sinHora && !horaInicio) {
      setError('Pon la hora de inicio o elige "Tarea del día".')
      return
    }
    const errorHoras = sinHora ? '' : validarHoras(horaInicio, horaFin)
    if (errorHoras) {
      setError(errorHoras)
      return
    }
    if (repeticion === 'dias' && dias.length === 0) {
      setError('Elige al menos un día para repetir.')
      return
    }
    if (repeticion !== 'ninguna' && repetirHasta && repetirHasta < fecha) {
      setError('La fecha "Repetir hasta" debe ser igual o posterior a la fecha de inicio.')
      return
    }

    const fechaMarcada = repeticion === 'ninguna' ? fecha : fechaOcurrencia
    const completadasAnteriores =
      repeticion === 'ninguna'
        ? []
        : (actividad?.completadas ?? []).filter((dia) => dia !== fechaOcurrencia)

    onGuardar({
      ...actividad,
      id: actividad?.id ?? Date.now().toString(),
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      categoria,
      fecha,
      horaInicio: sinHora ? '' : horaInicio,
      horaFin: sinHora ? '' : horaFin,
      repeticion,
      dias: repeticion === 'dias' ? dias : [],
      frecuencia: repeticion === 'dias' ? frecuencia : 'semanal',
      semanaDelMes,
      repetirHasta: repeticion === 'ninguna' ? '' : repetirHasta,
      recordatorio: sinHora ? '' : recordatorio,
      completadas: completada ? [...completadasAnteriores, fechaMarcada] : completadasAnteriores,
    })
  }

  return (
    <div className="modal-fondo" onClick={manejarClicEnFondo}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-formulario">
        <h2 id="titulo-formulario">{editando ? 'Editar actividad' : 'Nueva actividad'}</h2>
        {esRutina && (
          <p className="nota">
            Los cambios se aplican a todos los días en que se repite.
            {actividad.rutina && ' Es parte de la rutina semanal de su categoría: también la puedes editar desde ahí.'}
          </p>
        )}

        <form className="formulario" onSubmit={manejarEnvio}>
          <label>
            Título
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              autoFocus={!editando}
            />
          </label>

          <label>
            Descripción (opcional)
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="Ej.: llevar toalla y botella de agua"
            />
          </label>

          <label>
            Categoría
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icono} {cat.nombre}
                </option>
              ))}
            </select>
          </label>

          <label>
            {repeticion === 'ninguna' ? 'Fecha' : 'Empieza el'}
            <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
          </label>

          <SelectorTipoHorario sinHora={sinHora} onCambiar={setSinHora} />

          {sinHora ? (
            <p className="nota">Aparecerá como tarea de ese día, sin hora.</p>
          ) : (
            <>
              <div className="fila-horas">
                <label>
                  Hora de inicio
                  <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
                </label>
                <label>
                  Hora de fin (opcional)
                  <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
                </label>
              </div>

              <label>
                Recordatorio
                <select value={recordatorio} onChange={(e) => setRecordatorio(e.target.value)}>
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
            Repetición
            <select value={repeticion} onChange={(e) => cambiarRepeticion(e.target.value)}>
              <option value="ninguna">No se repite</option>
              <option value="diaria">Todos los días</option>
              <option value="dias">Días específicos de la semana</option>
            </select>
          </label>

          {repeticion === 'dias' && (
            <>
              <SelectorDias dias={dias} onCambiar={setDias} />
              <CamposFrecuencia
                frecuencia={frecuencia}
                semanaDelMes={semanaDelMes}
                onCambiarFrecuencia={setFrecuencia}
                onCambiarSemanaDelMes={setSemanaDelMes}
              />
              {frecuencia === 'quincenal' && (
                <p className="nota">
                  Se hace la semana de la fecha de inicio y luego cada dos semanas.
                </p>
              )}
            </>
          )}

          {repeticion !== 'ninguna' && (
            <label>
              Repetir hasta (opcional)
              <input
                type="date"
                value={repetirHasta}
                min={fecha}
                onChange={(e) => setRepetirHasta(e.target.value)}
              />
            </label>
          )}

          {editando && (
            <label className="casilla">
              <input
                type="checkbox"
                checked={completada}
                onChange={(e) => setCompletada(e.target.checked)}
              />
              {repeticion === 'ninguna'
                ? 'Completada'
                : `Completada el ${formatearFechaLarga(fechaOcurrencia)}`}
            </label>
          )}

          {error && <p className="error">{error}</p>}

          {confirmandoEliminar ? (
            <div className="confirmar-eliminar">
              <p>{esRutina ? '¿Qué quieres eliminar?' : '¿Eliminar esta actividad?'}</p>
              <div className="acciones">
                <button type="button" className="boton-secundario" onClick={() => setConfirmandoEliminar(false)}>
                  No eliminar
                </button>
                {esRutina && (
                  <button
                    type="button"
                    className="boton-peligro"
                    onClick={() => onEliminarDia(actividad.id, fechaOcurrencia)}
                  >
                    Solo este día
                  </button>
                )}
                <button type="button" className="boton-peligro" onClick={() => onEliminar(actividad.id)}>
                  {esRutina ? 'Toda la rutina' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="acciones">
              {editando && (
                <button type="button" className="boton-eliminar" onClick={() => setConfirmandoEliminar(true)}>
                  Eliminar
                </button>
              )}
              <button type="button" className="boton-secundario" onClick={onCancelar}>
                Cancelar
              </button>
              <button type="submit" className="boton-primario">
                Guardar
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default FormularioActividad
