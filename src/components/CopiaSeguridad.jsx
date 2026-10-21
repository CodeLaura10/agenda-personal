import { useState } from 'react'
import { esActividadValida } from '../utils/actividades'
import { fechaATexto } from '../utils/fechas'

function leerColores(colores) {
  if (typeof colores !== 'object' || colores === null) return null
  const validos = Object.entries(colores).filter(
    ([, color]) => typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color),
  )
  return Object.fromEntries(validos)
}

function leerCopia(datos) {
  // Las primeras copias eran solo la lista de actividades.
  const actividades = Array.isArray(datos) ? datos : datos?.actividades
  if (!Array.isArray(actividades) || !actividades.every(esActividadValida)) return null
  return { actividades, colores: leerColores(datos?.colores) }
}

function CopiaSeguridad({ actividades, colores, onImportar }) {
  const [mensaje, setMensaje] = useState('')

  function exportar() {
    const contenido = JSON.stringify({ actividades, colores }, null, 2)
    const archivo = new Blob([contenido], { type: 'application/json' })
    const url = URL.createObjectURL(archivo)

    const enlace = document.createElement('a')
    enlace.href = url
    enlace.download = `agenda-${fechaATexto(new Date())}.json`
    enlace.click()
    URL.revokeObjectURL(url)

    setMensaje(`Se descargó una copia con ${actividades.length} actividades.`)
  }

  async function importar(evento) {
    const archivo = evento.target.files[0]
    evento.target.value = ''
    if (!archivo) return

    try {
      const copia = leerCopia(JSON.parse(await archivo.text()))
      if (!copia) throw new Error('Formato inválido')

      const confirmado = window.confirm(
        `Se reemplazarán tus datos actuales por los del archivo (${copia.actividades.length} actividades). ¿Continuar?`,
      )
      if (!confirmado) return

      onImportar(copia)
      setMensaje('Copia importada correctamente.')
    } catch {
      setMensaje('Ese archivo no es una copia válida de la agenda.')
    }
  }

  return (
    <section className="copia-seguridad">
      <h2>Copia de seguridad</h2>
      <p>
        Tus actividades, rutinas y colores se guardan solo en este navegador. Descarga una copia
        para no perderlos o para pasarlos a otro dispositivo.
      </p>
      <div className="copia-botones">
        <button type="button" className="boton-secundario" onClick={exportar}>
          Exportar
        </button>
        <label className="boton-secundario">
          Importar
          <input type="file" accept=".json,application/json" hidden onChange={importar} />
        </label>
      </div>
      {mensaje && <p className="copia-mensaje">{mensaje}</p>}
    </section>
  )
}

export default CopiaSeguridad
