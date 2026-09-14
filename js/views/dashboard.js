Views.dashboard = {
  html() {
    const role = App.state.role;
    const u = App.state.user;

    // ESG por empresa a partir del último año con análisis (RF-051).
    const empresasEsg = App.state.empresas.map((e) => {
      const anios = Domain.aniosDeEmpresa(e.id, App.state);
      const a = anios.length ? App.state.analisis[Domain.analisisKey(e.id, anios[0])] : null;
      return { nombre: e.nombre, corto: e.nombre.split(" ")[1] || e.nombre.slice(0, 6), esg: a ? Domain.esgScore(a.gri) : null };
    }).filter((x) => x.esg != null);

    const esgProm = empresasEsg.length ? (empresasEsg.reduce((a, e) => a + e.esg, 0) / empresasEsg.length).toFixed(1) : "—";
    const docsOk = App.state.documents.filter((d) => d.estado === "Éxito").length;
    const sancionesTotal = Object.values(App.state.analisis).reduce((a, an) => a + (an.sanciones ? an.sanciones.length : 0), 0);
    const audit = App.state.audit;

    let kpis = "";
    if (role === "superadmin") {
      const activos = App.state.users.filter((x) => x.estado === "Activo").length;
      kpis = [
        Cards.kpiCard({ titulo: "Cuentas activas", valor: activos, delta: "1 SuperAdmin", icono: "group", pie: activos * 20 }),
        Cards.kpiCard({ titulo: "Empresas registradas", valor: App.state.empresas.length, icono: "domain", color: "secondary", pie: App.state.empresas.length * 18 }),
        Cards.kpiCard({ titulo: "Documentos ingestados", valor: docsOk, icono: "folder_open", color: "tertiary", pie: docsOk * 15 }),
        Cards.kpiCard({ titulo: "Eventos de auditoría", valor: audit.length, icono: "history", pie: Math.min(audit.length * 6, 100), extra: "Registro inmutable (RN-029)" })
      ].join("");
    } else {
      kpis = [
        Cards.kpiCard({ titulo: "Empresas analizables", valor: Domain.empresasConDocumentos(App.state).length, icono: "domain", pie: 80 }),
        Cards.kpiCard({ titulo: "Reportes generados", valor: App.state.reports.length, icono: "description", color: "secondary", pie: App.state.reports.length * 25 }),
        Cards.kpiCard({ titulo: "Sanciones identificadas", valor: sancionesTotal, deltaDir: "down", icono: "gavel", color: "tertiary", pie: sancionesTotal * 12 }),
        Cards.kpiCard({ titulo: "ESG promedio", valor: esgProm, icono: "eco", color: "secondary", pie: parseFloat(esgProm) || 0, extra: "OK=100 · Baja=50 · Sub=0 (RF-051)" })
      ].join("");
    }

    const iconoTipo = (t) => t.includes("sesión") ? "login" : t.includes("Ingesta") ? "upload_file" : t.includes("Rechazo") ? "block" : t.includes("rol") ? "manage_accounts" : t.includes("estado GRI") ? "rule" : t.includes("empresa") ? "domain" : t.includes("reporte") || t.includes("Descarga") ? "description" : t.includes("IA") ? "psychology" : "settings";
    const actividad = audit.slice(-6).reverse().map((a) => `
      <div class="flex gap-md items-start group">
        <div class="w-8 h-8 rounded-full bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0 mt-1">
          <span class="material-symbols-outlined text-[16px]">${iconoTipo(a.tipo)}</span>
        </div>
        <div class="flex-1 border-b border-surface-variant pb-3 group-last:border-0">
          <p class="text-body-md font-medium text-on-background">${Helpers.esc(a.accion)}</p>
          <p class="font-label-sm text-label-sm text-on-surface-variant mt-1">${Helpers.esc(a.usuario)} · ${Helpers.esc(a.fecha)}</p>
        </div>
      </div>`).join("");

    const chart = empresasEsg.length
      ? Charts.barChart(empresasEsg.map((e) => e.esg), empresasEsg.map((e) => e.corto), "#006038")
      : '<div class="flex-1 flex items-center justify-center text-body-md text-on-surface-variant">Sin análisis GRI disponible.</div>';

    return `
      ${Cards.sectionHeader(`Hola, ${Helpers.esc(u.nombre.split(" ")[0])} 👋`, role === "superadmin" ? "Panel de gestión de la plataforma Igualab." : "Panel analítico de prospección de Igualab.")}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">${kpis}</div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div class="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-surface-variant p-lg ambient-shadow flex flex-col min-h-[420px]">
          <div class="flex justify-between items-center mb-lg">
            <div>
              <h3 class="font-title-lg text-title-lg text-on-background">Puntaje ESG por empresa</h3>
              <p class="font-label-md text-label-md text-on-surface-variant">Calculado de los estados GRI del último año analizado (0-100)</p>
            </div>
          </div>
          <div class="flex-1 flex">${chart}</div>
        </div>
        <div class="bg-surface-container-lowest rounded-xl border border-surface-variant p-lg ambient-shadow flex flex-col">
          <div class="flex justify-between items-center mb-md">
            <h3 class="font-title-lg text-title-lg text-on-background">Últimas actividades</h3>
          </div>
          <div class="flex-1 overflow-y-auto pr-2 -mr-2">${actividad || '<p class="text-body-md text-on-surface-variant">Sin actividades registradas.</p>'}</div>
          <button data-action="go-auditoria" class="w-full mt-4 py-2 text-center text-primary text-label-md font-semibold hover:bg-primary/5 rounded-lg transition-colors ${role === "superadmin" ? "" : "hidden"}">Ver toda la auditoría</button>
        </div>
      </div>`;
  }
};
