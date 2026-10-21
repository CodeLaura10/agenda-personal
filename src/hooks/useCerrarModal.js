import { useEffect } from 'react'

export function useCerrarModal(onCerrar) {
  useEffect(() => {
    function manejarTecla(evento) {
      if (evento.key === 'Escape') onCerrar()
    }
    window.addEventListener('keydown', manejarTecla)
    return () => window.removeEventListener('keydown', manejarTecla)
  }, [onCerrar])

  return function manejarClicEnFondo(evento) {
    if (evento.target === evento.currentTarget) onCerrar()
  }
}
