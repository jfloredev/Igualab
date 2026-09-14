// Vista SuperAdmin: ingesta de documentos fuente ya convertidos a Markdown (RN-012).
// Sólo Memoria Anual o Reporte de Sostenibilidad GRI (RN-011). Validaciones:
// .md (RF-018), unicidad empresa+tipo+año (RN-033/RF-021), hash SHA-256 (RF-020),
// contenido GRI/sanción (RF-019). Procesamiento síncrono con resultado (RF-022).
Views.ingesta = {
  html() {
    const rows = App.state.documents.map((d) => filaDoc(d)).join("");
    return `
      ${Cards.sectionHeader("Ingesta de documentos", "Carga de memorias anuales y reportes de sostenibilidad GRI ya convertidos a Markdown por el cliente (RN-012). Sólo se admite .md.")}
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        <div class="lg:col-span-1 space-y-lg">
          <div class="bg-surface-container-lowest rounded-xl border border-surface-variant p-lg ambient-shadow">
            <h3 class="font-title-lg text-title-lg text-on-background mb-md">Nueva carga</h3>
            <div class="space-y-md">
              <div class="flex flex-col gap-xs"><label class="font-label-md text-label-md text-on-surface-variant">Sector (RN-019)</label>
                <select id="ing-sector" class="rounded-lg border-outline-variant bg-surface-container-low py-sm px-md text-body-md focus:border-primary focus:ring-primary">
                  ${DB.sectores.map((s) => `<option>${s}</option>`).join("")}
                </select></div>
              <div class="flex flex-col gap-xs"><label class="font-label-md text-label-md text-on-surface-variant">Empresa (RN-014)</label>
                <select id="ing-empresa" class="rounded-lg border-outline-variant bg-surface-container-low py-sm px-md text-body-md focus:border-primary focus:ring-primary"></select></div>
              <div class="grid grid-cols-2 gap-sm">
                <div class="flex flex-col gap-xs"><label class="font-label-md text-label-md text-on-surface-variant">Año</label>
                  <input id="ing-anio" type="number" value="2025" min="2000" max="2030" class="rounded-lg border-outline-variant bg-surface-container-low py-sm px-md text-body-md focus:border-primary focus:ring-primary"/></div>
                <div class="flex flex-col gap-xs"><label class="font-label-md text-label-md text-on-surface-variant">Tipo (RN-011)</label>
                  <select id="ing-tipo" class="rounded-lg border-outline-variant bg-surface-container-low py-sm px-md text-body-md focus:border-primary focus:ring-primary">
                    <option>Memoria Anual</option><option>Reporte de Sostenibilidad GRI</option>
                  </select></div>
              </div>
              <label id="dropzone" class="dropzone flex flex-col items-center justify-center gap-sm border-2 border-dashed border-outline-variant rounded-xl p-lg text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                <span class="material-symbols-outlined text-[36px] text-primary">cloud_upload</span>
                <span class="text-body-md text-on-background font-medium">Arrastra el .md aquí o haz clic</span>
                <span class="font-label-sm text-label-sm text-outline">Sólo Markdown (.md) · hasta 50 MB (RNF-014)</span>
                <input id="file-input" type="file" multiple class="hidden" accept=".md,text/markdown"/>
              </label>
              <div id="ing-progress" class="hidden">
                <div class="flex justify-between font-label-sm text-label-sm text-on-surface-variant mb-xs"><span id="ing-progress-label">Procesando…</span><span id="ing-progress-pct">0%</span></div>
                <div class="w-full h-2 bg-surface-variant rounded-full overflow-hidden"><div id="ing-progress-bar" class="h-full bg-primary transition-all duration-200" style="width:0%"></div></div>
              </div>
              <p class="font-label-sm text-label-sm text-outline flex items-start gap-xs"><span class="material-symbols-outlined text-[14px]">info</span> Procesamiento síncrono: se valida, indexa y ejecuta el análisis al finalizar (RF-022).</p>
            </div>
          </div>
        </div>
        <div class="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-surface-variant shadow-sm overflow-hidden">
          <div class="p-lg border-b border-outline-variant bg-surface-bright flex justify-between items-center">
            <h3 class="font-title-lg text-title-lg text-on-surface">Documentos ingestados</h3>
            <span class="font-label-sm text-label-sm text-on-surface-variant">Estado, tipo y fecha (RF-024)</span>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead><tr class="bg-surface-container-low border-b border-outline-variant">
                ${["Documento", "Empresa", "Año", "Tipo", "Estado", "Fecha"].map((h) => `<th class="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">${h}</th>`).join("")}
              </tr></thead>
              <tbody id="ing-body" class="text-body-md">${rows}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  },
  after(root) { bindIngesta(root); }
};

function filaDoc(d) {
  const icono = d.tipo === "Reporte de Sostenibilidad GRI" ? "eco" : "description";
  const color = d.tipo === "Reporte de Sostenibilidad GRI" ? "secondary" : "primary";
  return `
    <tr data-doc="${d.id}" class="border-b border-surface-variant hover:bg-surface/50 transition-colors">
      <td class="py-md px-md"><div class="flex items-center gap-sm"><span class="material-symbols-outlined text-${color}">${icono}</span><div><p class="font-medium text-on-background">${Helpers.esc(d.empresa)} · ${d.anio}</p><p class="font-label-sm text-label-sm text-outline">${Helpers.esc(d.hash)} · ${d.tamano}</p></div></div></td>
      <td class="py-md px-md">${Helpers.esc(d.empresa)}</td>
      <td class="py-md px-md text-on-surface-variant">${d.anio}</td>
      <td class="py-md px-md">${Helpers.esc(d.tipo)}</td>
      <td class="py-md px-md" data-estado>${Badges.estadoBadge(d.estado)}</td>
      <td class="py-md px-md text-on-surface-variant whitespace-nowrap">${Helpers.esc(d.fecha)}</td>
    </tr>`;
}

function bindIngesta(root) {
  const selSector = root.querySelector("#ing-sector");
  const selEmpresa = root.querySelector("#ing-empresa");
  const dz = root.querySelector("#dropzone");
  const input = root.querySelector("#file-input");
  const body = root.querySelector("#ing-body");
  const progress = root.querySelector("#ing-progress");
  const bar = root.querySelector("#ing-progress-bar");
  const pct = root.querySelector("#ing-progress-pct");
  const progLabel = root.querySelector("#ing-progress-label");

  function refrescarEmpresas() {
    const empresas = App.state.empresas.filter((e) => e.sector === selSector.value && e.activa);
    selEmpresa.innerHTML = empresas.length
      ? empresas.map((e) => `<option value="${e.id}">${Helpers.esc(e.nombre)}</option>`).join("")
      : `<option value="">— Sin empresas en este sector —</option>`;
  }
  refrescarEmpresas();
  selSector.addEventListener("change", refrescarEmpresas);

  dz.addEventListener("click", () => input.click());
  ["dragover", "dragleave", "drop"].forEach((ev) => dz.addEventListener(ev, (e) => {
    e.preventDefault();
    dz.classList.toggle("dropzone-active", ev === "dragover");
    if (ev === "drop" && e.dataTransfer.files.length) procesar(Array.from(e.dataTransfer.files));
  }));
  input.addEventListener("change", () => { if (input.files.length) procesar(Array.from(input.files)); input.value = ""; });

  function rechazar(nombre, motivo) {
    App.pushAudit("Rechazo de documento", `Rechazó '${nombre}': ${motivo}`);
    UI.toast(`Carga rechazada: ${motivo}`, "error");
  }

  function procesar(files) {
    const empresaId = selEmpresa.value;
    const anio = parseInt(root.querySelector("#ing-anio").value, 10);
    const tipo = root.querySelector("#ing-tipo").value;
    const sector = selSector.value;
    const empresa = App.state.empresas.find((e) => e.id === empresaId);

    // RNF-027: empresa, año y tipo obligatorios.
    if (!empresa) { rechazar(files[0] ? files[0].name : "documento", "no se seleccionó una empresa válida (RNF-027)."); return; }
    if (!anio) { rechazar(files[0].name, "el año es obligatorio (RNF-027)."); return; }

    files.forEach((f) => {
      // RF-018: sólo .md.
      if (!/\.md$/i.test(f.name)) { rechazar(f.name, "el archivo no tiene extensión .md (RF-018)."); return; }
      // RNF-014: hasta 50 MB.
      if (f.size > 50 * 1024 * 1024) { rechazar(f.name, "el archivo supera los 50 MB (RNF-014)."); return; }
      // RN-033 / RF-021: unicidad empresa + tipo + año.
      const dup = App.state.documents.find((d) => d.empresaId === empresaId && d.tipo === tipo && d.anio === anio && d.estado !== "Rechazado");
      if (dup) { rechazar(f.name, `ya existe un documento de tipo '${tipo}' para ${empresa.nombre} (${anio}), cargado por ${dup.cuenta} el ${dup.fecha} (RN-033).`); return; }

      cargar(f, empresa, sector, anio, tipo);
    });

    function cargar(f, empresa, sector, anio, tipo) {
      const id = "d" + Date.now();
      const hash = "sha256:" + Math.random().toString(16).slice(2, 6) + "…" + Math.random().toString(16).slice(2, 6);
      const doc = {
        id, empresaId: empresa.id, empresa: empresa.nombre, sector, anio, tipo,
        estado: "En proceso", fecha: new Date().toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" }),
        cuenta: App.state.user.nombre, hash, tamano: (f.size / 1e6).toFixed(1) + " MB"
      };
      App.state.documents.unshift(doc);
      body.insertAdjacentHTML("afterbegin", filaDoc(doc));

      // Simulación de proceso síncrono con progreso (RNF-023).
      progress.classList.remove("hidden");
      progLabel.textContent = `Procesando '${f.name}'…`;
      let p = 0;
      const etapas = [[20, "Validando Markdown…"], [45, "Detectando códigos GRI y sanciones…"], [70, "Indexando para el asistente…"], [100, "Ejecutando análisis…"]];
      let ei = 0;
      const iv = setInterval(() => {
        p += 8;
        if (etapas[ei] && p >= etapas[ei][0]) { progLabel.textContent = etapas[ei][1]; ei++; }
        bar.style.width = Math.min(p, 100) + "%";
        pct.textContent = Math.min(p, 100) + "%";
        if (p >= 100) {
          clearInterval(iv);
          finalizar(doc, f.name);
          setTimeout(() => progress.classList.add("hidden"), 600);
        }
      }, 120);
    }

    function finalizar(doc, nombreArchivo) {
      // RF-019: el documento debe contener al menos un código GRI o una sanción.
      // (Mock: se asume superado salvo si el nombre contiene "vacio").
      const sinContenido = /vacio|empty/i.test(nombreArchivo);
      const tr = body.querySelector(`[data-doc="${doc.id}"] [data-estado]`);
      if (sinContenido) {
        doc.estado = "Rechazado";
        if (tr) tr.innerHTML = Badges.estadoBadge("Rechazado");
        rechazar(nombreArchivo, "no contiene códigos GRI ni menciones de sanción (RF-019).");
        return;
      }
      doc.estado = "Éxito";
      if (tr) tr.innerHTML = Badges.estadoBadge("Éxito");
      App.pushAudit("Ingesta de documento", `Ingestó '${doc.empresa} · ${doc.anio}' (${doc.tipo}, ${doc.sector})`);
      UI.toast(`Documento de ${doc.empresa} (${doc.anio}) ingestado e indexado.`, "success");
    }
  }
}
