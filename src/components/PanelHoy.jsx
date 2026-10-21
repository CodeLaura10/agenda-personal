import { actividadesDelDia, estaCompletada, textoHorario } from '../utils/actividades'
import { formatearFechaLarga } from '../utils/fechas'
import './PanelHoy.css'

function PanelHoy({ actividades, categorias, fecha, onAlternarCompletada, onAbrir }) {
  const delDia = actividadesDelDia(actividades, fecha)
  const hechas = delDia.filter((actividad) => estaCompletada(actividad, fecha)).length

  return (
    <section className="panel-hoy">
      <div className="panel-hoy-encabezado">
        <h2>
          Hoy <span className="fecha-hoy">{formatearFechaLarga(fecha)}</span>
        </h2>
        {delDia.length > 0 && (
          <span className="progreso-hoy">{hechas} de {delDia.length} completadas</span>
        )}
      </div>

      {delDia.length === 0 ? (
        <p className="vacio">No tienes actividades para hoy.</p>
      ) : (
        <ul className="lista-hoy">
          {delDia.map((actividad) => {
            const categoria = categorias.find((cat) => cat.id === actividad.categoria)
            const completada = estaCompletada(actividad, fecha)

            return (
              <li
                key={actividad.id}
                className={completada ? 'item-hoy completada' : 'item-hoy'}
                style={{ '--color-categoria': categoria?.color }}
              >
                <input
                  type="checkbox"
                  checked={completada}
                  onChange={() => onAlternarCompletada(actividad.id, fecha)}
                  aria-label={`Marcar "${actividad.titulo}" como completada`}
                />
                <button type="button" className="item-hoy-texto" onClick={() => onAbrir(actividad, fecha)}>
                  <span className="item-hoy-hora">{textoHorario(actividad)}</span>
                  <span className="item-hoy-titulo">
                    {categoria?.icono} {actividad.titulo}
                  </span>
                  {actividad.descripcion && (
                    <span className="item-hoy-descripcion">{actividad.descripcion}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default PanelHoy
