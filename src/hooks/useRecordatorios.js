import { useEffect, useRef } from 'react'
import { actividadesDelDia, buscarCategoria, estaCompletada } from '../utils/actividades'
import { fechaATexto } from '../utils/fechas'

const INTERVALO_REVISION = 20 * 1000
const UN_MINUTO = 60 * 1000

function mostrarNotificacion(titulo, opciones) {
  try {
    new Notification(titulo, opciones)
  } catch {
    // Algunos navegadores de celular solo permiten notificaciones desde una PWA.
  }
}

export function useRecordatorios(actividades) {
  const avisados = useRef(new Set())

  useEffect(() => {
    function revisar() {
      if (!('Notification' in window) || Notification.permission !== 'granted') return

      const ahora = Date.now()
      const hoy = fechaATexto(new Date())

      for (const actividad of actividadesDelDia(actividades, hoy)) {
        if (!actividad.horaInicio || !actividad.recordatorio) continue
        if (estaCompletada(actividad, hoy)) continue

        const clave = `${actividad.id}_${hoy}`
        if (avisados.current.has(clave)) continue

        const inicio = new Date(`${hoy}T${actividad.horaInicio}`).getTime()
        const momentoAviso = inicio - Number(actividad.recordatorio) * UN_MINUTO

        if (ahora >= momentoAviso && ahora < inicio + UN_MINUTO) {
          avisados.current.add(clave)
          const categoria = buscarCategoria(actividad.categoria)
          const minutosFaltantes = Math.round((inicio - ahora) / UN_MINUTO)
          const cuando = minutosFaltantes > 0
            ? `Empieza en ${minutosFaltantes} min (${actividad.horaInicio})`
            : `Empieza ahora (${actividad.horaInicio})`
          mostrarNotificacion(`${categoria?.icono ?? ''} ${actividad.titulo}`, {
            body: actividad.descripcion ? `${cuando}\n${actividad.descripcion}` : cuando,
            tag: clave,
          })
        }
      }
    }

    revisar()
    const intervalo = setInterval(revisar, INTERVALO_REVISION)
    return () => clearInterval(intervalo)
  }, [actividades])
}
