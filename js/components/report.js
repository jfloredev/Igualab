// Reporte de prospección (RN-024). Consolida, para UNA empresa y UN año:
// estado de cada código GRI con cita (RF-038), sanciones con monto o
// "no cuantificada" (RF-039), campo de totales (RF-040) y resumen ejecutivo
// automático (RF-041). Se deriva sólo de resultados almacenados, sin IA (RF-042).
const Report = (() => {
  function renderA4(empresaId, anio) {
    const e = App.state.empresas.find((x) => x.id === empresaId) || App.state.empresas[0];
    const a = App.state.analisis[Domain.analisisKey(empresaId, anio)] || { gri: [], sanciones: [], evidencia: { gri: false, sanciones: false } };
    const esg = Domain.esgScore(a.gri);
    const conteo = Domain.conteoEstados(a.gri);
    const resSan = Domain.resumenSanciones(a.sanciones);

    return `
      <div class="w-[800px] max-w-full bg-white shadow-[0_12px_32px_rgba(0,0,0,0.08)] rounded-sm flex flex-col mx-auto">
        <div class="h-24 border-b border-surface-variant flex items-center justify-between px-10 py-6">
          <div class="flex items-center gap-sm">
            <img src="assets/Logo.webp" alt="Igualab" class="h-8 object-contain"/>
            <div class="font-title-lg text-title-lg font-bold text-primary">Igualab Intelligence</div>
          </div>
          <div class="text-right">
            <div class="font-label-sm text-label-sm text-outline uppercase">Reporte de Prospección</div>
            <div class="text-body-md text-on-surface-variant">Generado: ${new Date().toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" })}</div>
          </div>
        </div>
        <div class="p-10 flex flex-col gap-7">
          <div>
            <h1 class="font-headline-lg text-headline-lg text-on-background font-black leading-tight mb-2">${Helpers.esc(e.nombre)}</h1>
            <div class="font-title-lg text-title-lg text-secondary border-b-2 border-secondary inline-block pb-1">Año ${anio} · Sector: ${Helpers.esc(e.sector)}</div>
          </div>

          <!-- Resumen ejecutivo automático (RF-041) -->
          <div>
            <h2 class="font-headline-md text-headline-md text-primary mb-3 flex items-center gap-2"><span class="material-symbols-outlined text-primary">summarize</span> Resumen ejecutivo</h2>
            <div class="grid grid-cols-3 gap-3 mb-4">
              <div class="border border-surface-variant rounded p-3 border-t-4 border-t-primary"><div class="font-label-sm text-label-sm text-outline uppercase">Puntaje ESG</div><div class="font-headline-md text-headline-md text-on-surface">${esg == null ? "—" : esg}<span class="text-title-lg text-outline">/100</span></div></div>
              <div class="border border-surface-variant rounded p-3 border-t-4 border-t-tertiary"><div class="font-label-sm text-label-sm text-outline uppercase">Total sanciones (S/)</div><div class="font-headline-md text-headline-md text-on-surface">${resSan.total ? Helpers.money(resSan.total).replace("S/ ", "") : "0"}</div></div>
              <div class="border border-surface-variant rounded p-3 border-t-4 border-t-outline"><div class="font-label-sm text-label-sm text-outline uppercase">Sin monto</div><div class="font-headline-md text-headline-md text-on-surface">${resSan.sinMonto}</div></div>
            </div>
            <p class="text-body-md text-on-surface leading-relaxed">
              ${Helpers.esc(e.nombre)} presenta un puntaje ESG de <strong>${esg == null ? "sin datos" : esg + "/100"}</strong> en ${anio}.
              Brechas GRI por estado: <strong>${conteo["OK"]} OK</strong>, <strong>${conteo["Baja sustancia"]} baja sustancia</strong> y <strong>${conteo["Sub-reportado"]} sub-reportado</strong>.
              Sanciones cuantificadas por <strong>${Helpers.money(resSan.total)}</strong>${resSan.sinMonto ? ` y <strong>${resSan.sinMonto}</strong> sanción(es) sin monto determinado` : ""}.
            </p>
          </div>

          <!-- Estado de cada código GRI con cita (RF-038) -->
          <div>
            <h2 class="font-headline-md text-headline-md text-primary mb-3 flex items-center gap-2"><span class="material-symbols-outlined text-primary">rule</span> Estado por código GRI ${a.evidencia.gri ? "" : "<span class='text-body-md text-error font-normal'>· sin evidencia analizable</span>"}</h2>
            <table class="w-full text-left border-collapse">
              <thead><tr class="bg-surface-container-low">${["Código", "Tema", "Estado", "Cita de respaldo"].map((h) => `<th class="py-2 px-3 font-label-sm text-label-sm text-on-surface-variant uppercase">${h}</th>`).join("")}</tr></thead>
              <tbody>${a.gri.length ? a.gri.map((g) => `<tr class="border-b border-surface-variant align-top"><td class="py-2 px-3 font-medium whitespace-nowrap">${g.codigo}</td><td class="py-2 px-3">${Helpers.esc(g.tema)}</td><td class="py-2 px-3">${Badges.estadoBadge(g.estado)}</td><td class="py-2 px-3 text-on-surface-variant text-body-md italic">${Helpers.esc(g.cita)} <span class="not-italic text-outline">(${Helpers.esc(g.pagina)})</span></td></tr>`).join("") : '<tr><td colspan="4" class="py-3 px-3 text-on-surface-variant">Sin códigos GRI evaluados para este año.</td></tr>'}</tbody>
            </table>
          </div>

          <!-- Sanciones (RF-039) + totales (RF-040) -->
          <div>
            <h2 class="font-headline-md text-headline-md text-primary mb-3 flex items-center gap-2"><span class="material-symbols-outlined text-primary">gavel</span> Sanciones identificadas</h2>
            ${a.sanciones.length ? a.sanciones.map((s) => `
              <div class="flex justify-between items-start border border-surface-variant rounded-lg p-3 mb-2 gap-4">
                <div><p class="text-body-md font-medium text-on-surface">${Helpers.esc(s.entidad)}</p><p class="font-label-sm text-label-sm text-on-surface-variant">${Helpers.esc(s.motivo)} · <span class="italic">${Helpers.esc(s.pagina)}</span></p></div>
                ${s.monto != null ? `<p class="font-title-lg text-title-lg text-error font-bold whitespace-nowrap">${Helpers.money(s.monto)}</p>` : '<span class="inline-flex items-center px-2 py-1 rounded-full bg-surface-variant text-on-surface-variant font-label-sm text-label-sm whitespace-nowrap">No cuantificada</span>'}
              </div>`).join("") : '<p class="text-body-md text-on-surface-variant">Sin sanciones identificadas en los documentos del año analizado.</p>'}
            <div class="mt-3 border border-surface-variant rounded-lg p-3 bg-surface-container-low flex justify-between">
              <div><p class="font-label-sm text-label-sm text-outline uppercase">Monto total de sanciones cuantificadas</p><p class="font-title-lg text-title-lg text-on-surface font-bold">${Helpers.money(resSan.total)}</p></div>
              <div class="text-right"><p class="font-label-sm text-label-sm text-outline uppercase">Sanciones sin monto determinado</p><p class="font-title-lg text-title-lg text-on-surface font-bold">${resSan.sinMonto}</p></div>
            </div>
          </div>

          <div class="mt-auto border-t border-surface-variant pt-4 flex justify-between items-center text-outline font-label-md text-label-md">
            <span>Confidencial · Uso interno de Igualab · Reporte inmutable (RN-026)</span>
            <span>Igualab Intelligence</span>
          </div>
        </div>
      </div>`;
  }

  function openModal(empresaId, anio, existente) {
    const e = App.state.empresas.find((x) => x.id === empresaId) || App.state.empresas[0];
    const overlay = Modal.open(`
      <div class="flex justify-between items-center p-lg border-b border-outline-variant">
        <h3 class="font-title-lg text-title-lg text-on-surface flex items-center gap-sm"><span class="material-symbols-outlined text-primary">picture_as_pdf</span> Reporte de prospección · ${Helpers.esc(e.nombre)} (${anio})</h3>
        <button data-modal-close class="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant"><span class="material-symbols-outlined">close</span></button>
      </div>
      <div class="overflow-y-auto p-lg bg-surface-container-low" id="print-area">${renderA4(empresaId, anio)}</div>
      <div class="p-md border-t border-outline-variant flex justify-end gap-sm">
        <button data-modal-close class="px-lg py-sm rounded-lg border border-outline-variant text-body-md text-on-surface-variant hover:bg-surface-container-low">Cerrar</button>
        <button id="btn-pdf" class="px-lg py-sm rounded-lg bg-primary text-on-primary text-label-md font-semibold flex items-center gap-sm hover:bg-surface-tint"><span class="material-symbols-outlined text-[18px]">download</span> ${existente ? "Descargar PDF" : "Generar y descargar PDF"}</button>
      </div>`, { width: "max-w-4xl" });
    overlay.querySelector("#btn-pdf").addEventListener("click", () => {
      if (!existente) {
        const r = { id: "r" + Date.now(), empresaId, empresa: e.nombre, sector: e.sector, anio, generadoPor: App.state.user.nombre, fecha: new Date().toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" }) };
        App.state.reports.unshift(r);
        App.pushAudit("Generación de reporte", `Generó reporte de prospección · ${e.nombre} (${anio})`);
        Toast.show("Reporte generado, registrado en auditoría e inmutable (RN-026).", "success");
      } else {
        App.pushAudit("Descarga", `Descargó reporte de prospección · ${e.nombre} (${anio})`);
        Toast.show("Reporte descargado (simulado con impresión).", "success");
      }
      setTimeout(() => window.print(), 400);
      App.rerender();
    });
  }

  return { renderA4, openModal };
})();
