// Vista Administrador: reportes de prospección por sector → empresa → año.
// Incluye la asignación manual del estado de cada código GRI (RN-016/RF-027),
// vista previa y descarga en PDF. Sólo empresas con documentos (RF-036/RN-020).
Views.reportes = {
  html() {
    const empresasDocs = Domain.empresasConDocumentos(App.state);
    const sectores = [...new Set(empresasDocs.map((e) => e.sector))];

    const misReportes = App.state.reports.map((r) => `
      <tr class="border-b border-surface-variant hover:bg-surface/50 transition-colors">
        <td class="py-md px-md font-medium">${Helpers.esc(r.empresa)}</td>
        <td class="py-md px-md text-on-surface-variant">${Helpers.esc(r.sector || "")}</td>
        <td class="py-md px-md text-on-surface-variant">${r.anio}</td>
        <td class="py-md px-md text-on-surface-variant">${Helpers.esc(r.generadoPor || "")}</td>
        <td class="py-md px-md text-on-surface-variant">${Helpers.esc(r.fecha)}</td>
        <td class="py-md px-md text-right"><button data-ver-reporte="${r.id}" class="p-1.5 rounded-lg text-primary hover:bg-primary/5" title="Ver / descargar"><span class="material-symbols-outlined text-[18px]">picture_as_pdf</span></button></td>
      </tr>`).join("");

    if (!empresasDocs.length) {
      return `
        ${Cards.sectionHeader("Reportes de prospección", "Genera un reporte por empresa y año, a partir de los resultados de análisis almacenados (RF-042).")}
        <div class="bg-surface-container-lowest rounded-xl border border-surface-variant p-xl text-center">
          <span class="material-symbols-outlined text-[40px] text-outline">block</span>
          <p class="text-body-md text-on-surface-variant mt-sm">No hay empresas con documentos ingestados. No se puede generar un reporte de prospección (RF-026 / RN-020).</p>
        </div>`;
    }

    return `
      ${Cards.sectionHeader("Reportes de prospección", "Selecciona sector, empresa y año; asigna el estado de cada código GRI y genera el reporte con resumen ejecutivo automático (RN-024). El reporte es inmutable (RN-026).")}
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        <div class="lg:col-span-4 space-y-lg">
          <div class="bg-surface-container-lowest rounded-xl border border-surface-variant p-lg ambient-shadow">
            <h3 class="font-title-lg text-title-lg text-on-background mb-md">Parámetros</h3>
            <div class="space-y-md">
              <div class="flex flex-col gap-xs"><label class="font-label-md text-label-md text-on-surface-variant">1 · Sector</label>
                <select id="rep-sector" class="rounded-lg border-outline-variant bg-surface-container-low py-sm px-md text-body-md focus:border-primary focus:ring-primary">
                  ${sectores.map((s) => `<option>${Helpers.esc(s)}</option>`).join("")}
                </select></div>
              <div class="flex flex-col gap-xs"><label class="font-label-md text-label-md text-on-surface-variant">2 · Empresa</label>
                <select id="rep-empresa" class="rounded-lg border-outline-variant bg-surface-container-low py-sm px-md text-body-md focus:border-primary focus:ring-primary"></select></div>
              <div class="flex flex-col gap-xs"><label class="font-label-md text-label-md text-on-surface-variant">3 · Año</label>
                <select id="rep-anio" class="rounded-lg border-outline-variant bg-surface-container-low py-sm px-md text-body-md focus:border-primary focus:ring-primary"></select></div>
            </div>
            <div class="grid grid-cols-1 gap-sm mt-lg">
              <button data-action="rep-preview" class="w-full bg-surface border border-primary text-primary py-md px-lg rounded-lg flex items-center justify-center gap-sm hover:bg-primary/5 transition-all text-body-lg font-semibold">
                <span class="material-symbols-outlined">visibility</span> Generar vista previa
              </button>
              <button data-action="rep-pdf" class="w-full bg-primary text-on-primary py-md px-lg rounded-lg flex items-center justify-center gap-sm shadow-md hover:bg-surface-tint transition-all text-body-lg font-semibold">
                <span class="material-symbols-outlined">download</span> Descargar PDF
              </button>
            </div>
            <p class="font-label-sm text-label-sm text-outline mt-md">El resumen ejecutivo incluye sólo el puntaje ESG, el total de sanciones y las sanciones sin monto (RF-041).</p>
          </div>
        </div>

        <div class="lg:col-span-8 space-y-lg">
          <div class="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm overflow-hidden">
            <div class="p-lg border-b border-outline-variant bg-surface-bright flex justify-between items-center">
              <h3 class="font-title-lg text-title-lg text-on-surface">Estados de códigos GRI (asignación manual)</h3>
              <span id="rep-esg-live" class="font-label-sm text-label-sm text-on-surface-variant"></span>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead><tr class="bg-surface-container-low border-b border-outline-variant">${["Código", "Tema", "Cita textual (evidencia)", "Estado"].map((h) => `<th class="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase">${h}</th>`).join("")}</tr></thead>
                <tbody id="rep-gri-body" class="text-body-md"></tbody>
              </table>
            </div>
          </div>

          <div id="rep-preview-wrap" class="hidden bg-surface-container-low rounded-xl border border-surface-variant p-lg">
            <div class="flex justify-between items-center mb-sm">
              <h3 class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Vista previa del documento</h3>
              <span class="font-label-sm text-label-sm text-outline">A4</span>
            </div>
            <div class="overflow-y-auto chat-scroll py-lg max-h-[560px]">
              <div class="scale-[0.7] lg:scale-[0.82] origin-top"><div id="print-area"></div></div>
            </div>
          </div>

          <div class="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm overflow-hidden">
            <div class="p-lg border-b border-outline-variant bg-surface-bright"><h3 class="font-title-lg text-title-lg text-on-surface">Historial de reportes generados (RF-044)</h3></div>
            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead><tr class="bg-surface-container-low border-b border-outline-variant">${["Empresa", "Sector", "Año", "Generado por", "Fecha", ""].map((h) => `<th class="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase">${h}</th>`).join("")}</tr></thead>
                <tbody class="text-body-md">${misReportes || '<tr><td colspan="6" class="py-lg text-center text-body-md text-on-surface-variant">Aún no has generado reportes.</td></tr>'}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>`;
  },

  after(root) {
    const selSector = root.querySelector("#rep-sector");
    const selEmp = root.querySelector("#rep-empresa");
    const selAnio = root.querySelector("#rep-anio");
    const griBody = root.querySelector("#rep-gri-body");
    const esgLive = root.querySelector("#rep-esg-live");
    const previewWrap = root.querySelector("#rep-preview-wrap");
    const printArea = root.querySelector("#print-area");

    function empresasDe(sector) {
      return Domain.empresasConDocumentos(App.state).filter((e) => e.sector === sector);
    }
    function refrescarEmpresas() {
      const emps = empresasDe(selSector.value);
      selEmp.innerHTML = emps.map((e) => `<option value="${e.id}">${Helpers.esc(e.nombre)}</option>`).join("");
    }
    function refrescarAnios() {
      const anios = selEmp.value ? Domain.aniosDeEmpresa(selEmp.value, App.state) : [];
      selAnio.innerHTML = anios.map((a) => `<option>${a}</option>`).join("");
    }
    function analisisActual() {
      return App.state.analisis[Domain.analisisKey(selEmp.value, parseInt(selAnio.value, 10))] || null;
    }

    function renderGri() {
      const a = analisisActual();
      if (!a) { griBody.innerHTML = `<tr><td colspan="4" class="py-lg text-center text-on-surface-variant">Sin análisis para este año.</td></tr>`; esgLive.textContent = ""; return; }
      esgLive.textContent = `Puntaje ESG: ${Domain.esgScore(a.gri)}/100 · OK=100 · Baja=50 · Sub=0 (RF-051)`;
      griBody.innerHTML = a.gri.map((g, i) => `
        <tr class="border-b border-surface-variant align-top">
          <td class="py-md px-md whitespace-nowrap"><span class="bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded text-[10px] font-bold uppercase">${g.codigo}</span></td>
          <td class="py-md px-md font-medium">${Helpers.esc(g.tema)}</td>
          <td class="py-md px-md"><p class="text-body-md text-on-surface-variant italic border-l-2 border-outline-variant pl-sm">${Helpers.esc(g.cita)}</p><p class="font-label-sm text-label-sm text-outline mt-xs">${Helpers.esc(g.doc)} · ${Helpers.esc(g.pagina)}</p></td>
          <td class="py-md px-md">
            <select data-gri="${i}" class="rounded-lg border-outline-variant bg-surface-container-low py-xs px-sm text-body-md focus:border-primary focus:ring-primary">
              ${DB.estadosGri.map((es) => `<option ${g.estado === es ? "selected" : ""}>${es}</option>`).join("")}
            </select>
          </td>
        </tr>`).join("");
      griBody.querySelectorAll("[data-gri]").forEach((sel) => sel.addEventListener("change", () => {
        const idx = parseInt(sel.dataset.gri, 10);
        const prev = a.gri[idx].estado;
        if (prev === sel.value) return;
        a.gri[idx].estado = sel.value;
        const emp = App.state.empresas.find((e) => e.id === selEmp.value);
        App.pushAudit("Cambio de estado GRI", `Asignó estado '${sel.value}' a ${a.gri[idx].codigo} · ${emp.nombre} ${selAnio.value} (antes '${prev}')`);
        UI.toast(`${a.gri[idx].codigo}: estado '${sel.value}'. ESG recalculado.`, "success");
        esgLive.textContent = `Puntaje ESG: ${Domain.esgScore(a.gri)}/100 · OK=100 · Baja=50 · Sub=0 (RF-051)`;
        if (!previewWrap.classList.contains("hidden")) renderPreview();
      }));
    }

    function renderPreview() {
      previewWrap.classList.remove("hidden");
      printArea.innerHTML = Report.renderA4(selEmp.value, parseInt(selAnio.value, 10));
    }

    selSector.addEventListener("change", () => { refrescarEmpresas(); refrescarAnios(); renderGri(); previewWrap.classList.add("hidden"); });
    selEmp.addEventListener("change", () => { refrescarAnios(); renderGri(); previewWrap.classList.add("hidden"); });
    selAnio.addEventListener("change", () => { renderGri(); if (!previewWrap.classList.contains("hidden")) renderPreview(); });

    root.querySelector("[data-action='rep-preview']").addEventListener("click", () => {
      if (!selEmp.value || !selAnio.value) { UI.toast("Selecciona sector, empresa y año.", "warn"); return; }
      renderPreview();
      previewWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    root.querySelector("[data-action='rep-pdf']").addEventListener("click", () => {
      if (!selEmp.value || !selAnio.value) { UI.toast("Selecciona sector, empresa y año.", "warn"); return; }
      renderPreview();
      const empId = selEmp.value, anio = parseInt(selAnio.value, 10);
      const emp = App.state.empresas.find((e) => e.id === empId);
      const r = { id: "r" + Date.now(), empresaId: empId, empresa: emp.nombre, sector: emp.sector, anio, generadoPor: App.state.user.nombre, fecha: new Date().toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" }) };
      App.state.reports.unshift(r);
      App.pushAudit("Generación de reporte", `Generó reporte de prospección · ${emp.nombre} (${anio})`);
      UI.toast("Reporte generado, registrado en auditoría e inmutable (RN-026).", "success");
      setTimeout(() => window.print(), 400);
      setTimeout(() => App.rerender(), 800);
    });

    root.querySelectorAll("[data-ver-reporte]").forEach((b) => b.addEventListener("click", () => {
      const r = App.state.reports.find((x) => x.id === b.dataset.verReporte);
      Report.openModal(r.empresaId, r.anio, r);
    }));

    // Inicial.
    refrescarEmpresas();
    refrescarAnios();
    renderGri();
  }
};
