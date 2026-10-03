
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

// "addEventListener" = "escuchá este evento y ejecutá esta función
// cuando pase". Acá escuchamos el click en el botón hamburguesa.
navToggle.addEventListener("click", () => {
  // toggle agrega la clase "open" si no está, o la saca si ya está.
  // Es lo que hace que el menú se abra y se cierre con el mismo botón.
  navMenu.classList.toggle("open");

  // Esto es solo para accesibilidad: le dice a lectores de pantalla
  // si el menú está abierto o cerrado.
  const isOpen = navMenu.classList.contains("open");
  navToggle.setAttribute("aria-expanded", isOpen);
});

// Cuando el usuario toca un link del menú (en celular), lo cerramos
// automáticamente para que no quede tapando la pantalla.
document.querySelectorAll(".navbar__menu a").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
  });
});

/*Fuentes de datos (Google Sheets)*/
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSLj-lJamDKc9Y7bWZbDJUz5zThrZ-oadBfnZCPgYmOee7pX9W16iybjY2v4xCxUn1kmn5jGR0jmlJs/pub?gid=0&single=true&output=csv";
const SHEET_EQUIPOS_CSV_URL ="https://docs.google.com/spreadsheets/d/e/2PACX-1vSLj-lJamDKc9Y7bWZbDJUz5zThrZ-oadBfnZCPgYmOee7pX9W16iybjY2v4xCxUn1kmn5jGR0jmlJs/pub?gid=53800298&single=true&output=csv"

// Guardamos todos los partidos una vez cargados, para no tener que
// volver a pedirlos cada vez que cambia el filtro de categoría
let todosLosPartidos = [];

// Esta funcion arma un diccionario con los logos de cada equipo
let logosEquipos = {}; 
let linksEquipos = {};

function parsearCSV(texto) {
  const filas = texto.trim().split("\n");
  const encabezados = parsearFila(filas[0]).map(h => h.trim());

  const datos = filas.slice(1).map(fila => {
    const valores = parsearFila(fila);
    const partido = {};
    encabezados.forEach((encabezado, i) => {
      partido[encabezado] = valores[i] ? valores[i].trim() : "";
    });
    return partido;
  });

  return datos;
}

// Corta una fila en sus valores, respetando las comas que
// están "protegidas" dentro de comillas dobles.
function parsearFila(fila) {
  const valores = [];
  let actual = "";
  let dentroDeComillas = false;

  for (let i = 0; i < fila.length; i++) {
    const char = fila[i];

    if (char === '"') {
      dentroDeComillas = !dentroDeComillas; // entra o sale de una zona "protegida"
    } else if (char === "," && !dentroDeComillas) {
      valores.push(actual); // encontramos una coma REAL de separación
      actual = "";
    } else {
      actual += char; // cualquier otro carácter, se suma al valor actual
    }
  }

  valores.push(actual); // no te olvides del último valor, después de la última coma
  return valores;
}

function iniciales(nombreEquipo) { // devuelve las iniciales de un equipo
  return nombreEquipo
  .split(" ")
  .map(palabra => palabra[0])
  .join("")
  .toUpperCase()
  .slice(0, 2);
}

// Devuelve el logo del equipo si existe, o el círculo con iniciales si no
function renderBadge(nombre) {
  const logo = logosEquipos[nombre];
  return logo
    ? `<img src="${logo}" alt="${nombre}" class="match-card__badge" style="object-fit: contain; background: var(--color-bg-dark);" onerror="this.outerHTML='<span class=&quot;match-card__badge&quot;>${iniciales(nombre)}</span>'" />`
    : `<span class="match-card__badge">${iniciales(nombre)}</span>`;
}

async function cargarLogosEquipos() {
  try {
    const response = await fetch(SHEET_EQUIPOS_CSV_URL);
    const csvText = await response.text();
    const filas = parsearCSV(csvText);

    filas.forEach(fila => {
      if (fila.nombre_equipo && fila.logo_url) {
       logosEquipos[fila.nombre_equipo.trim()] = armarLinkImagenDrive(fila.logo_url.trim());
      }
      if (fila.nombre_equipo && fila.link_equipo) {
        linksEquipos[fila.nombre_equipo.trim()] = fila.link_equipo.trim();
      }
      
    });
    
  } catch (error) {
    console.error("No se pudieron cargar los logos:", error);
    // Si falla, logosEquipos queda vacío y todo sigue funcionando con iniciales
  }

}

// Extrae el ID de un link de Google Drive, sin importar el formato exacto
// que tenga (uc?export=view&id=..., /file/d/.../view, etc.)
function extraerIdDrive(url) {
  const match = url.match(/[-\w]{25,}/); // busca una cadena larga de letras/números/guiones
  return match ? match[0] : null;
}

function armarLinkImagenDrive(url) {
  const id = extraerIdDrive(url);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w200` : url;
}

function crearEquipoVacio(nombre) {
  return { nombre, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
}

function calcularTabla(partidos, categoria) {
  // Solo partidos finalizados de la categoría elegida
  const finalizados = partidos.filter(
    p => p.estado === "Final" && p.categoria === categoria
  );

  const tabla = {}; // objeto tipo diccionario: { "Nombre equipo": {...stats} }

  finalizados.forEach(partido => {
    const local = partido.equipo_local;
    const visitante = partido.equipo_visitante;
    const golesLocal = parseInt(partido.goles_local) || 0;
    const golesVisitante = parseInt(partido.goles_visitante) || 0;

    // Si el equipo todavía no está en la tabla, lo creamos
    if (!tabla[local]) tabla[local] = crearEquipoVacio(local);
    if (!tabla[visitante]) tabla[visitante] = crearEquipoVacio(visitante);

    tabla[local].pj++;
    tabla[visitante].pj++;
    tabla[local].gf += golesLocal;
    tabla[local].gc += golesVisitante;
    tabla[visitante].gf += golesVisitante;
    tabla[visitante].gc += golesLocal;

    if (golesLocal > golesVisitante) {
      tabla[local].g++;
      tabla[local].pts += 3;
      tabla[visitante].p++;
    } else if (golesLocal < golesVisitante) {
      tabla[visitante].g++;
      tabla[visitante].pts += 3;
      tabla[local].p++;
    } else {
      tabla[local].e++;
      tabla[visitante].e++;
      tabla[local].pts += 1;
      tabla[visitante].pts += 1;
    }
  });

  const equipos = Object.values(tabla);
  equipos.forEach(e => (e.dg = e.gf - e.gc));

  // Orden: más puntos primero; si empatan, mejor diferencia de gol; si siguen empatados, más goles a favor
  equipos.sort((a, b) => b.pts - a.pts || b.dg - a.dg || b.gf - a.gf);

  return equipos;
}

async function cargarPartidos() { // Esta funcion trae los datos de la dirección de internet. 
  const response = await fetch(SHEET_CSV_URL); // fetch te devuelve la promesa de que el dato va a llegar
  const csvText= await response.text();
  const partidos = parsearCSV(csvText);
  await cargarLogosEquipos();
  todosLosPartidos = partidos; // guardo los partidos en una variable global para poder filtrar después
  // Solo intenta mostrar en Cronograma si ese contenedor existe en esta página
  if (document.getElementById("matchesContainer")) {
  aplicarFiltrosCronograma();
}

  // Solo intenta mostrar en la portada si ese contenedor existe en esta página
  if (document.getElementById("resultsGrid")) {
    mostrarResultadosHome(partidos);
  }

  if (document.getElementById("upcomingGrid")) {
    mostrarProximosHome(partidos);
  }

  if (document.getElementById("standingsBody")) {
    const categoriaActiva = document
      .querySelector("#categoryFilters .filter-chip--active")
      ?.dataset.category || "Sub 14";
    mostrarPosiciones(calcularTabla(partidos, categoriaActiva));
  }

  if (document.getElementById("teamsGrid")) {
  todosLosEquipos = calcularTodosLosEquipos(partidos);
  aplicarFiltrosEquipos();
  }
  if (document.getElementById("favoriteTeamVote")) {
  mostrarVotacionEquipoFavorito(partidos);
  }
  if (document.getElementById("fanIdentify")) {
  mostrarIdentificacion();
  }
  if (document.getElementById("predictionsList")) {
  mostrarPredicciones(partidos);
}
}