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
    const link = linksEquipos[equipo.nombre];
    const tarjeta = document.createElement("a");
    tarjeta.className = "team-card";
    if (link) {
      tarjeta.href = link;
      tarjeta.target = "_blank";
      tarjeta.rel = "noopener";
    }
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

cargarPartidos();