
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

const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSLj-lJamDKc9Y7bWZbDJUz5zThrZ-oadBfnZCPgYmOee7pX9W16iybjY2v4xCxUn1kmn5jGR0jmlJs/pub?gid=0&single=true&output=csv";
const SHEET_EQUIPOS_CSV_URL ="https://docs.google.com/spreadsheets/d/e/2PACX-1vSLj-lJamDKc9Y7bWZbDJUz5zThrZ-oadBfnZCPgYmOee7pX9W16iybjY2v4xCxUn1kmn5jGR0jmlJs/pub?gid=53800298&single=true&output=csv"

async function cargarPartidos() { // Esta funcion trae los datos de la dirección de internet. 
  const response = await fetch(SHEET_CSV_URL); // fetch te devuelve la promesa de que el dato va a llegar
  const csvText= await response.text();
  const partidos = parsearCSV(csvText);

  todosLosPartidos = partidos; // guardo los partidos en una variable global para poder filtrar después
  // Solo intenta mostrar en Cronograma si ese contenedor existe en esta página
  if (document.getElementById("matchesList")) {
  aplicarFiltrosCronograma();
}

  // Solo intenta mostrar en la portada si ese contenedor existe en esta página
  if (document.getElementById("resultsGrid")) {
    mostrarResultadosHome(partidos);
  }

  if (document.getElementById("standingsBody")) {
    const categoriaActiva = document
      .querySelector("#categoryFilters .filter-chip--active")
      ?.dataset.category || "Sub 14";
    mostrarPosiciones(calcularTabla(partidos, categoriaActiva));
  }

  if (document.getElementById("teamsGrid")) {
  await cargarLogosEquipos();
  todosLosEquipos = calcularTodosLosEquipos(partidos);
  aplicarFiltrosEquipos();
}
}



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

function mostrarPartidos(partidos) {
  const contenedor = document.getElementById("matchesList");
  contenedor.innerHTML = "";
  partidos.forEach(partido => {
    const tarjeta = document.createElement("li");
    tarjeta.className = "match-card";
    tarjeta.innerHTML = `
      <div class="match-card__meta">
        <span class="match-card__status">${partido.estado}</span>
        <span class="match-card__category">${partido.categoria}</span>
      </div>
      <div class="match-card__team">
        <span class="match-card__team-name">${partido.equipo_local}</span>
        <span class = "match-card__badge">${iniciales(partido.equipo_local)}</span>
      </div>
      <div class="match-card__score">
        <span> ${partido.goles_local}</span>
        <span class= "match-card__score-sep">-</span>
        <span> ${partido.goles_visitante}</span>
      </div>
      <div class="match-card__team match-card__team--away">
        <span class="match-card__badge">${iniciales(partido.equipo_visitante)}</span>
        <span class = "match-card__team-name">${partido.equipo_visitante}</span>
      </div>
      <div class= "match-card__info">
      <span><i class="fa-solid fa-location-dot"></i> ${partido.cancha}</span>
      <span class="match-card__info-row"><i class="fa-solid fa-clock"></i> Horario: ${partido.veedor || "-"}</span>
      </div>
    `;
    contenedor.appendChild(tarjeta);
  });
}

function mostrarResultadosHome(partidos) {
  const contenedor = document.getElementById("resultsGrid");
  contenedor.innerHTML = "";

  const finalizados = partidos.filter(partido => partido.estado === "Final");
  const ultimosTres = finalizados.slice(0, 3);

  ultimosTres.forEach(partido => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "result-card";
    tarjeta.innerHTML = `
      <div class="result-card__meta">
        <span class="result-card__status">${partido.estado}</span>
        <span class="result-card__info">${partido.categoria} · ${partido.fecha}</span>
      </div>
      <div class="result-card__match">
        <div class="result-card__team">
          <span class="match-card__badge">${iniciales(partido.equipo_local)}</span>
        </div>
        <span class="result-card__score">${partido.goles_local} — ${partido.goles_visitante}</span>
        <div class="result-card__team">
          <span class="match-card__badge">${iniciales(partido.equipo_visitante)}</span>
        </div>
      </div>
    `;
    contenedor.appendChild(tarjeta);
  });
}

// Guardamos todos los partidos una vez cargados, para no tener que
// volver a pedirlos cada vez que cambia el filtro de categoría
let todosLosPartidos = [];

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

function mostrarPosiciones(equipos) {
  const tbody = document.getElementById("standingsBody");
  const contador = document.getElementById("teamsCount");

  contador.textContent = `${equipos.length} equipo${equipos.length === 1 ? "" : "s"}`;
  tbody.innerHTML = "";

  if (equipos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; color: var(--color-cream-muted); padding: 30px;">Todavía no hay partidos finalizados en esta categoría</td></tr>`;
    return;
  }

  equipos.forEach((equipo, index) => {
    const puesto = index + 1;
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td><span class="rank-badge ${puesto === 1 ? "rank-badge--leader" : ""}">${puesto}</span></td>
      <td>${equipo.nombre}</td>
      <td>${equipo.pj}</td>
      <td>${equipo.g}</td>
      <td>${equipo.e}</td>
      <td>${equipo.p}</td>
      <td>${equipo.gf}</td>
      <td>${equipo.gc}</td>
      <td class="${equipo.dg > 0 ? "dg-positivo" : equipo.dg < 0 ? "dg-negativo" : ""}">${equipo.dg > 0 ? "+" : ""}${equipo.dg}</td>
      <td>${equipo.pts}</td>
    `;
    tbody.appendChild(fila);
  });
}

const categoryFilters = document.getElementById("categoryFilters");
if (categoryFilters) {
  categoryFilters.addEventListener("click", (e) => {
    const boton = e.target.closest(".filter-chip");
    if (!boton) return;

    categoryFilters
      .querySelectorAll(".filter-chip")
      .forEach(chip => chip.classList.remove("filter-chip--active"));
    boton.classList.add("filter-chip--active");

    mostrarPosiciones(calcularTabla(todosLosPartidos, boton.dataset.category));
  });
}

// Pagina de equipos
// Esta funcion arma un diccionario con los logos de cada equipo
let logosEquipos = {}; 

async function cargarLogosEquipos() {
  try {
    const response = await fetch(SHEET_EQUIPOS_CSV_URL);
    const csvText = await response.text();
    const filas = parsearCSV(csvText);

    filas.forEach(fila => {
      if (fila.nombre_equipo && fila.logo_url) {
       logosEquipos[fila.nombre_equipo.trim()] = armarLinkImagenDrive(fila.logo_url.trim());
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

/*Pagina de equipos*/
 let todosLosEquipos = [];
 let categoriaEquipoActiva = "Todos";
 let busquedaEquipo = "";
 function calcularTodosLosEquipos(partidos) {
  const categorias = [...new Set(partidos.map(p => p.categoria))];
  let todos = [];
  categorias.forEach(categoria => {
    const tabla = calcularTabla(partidos, categoria);
    tabla.forEach(equipo => (equipo.categoria = categoria));
    todos = todos.concat(tabla);
  });
  return todos;
}

function mostrarEquipos(equipos) {
  const contenedor = document.getElementById("teamsGrid");
  const subtitulo = document.getElementById("teamsSubtitle");
  subtitulo.textContent = `${equipos.length} equipo${equipos.length === 1 ? "" : "s"} · Temporada 2026`;
  contenedor.innerHTML = "";

  if (equipos.length === 0) {
    contenedor.innerHTML = `<p style="color: var(--color-cream-muted); grid-column: 1;text-align: center; padding: 40px 0;">No se encontraron equipos</p>`;
    return;
  }

  equipos.forEach(equipo => {
    const logo = logosEquipos[equipo.nombre];
    const tarjeta = document.createElement("div");
    tarjeta.className = "team-card";
    tarjeta.innerHTML = `
      ${logo
  ? `<img src="${logo}" alt="${equipo.nombre}" class="team-card__badge" style="object-fit: contain; background: var(--color-bg-dark);" onerror="this.outerHTML='<div class=&quot;team-card__badge&quot;>${iniciales(equipo.nombre)}</div>'" />`
  : `<div class="team-card__badge">${iniciales(equipo.nombre)}</div>`
      }
      <div class="team-card__name">${equipo.nombre}</div>
      <div class="team-card__category">${equipo.categoria}</div>
      <div class="team-card__stats">
        <span class="team-card__pj">${equipo.pj} PJ</span>
        <span class="team-card__pts">${equipo.pts} pts</span>
      </div>
    `;
    contenedor.appendChild(tarjeta);
  });
}

// Aplica los dos filtros (categoría + búsqueda por texto) juntos
function aplicarFiltrosEquipos() {
  const filtrados = todosLosEquipos.filter(equipo => {
    const coincideCategoria =
      categoriaEquipoActiva === "Todos" || equipo.categoria === categoriaEquipoActiva;
    const coincideBusqueda = equipo.nombre
      .toLowerCase()
      .includes(busquedaEquipo.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  mostrarEquipos(filtrados);
}

const teamCategoryFilters = document.getElementById("teamCategoryFilters");
if (teamCategoryFilters) {
  teamCategoryFilters.addEventListener("click", (e) => {
    const boton = e.target.closest(".filter-chip");
    if (!boton) return;

    teamCategoryFilters
      .querySelectorAll(".filter-chip")
      .forEach(chip => chip.classList.remove("filter-chip--active"));
    boton.classList.add("filter-chip--active");

    categoriaEquipoActiva = boton.dataset.category;
    aplicarFiltrosEquipos();
  });
}

const teamSearch = document.getElementById("teamSearch");
if (teamSearch) {
  teamSearch.addEventListener("input", (e) => {
    busquedaEquipo = e.target.value;
    aplicarFiltrosEquipos();
  });
}

/*Filtros de cronograma*/
let estadoCronogramaActivo = "todos";
let categoriaCronogramaActiva = "Todas";

function aplicarFiltrosCronograma() {
  const filtrados = todosLosPartidos.filter(partido => {
    const coincideEstado =
      estadoCronogramaActivo === "todos" ||
      (estadoCronogramaActivo === "proximos" && partido.estado === "Próximo") ||
      (estadoCronogramaActivo === "finalizados" && partido.estado === "Final");

    const coincideCategoria =
      categoriaCronogramaActiva === "Todas" || partido.categoria === categoriaCronogramaActiva;

    return coincideEstado && coincideCategoria;
  });

  mostrarPartidos(filtrados);
}

const statusFilters = document.getElementById("statusFilters");
if (statusFilters) {
  statusFilters.addEventListener("click", (e) => {
    const boton = e.target.closest(".filter-chip");
    if (!boton) return;

    statusFilters.querySelectorAll(".filter-chip").forEach(chip => chip.classList.remove("filter-chip--active"));
    boton.classList.add("filter-chip--active");

    estadoCronogramaActivo = boton.dataset.filter;
    aplicarFiltrosCronograma();
  });
}

const cronogramaCategoryFilters = document.getElementById("cronogramaCategoryFilters");
if (cronogramaCategoryFilters) {
  cronogramaCategoryFilters.addEventListener("click", (e) => {
    const boton = e.target.closest(".filter-chip");
    if (!boton) return;

    cronogramaCategoryFilters.querySelectorAll(".filter-chip").forEach(chip => chip.classList.remove("filter-chip--active"));
    boton.classList.add("filter-chip--active");

    categoriaCronogramaActiva = boton.dataset.category;
    aplicarFiltrosCronograma();
  });
}

cargarPartidos();

