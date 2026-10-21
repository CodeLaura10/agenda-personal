import { opcionesFrecuencia, opcionesSemanaDelMes } from '../data/opciones'

function CamposFrecuencia({ frecuencia, semanaDelMes, onCambiarFrecuencia, onCambiarSemanaDelMes }) {
  return (
    <div className="fila-horas">
      <label>
        Frecuencia
        <select value={frecuencia} onChange={(e) => onCambiarFrecuencia(e.target.value)}>
          {opcionesFrecuencia.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.texto}
            </option>
          ))}
        </select>
      </label>

      {frecuencia === 'mensual' && (
        <label>
          Semana del mes
          <select value={semanaDelMes} onChange={(e) => onCambiarSemanaDelMes(e.target.value)}>
            {opcionesSemanaDelMes.map((opcion) => (
              <option key={opcion.valor} value={opcion.valor}>
                {opcion.texto}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  )
}

export default CamposFrecuencia
