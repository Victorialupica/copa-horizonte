/*Votacion equipo favorito*/ 
function obtenerListaEquipos(partidos) {
  const nombres = partidos.flatMap(p => [p.equipo_local, p.equipo_visitante]);
  return [...new Set(nombres)].filter(Boolean).sort();
}

function obtenerVotos() {
  const guardado = localStorage.getItem("votosEquipoFavorito");
  return guardado ? JSON.parse(guardado) : {};
}

function guardarVoto(equipo) {
  if (!nombreFanatico()) {
    alert("Por favor, identificate primero para poder votar.");
    return;
  }
  const votos = obtenerVotos();
  votos[equipo] = (votos[equipo] || 0) + 1;
  localStorage.setItem("votosEquipoFavorito", JSON.stringify(votos));
  localStorage.setItem("miVotoEquipoFavorito", equipo);
}

function miVotoActual() {
  return localStorage.getItem("miVotoEquipoFavorito");
}

function mostrarVotacionEquipoFavorito(partidos) {
  const contenedor = document.getElementById("favoriteTeamVote");
  const equipos = obtenerListaEquipos(partidos);
  const votos = obtenerVotos();
  const totalVotos = Object.values(votos).reduce((suma, n) => suma + n, 0);
  const votoActual = miVotoActual();

  const barras = equipos.map(equipo => {
    const cantidad = votos[equipo] || 0;
    const porcentaje = totalVotos > 0 ? Math.round((cantidad / totalVotos) * 100) : 0;
    return `
      <div class="vote-bar-row">
        <div class="vote-bar-row__top">
          <span>${equipo}</span>
          <span>${porcentaje}% · ${cantidad} voto${cantidad === 1 ? "" : "s"}</span>
        </div>
        <div class="vote-bar-track">
          <div class="vote-bar-fill" style="width: ${porcentaje}%"></div>
        </div>
      </div>
    `;
  }).join("");

  const botones = equipos.map(equipo => `
    <button
      class="filter-chip ${equipo === votoActual ? "filter-chip--active" : ""}"
      data-equipo="${equipo}"
    >${equipo}</button>
  `).join("");

  contenedor.innerHTML = `
    ${barras}
    <div class="vote-buttons">${botones}</div>
    ${votoActual ? `<p class="vote-confirmation">✓ Ya votaste por ${votoActual}</p>` : ""}
  `;

  contenedor.querySelectorAll(".vote-buttons .filter-chip").forEach(boton => {
    boton.addEventListener("click", () => {
      guardarVoto(boton.dataset.equipo);
      mostrarVotacionEquipoFavorito(partidos); // volvemos a dibujar todo, con el voto ya contado
    });
  });
}

/*Identificación de fanáticos*/
function nombreFanatico() {
  return localStorage.getItem("nombreFanatico");
}

function guardarNombreFanatico(nombre) {
  localStorage.setItem("nombreFanatico", nombre);
}

function borrarNombreFanatico() {
  localStorage.removeItem("nombreFanatico");
}

function mostrarIdentificacion() {
  const contenedor = document.getElementById("fanIdentify");
  const nombre = nombreFanatico();

  if (nombre) {
    // Ya se identificó: mostramos el saludo
    contenedor.innerHTML = `
      <div class="identify-greeting">
        <span>👋 Hola, <strong>${nombre}</strong></span>
        <button id="cambiarNombreBtn">No soy ${nombre}</button>
      </div>
    `;
    document.getElementById("cambiarNombreBtn").addEventListener("click", () => {
      borrarNombreFanatico();
      mostrarIdentificacion();
    });
  } else {
    // Todavía no se identificó: mostramos el formulario
    contenedor.innerHTML = `
      <div class="identify-card">
        <p>Identificate para poder votar</p>
        <input type="text" id="nombreInput" class="identify-input" placeholder="Tu nombre" />
        <button class="btn btn--primary" id="guardarNombreBtn">Continuar</button>
      </div>
    `;
    document.getElementById("guardarNombreBtn").addEventListener("click", () => {
      const input = document.getElementById("nombreInput");
      const valor = input.value.trim();
      if (valor === "") {
        input.focus();
        return;
      }
      guardarNombreFanatico(valor);
      mostrarIdentificacion();
    });
  }
}

cargarPartidos();
