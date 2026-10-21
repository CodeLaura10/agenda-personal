export function fechaATexto(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0')
  const dia = String(fecha.getDate()).padStart(2, '0')
  return `${fecha.getFullYear()}-${mes}-${dia}`
}

export function textoAFecha(texto) {
  return new Date(`${texto}T00:00`)
}

export function diaDeLaSemana(texto) {
  return textoAFecha(texto).getDay()
}

export function sumarDias(texto, cantidad) {
  const fecha = textoAFecha(texto)
  fecha.setDate(fecha.getDate() + cantidad)
  return fechaATexto(fecha)
}

export function lunesDeLaSemana(texto) {
  const diasDesdeLunes = (diaDeLaSemana(texto) + 6) % 7
  return sumarDias(texto, -diasDesdeLunes)
}

export function semanasEntre(desde, hasta) {
  const UNA_SEMANA = 7 * 24 * 60 * 60 * 1000
  const diferencia = textoAFecha(lunesDeLaSemana(hasta)) - textoAFecha(lunesDeLaSemana(desde))
  return Math.round(diferencia / UNA_SEMANA)
}

export function esSemanaDelMes(texto, semana) {
  if (semana === 'ultima') {
    return sumarDias(texto, 7).slice(5, 7) !== texto.slice(5, 7)
  }
  const diaDelMes = Number(texto.slice(8, 10))
  return Math.ceil(diaDelMes / 7) === Number(semana)
}

export function formatearFechaLarga(texto) {
  return textoAFecha(texto).toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}
