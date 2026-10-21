# Mi Agenda Personal

Agenda web para organizar la semana por categorías, desde el computador o el celular. Funciona en el navegador, sin crear cuenta: los datos se guardan en el propio dispositivo.

## Funcionalidades

- **Calendario** con vista de mes, semana y día, en español y con la semana empezando el lunes.
- **Actividades** con título, descripción, categoría, fecha y hora de inicio y fin. También pueden ser **tareas del día**, sin hora.
- **Repetición**: ninguna, todos los días o días específicos de la semana, cada semana, **cada 15 días** o **una vez al mes** (por ejemplo, el primer martes). Se puede indicar hasta cuándo se repite.
- **Rutina semanal por categoría**: una lista de actividades con sus días y horarios que organiza el calendario automáticamente. Al editar la rutina, el calendario se actualiza.
- **Seis categorías**: Alimentación, Aseo del hogar, Trabajo, Hobbies, Citas y reuniones, y Deporte. Al seleccionar una categoría, el calendario muestra solo sus actividades. Cada categoría tiene un **color** que se puede personalizar.
- **Panel "Hoy"** con las actividades del día y una casilla para marcarlas como completadas. En las actividades que se repiten, "completada" y "eliminar solo este día" aplican a una sola fecha.
- **Recordatorios** con notificaciones del navegador: a la hora de inicio o de 5 minutos a 1 hora antes.
- **Copia de seguridad**: exportar e importar los datos en un archivo JSON.
- Diseño adaptable a celular y modo oscuro automático.

## Tecnologías

- [React 19](https://react.dev) con [Vite](https://vite.dev)
- [FullCalendar 6](https://fullcalendar.io) (`@fullcalendar/react`, `daygrid`, `timegrid` e `interaction`)
- `localStorage` para guardar los datos, sin backend
- ESLint

> Todos los paquetes de FullCalendar deben estar en la **versión 6**. La versión 7 de `@fullcalendar/react` no es compatible con los plugins `daygrid`, `timegrid` e `interaction`.

## Cómo ejecutarla

Requiere [Node.js](https://nodejs.org) 20.19 o superior (o 22.12 o superior).

```bash
git clone https://github.com/CodeLaura10/agenda-personal.git
cd agenda-personal
npm install
npm run dev
```

Luego abre la dirección que aparece en la terminal (normalmente `http://localhost:5173`).

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga automática |
| `npm run build` | Genera la versión para publicar en la carpeta `dist/` |
| `npm run preview` | Sirve `dist/` localmente para revisarla antes de publicar |
| `npm run lint` | Revisa el código con ESLint |

## Publicar

Es un sitio estático, así que se puede publicar gratis en [Vercel](https://vercel.com) o [Netlify](https://netlify.com) importando el repositorio. Ambos detectan Vite solos: el comando de build es `npm run build` y la carpeta de salida, `dist`.

## Estructura del proyecto

```
src/
├── App.jsx                  Componente principal: estado, calendario y coordinación
├── components/
│   ├── FormularioActividad  Crear, editar y eliminar una actividad
│   ├── EditorRutina         Editar la rutina semanal de una categoría
│   ├── PanelCategoria       Rutina de la semana y color de la categoría seleccionada
│   ├── PanelHoy             Actividades del día
│   ├── CopiaSeguridad       Exportar e importar
│   └── SelectorDias, SelectorTipoHorario, CamposFrecuencia   Campos compartidos
├── data/                    Categorías, opciones de formularios y rutinas sugeridas
├── hooks/
│   ├── useRecordatorios     Revisa y envía las notificaciones
│   └── useCerrarModal       Cierra ventanas con Esc o clic fuera
└── utils/
    ├── actividades.js       Cuándo ocurre cada actividad, eventos del calendario y rutinas
    └── fechas.js            Funciones de fechas
```

## Cómo se guardan los datos

En el `localStorage` del navegador, con estas claves:

- `actividades`: lista de actividades. Una actividad que se repite se guarda **una sola vez** con su regla de repetición, y las fechas en que se ve se calculan con `ocurreEn` en `src/utils/actividades.js`. Las actividades de una rutina llevan `rutina: true`.
- `coloresCategorias`: los colores que la persona cambió.

## Limitaciones actuales

- **Los datos no se sincronizan entre dispositivos**: cada navegador tiene su propia agenda. Para pasar los datos de un dispositivo a otro, usa Exportar e Importar.
- **Los recordatorios solo llegan con la página abierta**, aunque sea en otra pestaña.
- Borrar los datos del navegador borra la agenda. Conviene exportar una copia de vez en cuando.

## Próximos pasos

- [ ] Convertirla en PWA para instalarla en el celular
- [ ] Cuentas de usuario y sincronización en la nube entre celular y computador
- [ ] Notificaciones push con la app cerrada
