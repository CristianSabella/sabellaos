// Datos de los proyectos (sacados del portfolio clásico)
export const PROYECTOS = [
 {
  "nombre": "DyNamo",
  "sub": "Chatbot con IA para negocios",
  "cats": [
   "web",
   "db"
  ],
  "destacado": true,
  "desc": "Asistente con inteligencia artificial que atiende a los clientes de un negocio desde la web, WhatsApp, Instagram, Facebook, Telegram y TikTok, todo en una sola bandeja, con un panel de administración que se configura sin tocar código.",
  "items": [
   "IA con Google Gemini (gratis) o ChatGPT; entiende audios, fotos y otros idiomas.",
   "Se conecta a la tienda online del negocio y aprende solo los productos, precios y stock.",
   "Pedidos y cobros con Mercado Pago, cupones, campañas, tickets y estadísticas.",
   "Publica un video en todas las redes a la vez y marca «visto» solo cuando se lee.",
   "Seguridad: datos cifrados, verificación en dos pasos y freno contra bucles de mensajes.",
   "Nada que cueste plata se activa sin que el usuario lo confirme."
  ],
  "tech": [
   "Node.js",
   "Express",
   "SQLite",
   "Gemini",
   "ChatGPT",
   "Meta API",
   "Mercado Pago"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/dynamo.jpg",
  "video": "https://cristiansabella.github.io/SabellaCristian/video/dynamo.mp4",
  "badge": "En proceso",
  "jugar": null,
  "links": []
 },
 {
  "nombre": "Atelier Norte",
  "sub": "Sitio de galería de arte",
  "cats": [
   "web",
   "db"
  ],
  "destacado": true,
  "desc": "Sitio de una galería de arte contemporáneo hecho con HTML, CSS y JavaScript puro, sin frameworks: cuatro páginas responsive con exposición, artistas y reserva de visitas guiadas.",
  "items": [
   "Galería con filtros por técnica y contador de obras visibles, y ampliación de cada obra sin JavaScript.",
   "Catálogo que se carga desde un archivo XML con DOMParser y detecta XML mal formado.",
   "Formulario de visita con validaciones, confirmación, pedido en JSON y cookie de visitante.",
   "Mini base de datos con sessionStorage: guarda, lista y elimina las solicitudes, y se vacía al cerrar la página.",
   "Cartel de abierto / cerrado según el día, modo oscuro automático y HTML/CSS validados."
  ],
  "tech": [
   "HTML",
   "CSS",
   "JavaScript",
   "XML",
   "JSON",
   "sessionStorage"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/atelier-norte.jpg",
  "video": null,
  "badge": "Nuevo",
  "jugar": null,
  "links": [
   {
    "url": "https://cristiansabella.github.io/SabellaCristian/atelier-norte/",
    "txt": "Ver web"
   },
   {
    "url": "https://github.com/CristianSabella/SabellaCristian/tree/main/atelier-norte",
    "txt": "Código"
   }
  ]
 },
 {
  "nombre": "Gestión de Eventos y Venta de Entradas",
  "sub": "",
  "cats": [
   "db"
  ],
  "destacado": false,
  "desc": "Base de datos completa: 8 tablas relacionales, 4 procedimientos almacenados, 5 triggers, 4 vistas y 3 índices, con datos de prueba y consultas de negocio.",
  "items": [],
  "tech": [
   "SQL Server",
   "T-SQL"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/eventos.jpg",
  "video": null,
  "badge": "",
  "jugar": null,
  "links": []
 },
 {
  "nombre": "MAREA",
  "sub": "Web de café de especialidad",
  "cats": [
   "web"
  ],
  "destacado": true,
  "desc": "Sitio web para una cafetería de especialidad frente al río en Rosario, hecho en equipo para un cliente: recorrido por escenas con zoom al hacer scroll, carta, tienda online y reservas, con versión para Android.",
  "items": [
   "Recorrido inicial con fotos del río y el puente Rosario-Victoria, con zoom y fundido ligados al scroll.",
   "Tienda con carrito, molienda a elección, envío, cupón de descuento y código listo para Shopify, Wix o Tiendanube.",
   "Reservas, newsletter con pop-up de 10% OFF, mapa de Google y botón \"Cómo llegar\".",
   "Responsive, SEO básico, ilustraciones animadas en SVG y app Android (APK)."
  ],
  "tech": [
   "HTML",
   "CSS",
   "JavaScript",
   "SVG",
   "Android"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/marea.jpg",
  "video": null,
  "badge": "Para cliente",
  "jugar": null,
  "links": [
   {
    "url": "https://cristiansabella.github.io/SabellaCristian/marea/",
    "txt": "Ver web"
   },
   {
    "url": "https://cristiansabella.github.io/SabellaCristian/marea/docs/MAREA-requerimientos.docx",
    "txt": "Requerimientos"
   },
   {
    "url": "https://cristiansabella.github.io/SabellaCristian/marea/docs/MAREA.apk",
    "txt": "App"
   }
  ]
 },
 {
  "nombre": "Enemy Obby Race",
  "sub": "",
  "cats": [
   "game"
  ],
  "destacado": false,
  "desc": "Videojuego multijugador con toda la lógica programada: IA de enemigos, sistema de revivir, economía de monedas y mejoras, persistencia de datos, tienda con NPCs, pases de pago y VIP, eventos periódicos, música por zonas e interfaz móvil.",
  "items": [],
  "tech": [
   "Lua (Luau)",
   "DataStore"
  ],
  "img": null,
  "video": null,
  "badge": "Videojuego",
  "jugar": null,
  "links": []
 },
 {
  "nombre": "Stack",
  "sub": "Torre de bloques",
  "cats": [
   "game"
  ],
  "destacado": false,
  "desc": "Juego de apilar bloques en vista isométrica: el bloque va y viene y hay que soltarlo justo encima del anterior.",
  "items": [
   "Lo que sobresale se corta y cae; si acertás justo, «¡Perfecto!» y el bloque no se achica.",
   "La torre cambia de color mientras sube y la velocidad aumenta.",
   "Se juega con un toque, un clic o la barra espaciadora."
  ],
  "tech": [
   "JavaScript",
   "Canvas"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/juego-stack.jpg",
  "video": null,
  "badge": "Jugable",
  "jugar": "stack",
  "links": []
 },
 {
  "nombre": "Snake",
  "sub": "La viborita",
  "cats": [
   "game"
  ],
  "destacado": false,
  "desc": "El clásico de la viborita con estilo neón: comé, crecé y no choques.",
  "items": [
   "Se controla con flechas o WASD, deslizando el dedo o con botones en pantalla.",
   "Va más rápido a medida que come.",
   "Récord personal guardado solo en el navegador de cada jugador."
  ],
  "tech": [
   "JavaScript",
   "Canvas"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/juego-snake.jpg",
  "video": null,
  "badge": "Jugable",
  "jugar": "snake",
  "links": []
 },
 {
  "nombre": "Cascada",
  "sub": "Piezas que caen",
  "cats": [
   "game"
  ],
  "destacado": false,
  "desc": "Juego de piezas que caen: completá líneas para borrarlas y sumá puntos.",
  "items": [
   "Siete piezas con giro y ajuste contra las paredes, sombra de caída y próxima pieza.",
   "Niveles que aceleran la caída cada 10 líneas.",
   "Controles de teclado y táctiles: tocar gira, arrastrar mueve, deslizar abajo la suelta."
  ],
  "tech": [
   "JavaScript",
   "Canvas"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/juego-cascada.jpg",
  "video": null,
  "badge": "Jugable",
  "jugar": "cascada",
  "links": []
 },
 {
  "nombre": "Arena Helada",
  "sub": "Shooter 3D",
  "cats": [
   "game"
  ],
  "destacado": true,
  "desc": "Shooter en primera persona: vos contra 6 robots en una arena de hielo bajo un cielo estrellado.",
  "items": [
   "Bots con inteligencia artificial que patrullan, te buscan, se mueven de costado y te disparan.",
   "Rondas de 2 minutos con bajas, muertes, radar y energía del arma.",
   "Mouse y teclado en la compu; joystick y botón de disparo en el celular."
  ],
  "tech": [
   "JavaScript",
   "Three.js",
   "WebGL"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/juego-arena-helada.jpg",
  "video": null,
  "badge": "Jugable",
  "jugar": "arena",
  "links": []
 },
 {
  "nombre": "2048",
  "sub": "Juntá los números",
  "cats": [
   "game"
  ],
  "destacado": false,
  "desc": "Deslizá las fichas: las iguales se juntan y se suman hasta llegar a 2048.",
  "items": [
   "Fichas que cambian de color y brillan a medida que crecen.",
   "Deshacer la última jugada y seguir jugando después de ganar.",
   "Flechas, WASD o deslizando el dedo en el celular."
  ],
  "tech": [
   "JavaScript",
   "HTML",
   "CSS"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/juego-2048.jpg",
  "video": null,
  "badge": "Jugable",
  "jugar": "2048",
  "links": []
 },
 {
  "nombre": "Sudoku",
  "sub": "",
  "cats": [
   "game"
  ],
  "destacado": false,
  "desc": "Cada partida genera un tablero nuevo con una sola solución posible, en tres dificultades.",
  "items": [
   "Resalta fila, columna, cuadro y números iguales.",
   "Modo notas, 3 pistas y hasta 3 errores por partida.",
   "Récord de tiempo por dificultad y la partida queda guardada."
  ],
  "tech": [
   "JavaScript",
   "HTML",
   "CSS"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/juego-sudoku.jpg",
  "video": null,
  "badge": "Jugable",
  "jugar": "sudoku",
  "links": []
 },
 {
  "nombre": "Buscaminas",
  "sub": "",
  "cats": [
   "game"
  ],
  "destacado": false,
  "desc": "El clásico de las minas, con el primer toque siempre seguro y tres tamaños de tablero.",
  "items": [
   "Banderas con clic derecho, manteniendo apretado o con el botón 🚩.",
   "Tocar un número con sus banderas destapa lo que queda alrededor.",
   "Récord de tiempo por dificultad."
  ],
  "tech": [
   "JavaScript",
   "HTML",
   "CSS"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/juego-buscaminas.jpg",
  "video": null,
  "badge": "Jugable",
  "jugar": "buscaminas",
  "links": []
 },
 {
  "nombre": "Friday",
  "sub": "Nueva interfaz",
  "cats": [
   "web"
  ],
  "destacado": true,
  "desc": "Otra versión de Jarvis con una interfaz más elegante: el mismo cerebro y los mismos flujos, con un chat rediseñado en bordó, letras serif y una experiencia más cuidada.",
  "items": [
   "Tipografía elegante (Cormorant Garamond + Jost) y paleta en bordó.",
   "La opción elegida queda marcada en la charla y las demás se atenúan.",
   "Indicador de \"escribiendo\", animaciones suaves y versión para celular.",
   "Convive con Jarvis en la misma página sin pisarse."
  ],
  "tech": [
   "JavaScript",
   "CSS",
   "Node.js",
   "Cloudflare Workers",
   "Diseño UI"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/charlie-bordo.jpg",
  "video": null,
  "badge": "Nuevo",
  "jugar": null,
  "links": [
   {
    "url": "https://friday.cristiansabella57.workers.dev/demo",
    "txt": "Ver demo"
   }
  ]
 },
 {
  "nombre": "Jarvis",
  "sub": "Chatbot multicanal",
  "cats": [
   "web"
  ],
  "destacado": true,
  "desc": "Mi asistente virtual: atiende a los visitantes, muestra mis servicios y arma pedidos de cotización. Un solo \"cerebro\" sirve para la web, WhatsApp y apps.",
  "items": [
   "Motor de conversaciones propio: los flujos se editan en JSON, sin tocar código.",
   "Entiende botones, números o texto libre, y tiene \"volver al menú anterior\" en cada paso.",
   "Burbuja de chat que se agrega a cualquier web con una sola línea.",
   "API REST en Node.js, lista para sumar WhatsApp Cloud API."
  ],
  "tech": [
   "Node.js",
   "JavaScript",
   "API REST",
   "JSON",
   "Cloudflare Workers"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/charlie.jpg",
  "video": null,
  "badge": "En línea",
  "jugar": null,
  "links": []
 },
 {
  "nombre": "Sistema de Comunicación Servidor / Cliente",
  "sub": "",
  "cats": [
   "desk",
   "db"
  ],
  "destacado": false,
  "desc": "Sistema de comunicación empresarial con llamadas, mensajes, juegos y archivos.",
  "items": [],
  "tech": [
   "C#",
   "Sockets"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/equipo.jpg",
  "video": null,
  "badge": "",
  "jugar": null,
  "links": [
   {
    "url": "https://github.com/CristianSabella/ProgramadeGestiondeServidorycliente",
    "txt": "Repositorio"
   }
  ]
 },
 {
  "nombre": "Sistema de Gestión",
  "sub": "Maquinarias Miguel",
  "cats": [
   "web",
   "db"
  ],
  "destacado": false,
  "desc": "Sistema web en GeneXus y SQL Server para gestionar clientes, reparaciones, proveedores, repuestos, pagos, marcas, stock, listados y notificaciones, con transacciones, reglas, eventos, procedimientos y validaciones complejas.",
  "items": [],
  "tech": [
   "GeneXus 17/18",
   "SQL Server"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/genexus1.jpg",
  "video": null,
  "badge": "",
  "jugar": null,
  "links": [
   {
    "url": "https://github.com/CristianSabella/M-quinas-de-cocer-en-Genexus",
    "txt": "Repositorio"
   }
  ]
 },
 {
  "nombre": "Sistema de Gestión Escolar",
  "sub": "",
  "cats": [
   "desk",
   "db"
  ],
  "destacado": false,
  "desc": "Aplicación en C# y SQL Server: ABM de alumnos y asignaturas, carga de notas, listados e informes con promedios y valores mínimo/máximo.",
  "items": [],
  "tech": [
   "C#",
   "SQL Server"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/fotoSistemaEscolar.jpg",
  "video": null,
  "badge": "",
  "jugar": null,
  "links": [
   {
    "url": "https://github.com/CristianSabella/SistemaEscuela",
    "txt": "Repositorio"
   }
  ]
 },
 {
  "nombre": "Servidor y Cliente MMORPG",
  "sub": "",
  "cats": [
   "game",
   "desk",
   "db"
  ],
  "destacado": false,
  "desc": "Compilación desde código fuente de servidor y cliente, adaptación de la conexión a SQL Server, configuración de sockets TCP, dependencias OCX y depuración del protocolo cliente-servidor.",
  "items": [],
  "tech": [
   "Visual Basic 6",
   "SQL Server",
   "TCP"
  ],
  "img": null,
  "video": null,
  "badge": "",
  "jugar": null,
  "links": []
 },
 {
  "nombre": "Simulador de Cajero Automático",
  "sub": "",
  "cats": [
   "desk"
  ],
  "destacado": false,
  "desc": "Aplicación de consola con consulta de saldo, depósitos, retiros con validaciones y registro de movimientos.",
  "items": [],
  "tech": [
   "C#"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/cajero.jpg",
  "video": null,
  "badge": "",
  "jugar": null,
  "links": [
   {
    "url": "https://github.com/CristianSabella/Cajero-Autom-tico-simple-",
    "txt": "Repositorio"
   }
  ]
 },
 {
  "nombre": "Sistema de gestión GeneXus",
  "sub": "",
  "cats": [
   "web",
   "db"
  ],
  "destacado": false,
  "desc": "Gestión de alumnos, asignaturas y calificaciones desarrollada en GeneXus, usando transacciones, atributos, reglas y work panels.",
  "items": [],
  "tech": [
   "GeneXus"
  ],
  "img": null,
  "video": null,
  "badge": "",
  "jugar": null,
  "links": [
   {
    "url": "https://github.com/CristianSabella/M-quinas-de-cocer-en-Genexus",
    "txt": "Repositorio"
   }
  ]
 },
 {
  "nombre": "Mini e-commerce educativo",
  "sub": "",
  "cats": [
   "web"
  ],
  "destacado": false,
  "desc": "Registro de usuarios, catálogo de productos e integración con base de datos.",
  "items": [],
  "tech": [
   "HTML",
   "CSS"
  ],
  "img": null,
  "video": null,
  "badge": "",
  "jugar": null,
  "links": []
 },
 {
  "nombre": "Portfolio clásico",
  "sub": "",
  "cats": [
   "web"
  ],
  "destacado": false,
  "desc": "Sitio personal responsive con animaciones, filtros de proyectos y fondo de código binario animado en canvas.",
  "items": [],
  "tech": [
   "HTML",
   "CSS",
   "JavaScript"
  ],
  "img": "https://cristiansabella.github.io/SabellaCristian/img/portfolio.jpg",
  "video": null,
  "badge": "",
  "jugar": null,
  "links": [
   {
    "url": "https://github.com/CristianSabella/SabellaCristian",
    "txt": "Repositorio"
   }
  ]
 }
];

export const SITIO_VIEJO = 'https://cristiansabella.github.io/SabellaCristian/';

export const PERFIL = {
  nombre: 'Cristian Sabella',
  rol: 'Desarrollador de Software',
  ciudad: 'Rosario, Argentina',
  foto: 'img/yo.jpg',
  texto: 'Me gusta construir soluciones eficientes y aprender nuevas tecnologías. Trabajo tanto en backend y bases de datos como en interfaces web y móviles, y tengo conocimientos en testing y seguridad.',
  datos: [['10+', 'Proyectos realizados'], ['8,44', 'Promedio de egreso'], ['20+', 'Tecnologías'], ['2', 'Apps desplegadas en la nube']],
  formacion: [
    { cuando: 'En curso', titulo: 'Licenciatura en Gestión de la Tecnología Informática', lugar: 'UAI – Universidad Abierta Interamericana, Rosario · Estudiante avanzado' },
    { cuando: 'Ene. 2023 – Nov. 2025', titulo: 'Técnico Superior en Desarrollo de Software', lugar: 'Instituto Superior Particular Incorporado N.º 4041 "Rosario" · Promedio 8,44' }
  ],
  stack: {
    'Lenguajes': ['C#', 'Java', 'JavaScript', 'Dart', 'Python', 'Lua', 'Visual Basic 6', 'HTML', 'CSS', 'SQL / T-SQL'],
    'Frameworks': ['.NET / ASP.NET Core', 'Entity Framework Core', 'Windows Forms', 'Flutter', 'React Native / Expo', 'Node.js / Express', 'MonoGame', 'GeneXus'],
    'Bases de datos': ['SQL Server', 'PostgreSQL', 'Modelado relacional', 'Stored Procedures', 'Triggers', 'Vistas', 'Índices', 'Migraciones'],
    'Herramientas': ['Git / GitHub', 'GitHub Pages', 'Docker', 'Railway', 'API REST', 'Autenticación / BCrypt', 'Sockets TCP', 'Visual Studio', 'VS Code', 'Testing', 'Seguridad', 'Agile']
  },
  emails: ['cristiansabella57@gmail.com', 'cristian-m.sabella@hotmail.com'],
  whatsapp: 'https://wa.me/5493413124748',
  linkedin: 'https://www.linkedin.com/in/cristian-sabella-a872182b6/',
  github: 'https://github.com/CristianSabella',
  cv: 'https://drive.google.com/file/d/1kAd10JPPZiVyh9mzKwvqv58Tc8rIU21X/view?usp=drive_link',
  cvVista: 'https://drive.google.com/file/d/1kAd10JPPZiVyh9mzKwvqv58Tc8rIU21X/preview'
};

export const CANCIONES = [
  { titulo: 'Myself', artista: 'NEFFEX', src: 'https://cristiansabella.github.io/SabellaCristian/NEFFEX_Myself.mp3' },
  { titulo: "Tell Me That I Can't", artista: 'NEFFEX', src: 'https://cristiansabella.github.io/SabellaCristian/NEFFEX_Tell_Me_That_I_Cant.mp3' },
  { titulo: "How's It Supposed To Feel", artista: 'NEFFEX', src: 'https://cristiansabella.github.io/SabellaCristian/NEFFEX_Hows_It_Supposed_To_Feel.mp3' }
];
