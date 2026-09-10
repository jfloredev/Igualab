Views.bolsa = {
  html() {
    const soloLectura = true;
    return `
      ${Cards.sectionHeader("Bolsa de Valores · Sostenibilidad", "Dashboards y tablas interactivas de emisores. " + (soloLectura ? "Acceso de solo lectura (RF-03)." : "Explora por empresa, sector o periodo (RF-08)."))}
      <div class="bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm overflow-hidden">
        <div class="p-lg border-b border-outline-variant bg-surface-bright flex flex-wrap gap-md items-end">
          <div class="flex flex-col gap-xs"><label class="font-label-sm text-label-sm text-on-surface-variant uppercase">Empresa</label>
            <select id="bolsa-empresa" class="rounded-lg border-outline-variant bg-surface-container-lowest py-sm px-md text-body-md focus:border-primary focus:ring-primary min-w-[180px]"><option value="">Todas</option>${DB.empresas.map((e) => `<option value="${e.id}">${Helpers.esc(e.nombre)}</option>`).join("")}</select></div>
          <div class="flex flex-col gap-xs"><label class="font-label-sm text-label-sm text-on-surface-variant uppercase">Sector</label>
            <select id="bolsa-sector" class="rounded-lg border-outline-variant bg-surface-container-lowest py-sm px-md text-body-md focus:border-primary focus:ring-primary min-w-[150px]"><option value="">Todos</option>${[...new Set(DB.empresas.map((e) => e.sector))].map((s) => `<option>${s}</option>`).join("")}</select></div>
          <div class="flex flex-col gap-xs"><label class="font-label-sm text-label-sm text-on-surface-variant uppercase">Periodo</label>
            <select id="bolsa-periodo" class="rounded-lg border-outline-variant bg-surface-container-lowest py-sm px-md text-body-md focus:border-primary focus:ring-primary min-w-[120px]">${DB.bolsa.periodos.map((p) => `<option>${p}</option>`).join("")}</select></div>
          ${soloLectura ? '<span class="ml-auto inline-flex items-center gap-xs px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant font-label-sm text-label-sm text-on-surface-variant"><span class="material-symbols-outlined text-[16px]">visibility</span> Solo lectura</span>' : '<button data-action="export-bolsa" class="ml-auto flex items-center gap-sm px-md py-sm bg-surface rounded-lg border border-outline-variant text-on-surface text-label-md font-semibold hover:bg-surface-container-low transition-colors"><span class="material-symbols-outlined text-[18px]">download</span> Exportar CSV</button>'}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-12 gap-lg p-lg">
          <div class="md:col-span-8 flex flex-col min-h-[380px]">
            <div class="flex justify-between items-center mb-md flex-wrap gap-sm">
              <h3 class="font-title-lg text-title-lg text-on-surface">Evolución de precio vs emisiones</h3>
              <div class="flex gap-xs">
                <span class="inline-flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant"><span class="w-3 h-3 rounded-full bg-primary"></span> Precio (S/)</span>
                <span class="inline-flex items-center gap-xs font-label-sm text-label-sm text-on-surface-variant ml-sm"><span class="w-3 h-3 rounded-full bg-secondary"></span> Emisiones (×100k tCO2e)</span>
              </div>
            </div>
            <div id="bolsa-chart" class="flex-1 flex"></div>
          </div>
          <div class="md:col-span-4 flex flex-col gap-lg">
            <div id="bolsa-kpi-1"></div>
            <div id="bolsa-kpi-2"></div>
          </div>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead><tr class="bg-surface-container-low border-b border-outline-variant">${["Empresa", "Ticker", "Sector", "Precio (S/)", "Emisiones (tCO2e)", "Intensidad", "Riesgo IA"].map((h) => `<th class="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase ${h === "Riesgo IA" ? "text-right" : ""}">${h}</th>`).join("")}</tr></thead>
            <tbody id="bolsa-body" class="text-body-md"></tbody>
          </table>
        </div>
      </div>`;
  },
  after(root) {
    const chartBox = root.querySelector("#bolsa-chart");
    const kpi1 = root.querySelector("#bolsa-kpi-1");
    const kpi2 = root.querySelector("#bolsa-kpi-2");
    const body = root.querySelector("#bolsa-body");
    function aplicar() {
      const empId = root.querySelector("#bolsa-empresa").value;
      const sector = root.querySelector("#bolsa-sector").value;
      const periodo = root.querySelector("#bolsa-periodo").value;
      const pIdx = DB.bolsa.periodos.indexOf(periodo);
      const list = DB.empresas.filter((e) => (!empId || e.id === empId) && (!sector || e.sector === sector));
      if (!list.length) {
        chartBox.innerHTML = '<div class="w-full flex items-center justify-center text-body-md text-on-surface-variant py-xl">Sin datos para el filtro seleccionado.</div>';
        body.innerHTML = '<tr><td colspan="7" class="py-xl text-center text-body-md text-on-surface-variant">Sin datos para el filtro seleccionado.</td></tr>';
        kpi1.innerHTML = ""; kpi2.innerHTML = "";
        return;
      }
      const emiSeries = DB.bolsa.periodos.map((_, i) => Math.round(list.reduce((a, e) => a + DB.bolsa.series[e.id].emisiones[i], 0) / list.length / 100000));
      const precSeries = DB.bolsa.periodos.map((_, i) => +(list.reduce((a, e) => a + DB.bolsa.series[e.id].precio[i], 0) / list.length).toFixed(2));
      chartBox.innerHTML = Charts.lineChart(precSeries, DB.bolsa.periodos, "#006038", "#006a61", emiSeries);
      const esgProm = (list.reduce((a, e) => a + e.esg, 0) / list.length).toFixed(1);
      const emiTotal = list.reduce((a, e) => a + DB.bolsa.series[e.id].emisiones[pIdx], 0);
      kpi1.outerHTML = `<div id="bolsa-kpi-1">${Cards.kpiCard({ titulo: "Emisiones totales", valor: (emiTotal / 1e6).toFixed(1) + "M", delta: "-5.2% vs periodo anterior", deltaDir: "down", icono: "factory", pie: 60, extra: "TONELADAS DE CO2 eq" })}</div>`;
      kpi2.outerHTML = `<div id="bolsa-kpi-2">${Cards.kpiCard({ titulo: "Índice sostenibilidad prom.", valor: esgProm, delta: "+1.2 pts", icono: "trending_up", color: "secondary", pie: esgProm })}</div>`;
      body.innerHTML = list.map((e) => {
        const s = DB.bolsa.series[e.id];
        return `<tr class="border-b border-surface-variant hover:bg-surface/50 transition-colors">
          <td class="py-md px-md font-medium">${Helpers.esc(e.nombre)}</td>
          <td class="py-md px-md text-on-surface-variant">${e.ticker}</td>
          <td class="py-md px-md">${Helpers.esc(e.sector)}</td>
          <td class="py-md px-md">${s.precio[pIdx].toFixed(2)}</td>
          <td class="py-md px-md">${s.emisiones[pIdx].toLocaleString("es-PE")}</td>
          <td class="py-md px-md">${s.intensidad[pIdx]}</td>
          <td class="py-md px-md text-right">${Badges.estadoBadge(e.riesgo)}</td>
        </tr>`;
      }).join("");
    }
    ["#bolsa-empresa", "#bolsa-sector", "#bolsa-periodo"].forEach((s) => root.querySelector(s).addEventListener("change", aplicar));
    aplicar();
  }
};
