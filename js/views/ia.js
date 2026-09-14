// Vista Administrador: asistente RAG. Requiere sector + empresa + año antes de
// consultar (RF-037 / RN-038). Responde sólo con base en el corpus (RN-021),
// cita documento/empresa/año (RF-031) y sólo sobre el dominio (RN-037).
Views.ia = {
  html() {
    const empresas = Domain.empresasConDocumentos(App.state);
    const emp = empresas[0];
    const anios = emp ? Domain.aniosDeEmpresa(emp.id, App.state) : [];
    const chips = DB.chat.sugerencias.map((s) => `<button data-chip="${Helpers.esc(s)}" class="px-4 py-2 bg-surface-container-low hover:bg-surface-variant rounded-full font-label-md text-label-md text-on-surface-variant transition-colors">${Helpers.esc(s)}</button>`).join("");
    return `
      <div class="flex flex-col h-[calc(100vh-140px)] -m-lg md:-m-xl">
        <!-- Contexto obligatorio (RF-037 / RN-038) -->
        <div class="bg-surface-container-lowest border-b border-outline-variant px-lg py-md flex flex-wrap gap-md items-end">
          <div class="flex items-center gap-xs text-secondary mr-sm"><span class="material-symbols-outlined">filter_alt</span><span class="font-label-md text-label-md font-bold">Contexto de consulta</span></div>
          <div class="flex flex-col gap-xs"><label class="font-label-sm text-label-sm text-on-surface-variant uppercase">Sector</label>
            <select id="ia-sector" class="rounded-lg border-outline-variant bg-surface-container-low py-sm px-md text-body-md focus:border-primary focus:ring-primary"><option value="">— Elegir —</option>${DB.sectores.map((s) => `<option>${s}</option>`).join("")}</select></div>
          <div class="flex flex-col gap-xs"><label class="font-label-sm text-label-sm text-on-surface-variant uppercase">Empresa</label>
            <select id="ia-empresa" class="rounded-lg border-outline-variant bg-surface-container-low py-sm px-md text-body-md focus:border-primary focus:ring-primary min-w-[200px]"><option value="">— Elegir —</option></select></div>
          <div class="flex flex-col gap-xs"><label class="font-label-sm text-label-sm text-on-surface-variant uppercase">Año</label>
            <select id="ia-anio" class="rounded-lg border-outline-variant bg-surface-container-low py-sm px-md text-body-md focus:border-primary focus:ring-primary"><option value="">—</option></select></div>
          <span id="ia-ctx-ok" class="hidden ml-auto inline-flex items-center gap-xs px-3 py-1.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm"><span class="material-symbols-outlined text-[16px]">check_circle</span> Contexto listo</span>
        </div>

        <div class="flex-1 flex overflow-hidden">
          <div class="flex-1 flex flex-col relative bg-surface">
            <div id="chat-messages" class="flex-1 overflow-y-auto chat-scroll p-xl flex flex-col gap-xl" role="log" aria-live="polite">
              <div class="flex gap-lg max-w-4xl">
                <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-on-primary">psychology</span></div>
                <div class="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl rounded-tl-sm shadow-sm">
                  <p class="text-body-md text-on-surface mb-md">Hola, soy el asistente de IA de Igualab. Respondo únicamente con base en los documentos ingestados (RN-021) y siempre cito la fuente.</p>
                  <p class="text-body-md text-on-surface mb-md"><strong>Para consultar, primero selecciona sector, empresa y año</strong> (RF-037). Sólo respondo sobre sostenibilidad, indicadores GRI, sanciones o el contenido del corpus (RN-037).</p>
                  <div class="mt-md flex flex-wrap gap-sm">${chips}</div>
                </div>
              </div>
            </div>
            <div class="p-xl bg-surface border-t border-outline-variant">
              <div class="max-w-4xl mx-auto relative">
                <div id="chat-box" class="bg-surface-container-lowest border-2 border-outline-variant rounded-xl transition-all duration-200 opacity-60">
                  <textarea id="chat-input" rows="2" disabled class="w-full bg-transparent border-none rounded-xl text-body-md text-on-surface p-lg resize-none focus:ring-0 outline-none disabled:cursor-not-allowed" placeholder="Selecciona sector, empresa y año para habilitar la consulta…"></textarea>
                  <div class="flex justify-between items-center px-md pb-md">
                    <span class="font-label-sm text-label-sm text-outline" id="chat-ctx-label">Sin contexto seleccionado</span>
                    <button id="chat-send" disabled class="bg-primary hover:bg-surface-tint text-on-primary px-lg py-2 rounded-lg font-label-md text-label-md font-semibold flex items-center gap-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"><span>Analizar</span><span class="material-symbols-outlined">send</span></button>
                  </div>
                </div>
                <p class="text-center font-label-sm text-label-sm text-outline mt-sm">La IA siempre cita la fuente (RF-031). Si el corpus no basta, lo declara explícitamente (RF-033).</p>
              </div>
            </div>
          </div>
          <aside class="w-[340px] bg-surface-container-lowest border-l border-outline-variant flex-col shrink-0 hidden xl:flex">
            <div class="p-lg border-b border-outline-variant">
              <h2 class="font-title-lg text-title-lg text-on-surface flex items-center gap-sm"><span class="material-symbols-outlined text-secondary">analytics</span> Fuentes y análisis</h2>
              <p id="ia-panel-ctx" class="font-label-sm text-label-sm text-on-surface-variant mt-xs">Selecciona un contexto para ver la evidencia.</p>
            </div>
            <div class="flex border-b border-outline-variant px-md">
              <button data-tab="gri" class="flex-1 py-3 border-b-2 border-primary font-label-md text-label-md text-primary font-bold">Brechas GRI</button>
              <button data-tab="sanciones" class="flex-1 py-3 border-b-2 border-transparent font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors">Sanciones</button>
            </div>
            <div id="panel-fuentes" class="flex-1 overflow-y-auto p-lg space-y-lg chat-scroll"></div>
          </aside>
        </div>
      </div>`;
  },
  after(root) {
    const selSector = root.querySelector("#ia-sector");
    const selEmpresa = root.querySelector("#ia-empresa");
    const selAnio = root.querySelector("#ia-anio");
    const ctxOk = root.querySelector("#ia-ctx-ok");
    const ctxLabel = root.querySelector("#chat-ctx-label");
    const box = root.querySelector("#chat-box");
    const input = root.querySelector("#chat-input");
    const sendBtn = root.querySelector("#chat-send");
    const panel = root.querySelector("#panel-fuentes");
    const panelCtx = root.querySelector("#ia-panel-ctx");

    function empresasDe(sector) {
      return Domain.empresasConDocumentos(App.state).filter((e) => !sector || e.sector === sector);
    }
    function ctxCompleto() { return selSector.value && selEmpresa.value && selAnio.value; }
    function analisisActual() {
      if (!ctxCompleto()) return null;
      return App.state.analisis[Domain.analisisKey(selEmpresa.value, parseInt(selAnio.value, 10))] || null;
    }

    function refrescarEmpresas() {
      const emps = empresasDe(selSector.value);
      selEmpresa.innerHTML = `<option value="">— Elegir —</option>` + emps.map((e) => `<option value="${e.id}">${Helpers.esc(e.nombre)}</option>`).join("");
      selAnio.innerHTML = `<option value="">—</option>`;
    }
    function refrescarAnios() {
      const anios = selEmpresa.value ? Domain.aniosDeEmpresa(selEmpresa.value, App.state) : [];
      selAnio.innerHTML = `<option value="">—</option>` + anios.map((a) => `<option>${a}</option>`).join("");
    }
    function actualizarEstado() {
      const ok = ctxCompleto();
      ctxOk.classList.toggle("hidden", !ok);
      input.disabled = !ok;
      sendBtn.disabled = !ok;
      box.classList.toggle("opacity-60", !ok);
      if (ok) {
        const emp = App.state.empresas.find((e) => e.id === selEmpresa.value);
        ctxLabel.textContent = `Contexto: ${emp.nombre} · ${selAnio.value}`;
        panelCtx.textContent = `${emp.nombre} · ${selSector.value} · ${selAnio.value}`;
      } else {
        ctxLabel.textContent = "Sin contexto seleccionado";
        panelCtx.textContent = "Selecciona un contexto para ver la evidencia.";
      }
      renderPanel(root.querySelector("[data-tab].border-primary") ? root.querySelector("[data-tab].border-primary").dataset.tab : "gri");
    }

    selSector.addEventListener("change", () => { refrescarEmpresas(); actualizarEstado(); });
    selEmpresa.addEventListener("change", () => { refrescarAnios(); actualizarEstado(); });
    selAnio.addEventListener("change", actualizarEstado);

    // Panel lateral de evidencia (del análisis del contexto).
    function renderPanel(tab) {
      const a = analisisActual();
      if (!a) { panel.innerHTML = `<p class="text-body-md text-on-surface-variant">Sin contexto. Elige sector, empresa y año.</p>`; return; }
      if (tab === "gri") {
        panel.innerHTML = a.gri.map((g) => `
          <div class="bg-surface border border-outline-variant rounded-lg p-md border-l-4 ${g.estado === "OK" ? "border-l-primary" : g.estado === "Baja sustancia" ? "border-l-tertiary" : "border-l-error"}">
            <div class="flex justify-between items-start mb-sm"><span class="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded text-[10px] font-bold uppercase">${g.codigo}</span>${Badges.estadoBadge(g.estado)}</div>
            <h4 class="font-label-md text-label-md font-bold text-on-surface mb-xs">${Helpers.esc(g.tema)}</h4>
            <p class="font-label-sm text-label-sm text-on-surface-variant italic">${Helpers.esc(g.cita)}</p>
            <p class="mt-sm font-label-sm text-label-sm text-outline">${Helpers.esc(g.doc)} · ${Helpers.esc(g.pagina)}</p>
          </div>`).join("");
      } else {
        panel.innerHTML = a.sanciones.length ? a.sanciones.map((s) => `
          <div class="bg-surface border border-outline-variant rounded-lg p-md border-l-4 border-l-error">
            <h4 class="font-label-md text-label-md font-bold text-on-surface">${Helpers.esc(s.entidad)}</h4>
            <p class="font-label-sm text-label-sm text-on-surface-variant mb-sm">${Helpers.esc(s.motivo)}</p>
            ${s.monto != null ? `<p class="font-title-lg text-title-lg text-error font-bold">${Helpers.money(s.monto)}</p>` : '<span class="inline-flex items-center px-2 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-sm text-label-sm">No cuantificada</span>'}
          </div>`).join("") : `<p class="text-body-md text-on-surface-variant">Sin sanciones en el corpus de este contexto.</p>`;
      }
    }
    root.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => {
      root.querySelectorAll("[data-tab]").forEach((x) => x.className = x.className.replace("border-primary text-primary font-bold", "border-transparent text-on-surface-variant"));
      b.className = b.className.replace("border-transparent text-on-surface-variant", "border-primary text-primary font-bold");
      renderPanel(b.dataset.tab);
    }));

    // --- Chat -----------------------------------------------------------------
    const messages = root.querySelector("#chat-messages");
    function userBubble(text) {
      messages.insertAdjacentHTML("beforeend", `
        <div class="flex gap-lg max-w-4xl self-end flex-row-reverse">
          <div class="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-on-surface-variant">person</span></div>
          <div class="bg-primary-container p-lg rounded-xl rounded-tr-sm shadow-sm text-on-primary-container"><p class="text-body-md">${text}</p></div>
        </div>`);
      messages.scrollTop = messages.scrollHeight;
    }
    function botBubble(html, fuentes) {
      const fChips = fuentes.map((f) => `<span class="px-3 py-1 bg-surface-container-highest rounded-full font-label-md text-label-md text-on-surface flex items-center gap-xs"><span class="material-symbols-outlined text-[16px]">description</span> ${Helpers.esc(f)}</span>`).join("");
      messages.insertAdjacentHTML("beforeend", `
        <div class="flex gap-lg max-w-4xl">
          <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-on-primary">psychology</span></div>
          <div class="bg-surface-container-lowest border border-secondary-fixed p-lg rounded-xl rounded-tl-sm shadow-sm relative overflow-hidden w-full">
            <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary-fixed"></div>
            <div class="text-body-md text-on-surface">${html}</div>
            ${fuentes.length ? `<div class="flex items-center gap-sm mt-lg pt-md border-t border-outline-variant flex-wrap"><span class="font-label-sm text-label-sm text-on-surface-variant uppercase">Fuentes citadas:</span>${fChips}</div>` : ""}
            <div class="mt-md font-label-sm text-label-sm text-outline">Respuesta fundamentada en el corpus · sin datos inventados (RN-022)</div>
          </div>
        </div>`);
      messages.scrollTop = messages.scrollHeight;
    }

    const DOMINIO = ["sanci", "gri", "brecha", "emision", "sosten", "esg", "reporte", "memoria", "residuo", "agua", "comunidad", "energ", "resumen", "desempeñ", "ambiental", "gobernanza", "multa", "biodivers"];
    function esDominio(t) { return DOMINIO.some((k) => t.includes(k)); }

    // Genera la respuesta a partir del análisis del contexto (fundamentación real).
    function responder(texto) {
      const t = texto.toLowerCase();
      const a = analisisActual();
      const emp = App.state.empresas.find((e) => e.id === selEmpresa.value);
      const anio = selAnio.value;

      const typing = document.createElement("div");
      typing.className = "flex gap-lg";
      typing.innerHTML = `<div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0"><span class="material-symbols-outlined text-on-primary">psychology</span></div><div class="bg-surface-container-lowest border border-outline-variant p-lg rounded-xl rounded-tl-sm shadow-sm flex gap-xs items-center h-[56px]"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
      messages.appendChild(typing);
      messages.scrollTop = messages.scrollHeight;

      setTimeout(() => {
        typing.remove();
        let html, fuentes = [];
        if (!esDominio(t)) {
          html = DB.chat.respuestas.fueraDominio.texto;
        } else if (t.includes("sanci") || t.includes("multa")) {
          if (!a.sanciones.length) { html = `No identifico sanciones para <strong>${emp.nombre}</strong> en ${anio} dentro del corpus. La ausencia de hallazgo no equivale a ausencia de evidencia (RN-031).`; }
          else {
            const res = Domain.resumenSanciones(a.sanciones);
            html = `Para <strong>${emp.nombre}</strong> (${anio}) identifico ${a.sanciones.length} sanción(es): ` +
              a.sanciones.map((s) => `${s.entidad} — ${s.monto != null ? Helpers.money(s.monto) : "<em>no cuantificada</em>"}`).join("; ") +
              `. Total cuantificado: <strong>${Helpers.money(res.total)}</strong>${res.sinMonto ? `, con ${res.sinMonto} sin monto determinado` : ""}.`;
            fuentes = [...new Set(a.sanciones.map((s) => s.doc))];
          }
        } else if (t.includes("brecha") || t.includes("gri") || t.includes("sub-reportad") || t.includes("sub reportad")) {
          const brechas = a.gri.filter((g) => g.estado !== "OK");
          if (!brechas.length) { html = `Todos los códigos GRI evaluados de <strong>${emp.nombre}</strong> (${anio}) están en estado OK según el análisis persistido.`; }
          else {
            html = `Brechas GRI de <strong>${emp.nombre}</strong> (${anio}): ` + brechas.map((g) => `<strong>${g.codigo}</strong> (${g.tema}) — ${g.estado}`).join("; ") + ". Cada estado se asignó tras revisar la cita textual del documento.";
            fuentes = [...new Set(brechas.map((g) => g.doc))];
          }
        } else {
          const esg = Domain.esgScore(a.gri);
          const c = Domain.conteoEstados(a.gri);
          html = `Resumen de <strong>${emp.nombre}</strong> (${anio}): puntaje ESG <strong>${esg}/100</strong>; ${c["OK"]} códigos OK, ${c["Baja sustancia"]} de baja sustancia y ${c["Sub-reportado"]} sub-reportados. ${a.sanciones.length ? `Con ${a.sanciones.length} sanción(es) registrada(s).` : "Sin sanciones registradas."}`;
          fuentes = [...new Set(a.gri.map((g) => g.doc))];
        }
        botBubble(html, fuentes);
        App.pushAudit("Consulta IA", `Consulta RAG · ${emp.nombre} (${anio}): '${texto.slice(0, 50)}'`);
      }, 1200);
    }

    function enviar() {
      if (!ctxCompleto()) { UI.toast("Selecciona sector, empresa y año antes de consultar (RF-037).", "warn"); return; }
      const t = input.value.trim();
      if (!t) return;
      userBubble(Helpers.esc(t));
      input.value = "";
      responder(t);
    }
    sendBtn.addEventListener("click", enviar);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); } });
    root.querySelectorAll("[data-chip]").forEach((c) => c.addEventListener("click", () => {
      if (!ctxCompleto()) { UI.toast("Primero elige sector, empresa y año (RF-037).", "warn"); return; }
      userBubble(Helpers.esc(c.dataset.chip));
      responder(c.dataset.chip);
    }));

    actualizarEstado();
  }
};
