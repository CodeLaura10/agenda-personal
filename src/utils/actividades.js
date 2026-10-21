import { categorias } from '../data/categorias'
import { diasSemana, opcionesSemanaDelMes } from '../data/opciones'
import { diaDeLaSemana, esSemanaDelMes, semanasEntre, sumarDias } from './fechas'

export function buscarCategoria(id) {
  return categorias.find((categoria) => categoria.id === id)
}

export function validarHoras(horaInicio, horaFin) {
  if (horaFin && !horaInicio) return 'Si pones hora de fin, también necesitas hora de inicio.'
  if (horaInicio && horaFin && horaFin <= horaInicio) return 'La hora de fin debe ser después de la hora de inicio.'
  return ''
}

export function textoHorario(elemento) {
  if (!elemento.horaInicio) return 'Tarea del día'
  if (!elemento.horaFin) return elemento.horaInicio
  return `${elemento.horaInicio} – ${elemento.horaFin}`
}

function ordenarPorHora(a, b) {
  return (a.horaInicio || '').localeCompare(b.horaInicio || '')
}

export function guardarEnLista(lista, elemento) {
  const existe = lista.some((item) => item.id === elemento.id)
  return existe
    ? lista.map((item) => (item.id === elemento.id ? elemento : item))
    : [...lista, elemento]
}

export function ocurreEn(actividad, fecha) {
  if (fecha < actividad.fecha) return false
  if (actividad.excepciones?.includes(fecha)) return false

  const repeticion = actividad.repeticion ?? 'ninguna'
  if (repeticion === 'ninguna') return fecha === actividad.fecha
  if (actividad.repetirHasta && fecha > actividad.repetirHasta) return false
  if (repeticion === 'diaria') return true
  if (!(actividad.dias ?? []).includes(diaDeLaSemana(fecha))) return false

  const frecuencia = actividad.frecuencia ?? 'semanal'
  if (frecuencia === 'quincenal') return semanasEntre(actividad.fecha, fecha) % 2 === 0
  if (frecuencia === 'mensual') return esSemanaDelMes(fecha, actividad.semanaDelMes ?? '1')
  return true
}

export function textoFrecuencia(elemento) {
  if (elemento.frecuencia === 'quincenal') return 'cada 15 días'
  if (elemento.frecuencia === 'mensual') {
    const opcion = opcionesSemanaDelMes.find((o) => o.valor === (elemento.semanaDelMes ?? '1'))
    return `${opcion.texto.toLowerCase()} semana del mes`
  }
  return ''
}

export function estaCompletada(actividad, fecha) {
  return actividad.completadas?.includes(fecha) ?? false
}

export function actividadesDelDia(actividades, fecha) {
  return actividades.filter((actividad) => ocurreEn(actividad, fecha)).sort(ordenarPorHora)
}

export function nuevoIdItem() {
  return `r-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function esDeRutina(actividad, categoriaId) {
  return actividad.rutina === true && actividad.categoria === categoriaId
}

export function actividadAItemDeRutina(actividad) {
  let dias = actividad.dias ?? []
  if (actividad.repeticion === 'diaria') dias = diasSemana.map((dia) => dia.valor)
  if (!actividad.repeticion || actividad.repeticion === 'ninguna') dias = [diaDeLaSemana(actividad.fecha)]

  return {
    id: actividad.id,
    titulo: actividad.titulo,
    descripcion: actividad.descripcion ?? '',
    dias,
    frecuencia: actividad.repeticion === 'dias' ? (actividad.frecuencia ?? 'semanal') : 'semanal',
    semanaDelMes: actividad.semanaDelMes ?? '1',
    fecha: actividad.fecha,
    horaInicio: actividad.horaInicio ?? '',
    horaFin: actividad.horaFin ?? '',
    recordatorio: actividad.recordatorio ?? '',
  }
}

export function sincronizarRutina(actividades, categoriaId, items, fechaInicio) {
  const otras = actividades.filter((actividad) => !esDeRutina(actividad, categoriaId))
  const anteriores = actividades.filter((actividad) => esDeRutina(actividad, categoriaId))

  const actualizadas = items.map((item) => {
    const anterior = anteriores.find((actividad) => actividad.id === item.id)
    return {
      ...anterior,
      id: item.id,
      rutina: true,
      categoria: categoriaId,
      titulo: item.titulo.trim(),
      descripcion: item.descripcion.trim(),
      fecha: item.fecha ?? anterior?.fecha ?? fechaInicio,
      horaInicio: item.horaInicio,
      horaFin: item.horaFin,
      repeticion: 'dias',
      dias: item.dias,
      frecuencia: item.frecuencia ?? 'semanal',
      semanaDelMes: item.semanaDelMes ?? '1',
      repetirHasta: anterior?.repetirHasta ?? '',
      recordatorio: item.horaInicio ? item.recordatorio : '',
    }
  })

  return [...otras, ...actualizadas]
}

export function semanaDeRutina(items) {
  return diasSemana.map((dia) => ({
    ...dia,
    items: items.filter((item) => item.dias.includes(dia.valor)).sort(ordenarPorHora),
  }))
}

export function textoSobreColor(colorHex) {
  const rojo = parseInt(colorHex.slice(1, 3), 16)
  const verde = parseInt(colorHex.slice(3, 5), 16)
  const azul = parseInt(colorHex.slice(5, 7), 16)
  const luminosidad = (0.299 * rojo + 0.587 * verde + 0.114 * azul) / 255
  return luminosidad > 0.6 ? '#0c2d48' : '#ffffff'
}

export function eventosEntre(actividades, inicio, fin, listaCategorias = categorias) {
  const eventos = []

  for (let fecha = inicio; fecha < fin; fecha = sumarDias(fecha, 1)) {
    for (const actividad of actividades) {
      if (!ocurreEn(actividad, fecha)) continue

      const categoria = listaCategorias.find((cat) => cat.id === actividad.categoria)
      const completada = estaCompletada(actividad, fecha)

      eventos.push({
        id: `${actividad.id}_${fecha}`,
        title: `${completada ? '✓ ' : ''}${categoria?.icono ?? ''} ${actividad.titulo}`,
        start: actividad.horaInicio ? `${fecha}T${actividad.horaInicio}` : fecha,
        end: actividad.horaFin ? `${fecha}T${actividad.horaFin}` : undefined,
        backgroundColor: categoria?.color,
        borderColor: categoria?.color,
        textColor: categoria ? textoSobreColor(categoria.color) : '#ffffff',
        classNames: completada ? ['completada'] : [],
        extendedProps: { actividadId: actividad.id, fecha },
      })
    }
  }

  return eventos
}

export function esActividadValida(actividad) {
  return (
    typeof actividad === 'object' &&
    actividad !== null &&
    typeof actividad.id === 'string' &&
    typeof actividad.titulo === 'string' &&
    typeof actividad.fecha === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(actividad.fecha)
  )
}
