import { diasSemana } from '../data/opciones'

function SelectorDias({ dias, onCambiar }) {
  function alternarDia(valor) {
    if (dias.includes(valor)) {
      onCambiar(dias.filter((dia) => dia !== valor))
    } else {
      onCambiar([...dias, valor])
    }
  }

  return (
    <div className="selector-dias" role="group" aria-label="Días de la semana">
      {diasSemana.map((dia) => (
        <button
          key={dia.valor}
          type="button"
          className={dias.includes(dia.valor) ? 'boton-dia activo' : 'boton-dia'}
          aria-pressed={dias.includes(dia.valor)}
          aria-label={dia.nombre}
          title={dia.nombre}
          onClick={() => alternarDia(dia.valor)}
        >
          {dia.letra}
        </button>
      ))}
    </div>
  )
}

export default SelectorDias
