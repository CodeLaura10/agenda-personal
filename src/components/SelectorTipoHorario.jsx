function SelectorTipoHorario({ sinHora, onCambiar }) {
  return (
    <div className="selector-tipo" role="group" aria-label="Tipo de actividad">
      <button
        type="button"
        className={sinHora ? 'opcion-tipo' : 'opcion-tipo activo'}
        aria-pressed={!sinHora}
        onClick={() => onCambiar(false)}
      >
        🕒 Con horario
      </button>
      <button
        type="button"
        className={sinHora ? 'opcion-tipo activo' : 'opcion-tipo'}
        aria-pressed={sinHora}
        onClick={() => onCambiar(true)}
      >
        ✅ Tarea del día
      </button>
    </div>
  )
}

export default SelectorTipoHorario
