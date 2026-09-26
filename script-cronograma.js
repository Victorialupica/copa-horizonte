function mostrarPartidos(partidos) {
  const contenedor = document.getElementById("matchesContainer");
  contenedor.innerHTML = "";

  if (partidos.length === 0) {
    contenedor.innerHTML = `<p style="text-align:center; color: var(--color-cream-muted); padding: 40px 0;">No hay partidos para este filtro</p>`;
    return;
  }

  // Agrupamos los partidos por su fecha
  const grupos = {};
  const ordenDeFechas = [];

  partidos.forEach(partido => {
    const fecha = partido.fecha;
    if (!grupos[fecha]) {
      grupos[fecha] = [];
      ordenDeFechas.push(fecha); // guardamos el orden de aparición de cada fecha
    }
    grupos[fecha].push(partido);
  });

  // Por cada fecha distinta, armamos su propio bloque con su propia lista
  ordenDeFechas.forEach(fecha => {
    const bloque = document.createElement("div");
    bloque.className = "match-day";
    bloque.innerHTML = `<p class="match-day__date">${fecha}</p>`;

    const lista = document.createElement("ul");
    lista.className = "matches-list";

    grupos[fecha].forEach(partido => {
      const tarjeta = document.createElement("li");
      tarjeta.className = "match-card";
      tarjeta.innerHTML = `
        <div class="match-card__meta">
          <span class="match-card__status">${partido.estado}</span>
          <span class="match-card__category">${partido.categoria}</span>
        </div>
        <div class="match-card__team">
          <span class="match-card__team-name">${partido.equipo_local}</span>
          <span class="match-card__badge">${iniciales(partido.equipo_local)}</span>
        </div>
        <div class="match-card__score">
          <span>${partido.goles_local}</span>
          <span class="match-card__score-sep">-</span>
          <span>${partido.goles_visitante}</span>
        </div>
        <div class="match-card__team match-card__team--away">
          <span class="match-card__badge">${iniciales(partido.equipo_visitante)}</span>
          <span class="match-card__team-name">${partido.equipo_visitante}</span>
        </div>
        <div class="match-card__info">
          <span><i class="fa-solid fa-location-dot"></i> ${partido.cancha}</span>
          <span class="match-card__info-row"><i class="fa-solid fa-clock"></i> Horario: ${partido.horario || "-"}</span>
        </div>
      `;
      lista.appendChild(tarjeta);
    });

    bloque.appendChild(lista);
    contenedor.appendChild(bloque);
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