import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { categorias } from './data/categorias'
import { rutinasSugeridas } from './data/rutinasSugeridas'
import FormularioActividad from './components/FormularioActividad'
import EditorRutina from './components/EditorRutina'
import PanelHoy from './components/PanelHoy'
import PanelCategoria from './components/PanelCategoria'
import CopiaSeguridad from './components/CopiaSeguridad'
import { useRecordatorios } from './hooks/useRecordatorios'
import {
  actividadAItemDeRutina,
  esDeRutina,
  eventosEntre,
  guardarEnLista,
  nuevoIdItem,
  sincronizarRutina,
} from './utils/actividades'
import { fechaATexto, lunesDeLaSemana } from './utils/fechas'
import './App.css'

function cargarDeLocalStorage(clave, valorPorDefecto) {
  try {
    const guardado = localStorage.getItem(clave)
    return guardado ? JSON.parse(guardado) : valorPorDefecto
  } catch {
    return valorPorDefecto
  }
}

function permisoInicial() {
  return 'Notification' in window ? Notification.permission : 'no-soportado'
}

function App() {
  const [categoriaActivaId, setCategoriaActivaId] = useState(null)
  const [actividades, setActividades] = useState(() => cargarDeLocalStorage('actividades', []))
  const [colores, setColores] = useState(() => cargarDeLocalStorage('coloresCategorias', {}))
  // Las plantillas que se hayan creado antes se usan como sugerencias para la primera rutina.
  const [sugerencias] = useState(() => cargarDeLocalStorage('plantillas', rutinasSugeridas))
  const [formulario, setFormulario] = useState(null)
  const [editorRutinaAbierto, setEditorRutinaAbierto] = useState(false)
  const [rango, setRango] = useState(null)
  const [hoy, setHoy] = useState(() => fechaATexto(new Date()))
  const [permisoNotificaciones, setPermisoNotificaciones] = useState(permisoInicial)

  useEffect(() => {
    localStorage.setItem('actividades', JSON.stringify(actividades))
  }, [actividades])

  useEffect(() => {
    localStorage.setItem('coloresCategorias', JSON.stringify(colores))
  }, [colores])

  useEffect(() => {
    const intervalo = setInterval(() => setHoy(fechaATexto(new Date())), 60 * 1000)
    return () => clearInterval(intervalo)
  }, [])

  useRecordatorios(actividades)

  const categoriasConColor = categorias.map((categoria) => ({
    ...categoria,
    color: colores[categoria.id] ?? categoria.color,
  }))

  const categoriaActiva = categoriasConColor.find((categoria) => categoria.id === categoriaActivaId)

  const actividadesVisibles = categoriaActiva
    ? actividades.filter((actividad) => actividad.categoria === categoriaActiva.id)
    : actividades

  const rutinaActiva = categoriaActiva
    ? actividades
        .filter((actividad) => esDeRutina(actividad, categoriaActiva.id))
        .map(actividadAItemDeRutina)
    : []

  const eventos = rango
    ? eventosEntre(actividadesVisibles, rango.inicio, rango.fin, categoriasConColor)
    : []

  function alternarCategoria(id) {
    setCategoriaActivaId(categoriaActivaId === id ? null : id)
  }

  function cambiarColor(id, color) {
    setColores((anteriores) => ({ ...anteriores, [id]: color }))
  }

  function restablecerColor(id) {
    setColores((anteriores) => {
      const nuevos = { ...anteriores }
      delete nuevos[id]
      return nuevos
    })
  }

  function abrirNueva(fecha, hora = '') {
    setFormulario({ actividad: null, fecha, hora })
  }

  function abrirExistente(actividad, fecha) {
    setFormulario({ actividad, fecha, hora: '' })
  }

  function manejarClicEnDia(info) {
    abrirNueva(info.dateStr.slice(0, 10), info.allDay ? '' : info.dateStr.slice(11, 16))
  }

  function manejarClicEnEvento(info) {
    const { actividadId, fecha } = info.event.extendedProps
    const actividad = actividades.find((a) => a.id === actividadId)
    if (actividad) abrirExistente(actividad, fecha)
  }

  function manejarCambioDeFechas(info) {
    const inicio = fechaATexto(info.start)
    const fin = fechaATexto(info.end)
    setRango((anterior) =>
      anterior?.inicio === inicio && anterior?.fin === fin ? anterior : { inicio, fin },
    )
  }

  function guardarActividad(actividadGuardada) {
    setActividades((anteriores) => guardarEnLista(anteriores, actividadGuardada))
    setFormulario(null)
  }

  function eliminarActividad(id) {
    setActividades((anteriores) => anteriores.filter((a) => a.id !== id))
    setFormulario(null)
  }

  function eliminarDia(id, fecha) {
    setActividades((anteriores) =>
      anteriores.map((a) =>
        a.id === id ? { ...a, excepciones: [...(a.excepciones ?? []), fecha] } : a,
      ),
    )
    setFormulario(null)
  }

  function alternarCompletada(id, fecha) {
    setActividades((anteriores) =>
      anteriores.map((a) => {
        if (a.id !== id) return a
        const completadas = a.completadas ?? []
        return {
          ...a,
          completadas: completadas.includes(fecha)
            ? completadas.filter((dia) => dia !== fecha)
            : [...completadas, fecha],
        }
      }),
    )
  }

  function itemsParaEditor() {
    if (rutinaActiva.length > 0) return rutinaActiva
    return sugerencias
      .filter((sugerencia) => sugerencia.categoria === categoriaActiva.id)
      .map((sugerencia) => ({
        id: nuevoIdItem(),
        titulo: sugerencia.titulo,
        descripcion: sugerencia.descripcion ?? '',
        dias: sugerencia.dias,
        frecuencia: 'semanal',
        semanaDelMes: '1',
        fecha: lunesDeLaSemana(hoy),
        horaInicio: sugerencia.horaInicio ?? '',
        horaFin: sugerencia.horaFin ?? '',
        recordatorio: sugerencia.recordatorio ?? '',
      }))
  }

  function guardarRutina(items) {
    setActividades((anteriores) =>
      sincronizarRutina(anteriores, categoriaActiva.id, items, lunesDeLaSemana(hoy)),
    )
    setEditorRutinaAbierto(false)
  }

  function eliminarRutina() {
    setActividades((anteriores) => anteriores.filter((a) => !esDeRutina(a, categoriaActiva.id)))
    setEditorRutinaAbierto(false)
  }

  function importarCopia(copia) {
    setActividades(copia.actividades)
    if (copia.colores) setColores(copia.colores)
  }

  async function activarRecordatorios() {
    const permiso = await Notification.requestPermission()
    setPermisoNotificaciones(permiso)
  }

  return (
    <main className="app">
      <h1>Mi Agenda Personal</h1>
      <p>Organiza tu semana por categorías</p>

      {permisoNotificaciones === 'default' && (
        <div className="aviso-notificaciones">
          <button type="button" className="boton-secundario" onClick={activarRecordatorios}>
            🔔 Activar recordatorios
          </button>
        </div>
      )}
      {permisoNotificaciones === 'denied' && (
        <p className="aviso-notificaciones">
          Las notificaciones están bloqueadas. Actívalas en la configuración del navegador para recibir recordatorios.
        </p>
      )}

      <div className="categorias">
        {categoriasConColor.map((categoria) => (
          <button
            key={categoria.id}
            className={categoriaActivaId === categoria.id ? 'boton-categoria activo' : 'boton-categoria'}
            style={{ '--color-categoria': categoria.color }}
            aria-pressed={categoriaActivaId === categoria.id}
            onClick={() => alternarCategoria(categoria.id)}
          >
            <span className="icono">{categoria.icono}</span>
            {categoria.nombre}
          </button>
        ))}
      </div>

      {!categoriaActiva && (
        <p className="filtro-info">
          Toca una categoría para ver solo sus actividades y organizar su rutina semanal.
        </p>
      )}

      {categoriaActiva && (
        <PanelCategoria
          categoria={categoriaActiva}
          colorOriginal={categorias.find((categoria) => categoria.id === categoriaActiva.id).color}
          rutina={rutinaActiva}
          onEditarRutina={() => setEditorRutinaAbierto(true)}
          onCambiarColor={(color) => cambiarColor(categoriaActiva.id, color)}
          onRestablecerColor={() => restablecerColor(categoriaActiva.id)}
        />
      )}

      <PanelHoy
        actividades={actividadesVisibles}
        categorias={categoriasConColor}
        fecha={hoy}
        onAlternarCompletada={alternarCompletada}
        onAbrir={abrirExistente}
      />

      <section className="calendario">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          height="auto"
          allDayText="Tareas"
          eventDisplay="block"
          events={eventos}
          datesSet={manejarCambioDeFechas}
          dateClick={manejarClicEnDia}
          eventClick={manejarClicEnEvento}
        />
      </section>

      <CopiaSeguridad actividades={actividades} colores={colores} onImportar={importarCopia} />

      <button
        type="button"
        className="boton-flotante"
        aria-label="Nueva actividad"
        title="Nueva actividad"
        onClick={() => abrirNueva(hoy)}
      >
        +
      </button>

      {formulario && (
        <FormularioActividad
          actividad={formulario.actividad}
          fechaOcurrencia={formulario.fecha}
          horaInicial={formulario.hora}
          categoriaInicial={categoriaActiva?.id ?? categorias[0].id}
          categorias={categoriasConColor}
          onGuardar={guardarActividad}
          onEliminar={eliminarActividad}
          onEliminarDia={eliminarDia}
          onCancelar={() => setFormulario(null)}
        />
      )}

      {editorRutinaAbierto && categoriaActiva && (
        <EditorRutina
          categoria={categoriaActiva}
          itemsIniciales={itemsParaEditor()}
          fechaInicio={lunesDeLaSemana(hoy)}
          rutinaExiste={rutinaActiva.length > 0}
          onGuardar={guardarRutina}
          onEliminarRutina={eliminarRutina}
          onCancelar={() => setEditorRutinaAbierto(false)}
        />
      )}
    </main>
  )
}

export default App
