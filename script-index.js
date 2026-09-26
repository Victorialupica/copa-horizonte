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
          ${renderBadge(partido.equipo_local)}
        </div>
        <span class="result-card__score">${partido.goles_local} — ${partido.goles_visitante}</span>
        <div class="result-card__team">
          ${renderBadge(partido.equipo_visitante)}
      </div>
    `;
    contenedor.appendChild(tarjeta);
  });
}

function mostrarProximosHome(partidos) {
  const contenedor = document.getElementById("upcomingGrid");
  contenedor.innerHTML = "";

  const proximos = partidos.filter(partido => partido.estado === "Próximo");
  const proximosTres = proximos.slice(0, 3); // mostramos solo los 3 más cercanos

  if (proximosTres.length === 0) {
    contenedor.innerHTML = `
      <div class="empty-state">
        <i class="fa-regular fa-calendar"></i>
        <p>No hay partidos programados proximamente.</p>
      </div>
    `;
    return;
  }

  proximosTres.forEach(partido => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "result-card";
    tarjeta.innerHTML = `
      <div class="result-card__meta">
      <span class="result-card__status">${partido.estado}</span>
      <span class="result-card__info">${partido.categoria} · ${partido.fecha}</span>
      </div>
      <div class="result-card__match">
      <div class="result-card__team">
      ${renderBadge(partido.equipo_local)}
      </div>
      <span class="result-card__score">vs</span>
      <div class="result-card__team">
      ${renderBadge(partido.equipo_visitante)}
      </div>
      </div>
    `;
    contenedor.appendChild(tarjeta);
  });
}

cargarPartidos();