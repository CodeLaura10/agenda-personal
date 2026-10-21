import { semanaDeRutina, textoFrecuencia, textoSobreColor } from '../utils/actividades'
import './PanelCategoria.css'

function PanelCategoria({ categoria, colorOriginal, rutina, onEditarRutina, onCambiarColor, onRestablecerColor }) {
  const semana = semanaDeRutina(rutina)

  return (
    <section
      className="panel-categoria"
      style={{ '--color-categoria': categoria.color, '--texto-categoria': textoSobreColor(categoria.color) }}
    >
      <div className="panel-categoria-encabezado">
        <h2>
          {categoria.icono} {categoria.nombre}
        </h2>
        <div className="panel-categoria-color">
          <label className="selector-color">
            Color
            <input type="color" value={categoria.color} onChange={(e) => onCambiarColor(e.target.value)} />
          </label>
          {categoria.color !== colorOriginal && (
            <button type="button" className="boton-texto" onClick={onRestablecerColor}>
              Restablecer
            </button>
          )}
        </div>
      </div>

      <p className="panel-categoria-ayuda">
        Estás viendo solo <strong>{categoria.nombre}</strong>. Lo que anotes en el calendario se
        guardará aquí. Toca la categoría de nuevo para ver todo.
      </p>

      <div className="panel-categoria-subtitulo">
        <h3>Mi rutina semanal</h3>
        <button type="button" className="boton-primario" onClick={onEditarRutina}>
          {rutina.length > 0 ? 'Editar rutina' : 'Crear rutina'}
        </button>
      </div>

      {rutina.length === 0 ? (
        <p className="vacio">
          Aún no tienes una rutina para esta categoría. Créala y el calendario se organizará solo.
        </p>
      ) : (
        <ul className="semana-rutina">
          {semana.map((dia) => (
            <li key={dia.valor} className="dia-rutina">
              <span className="dia-rutina-nombre">{dia.nombre}</span>
              <div className="dia-rutina-items">
                {dia.items.length === 0 ? (
                  <span className="dia-libre">—</span>
                ) : (
                  dia.items.map((item) => (
                    <span key={item.id} className="chip-rutina">
                      {item.horaInicio ? <strong>{item.horaInicio}</strong> : '✅'} {item.titulo}
                      {textoFrecuencia(item) && <em> · {textoFrecuencia(item)}</em>}
                    </span>
                  ))
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default PanelCategoria
