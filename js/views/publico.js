Views.publico = {
  html() {
    const t = (k) => DB.i18n[App.state.lang][k];
    return `
      <header class="sticky top-0 z-30 bg-surface-bright border-b border-surface-variant">
        <div class="max-w-container-max mx-auto px-lg py-sm flex items-center justify-between">
          <img src="assets/Logo.webp" alt="Igualab" class="h-9 object-contain"/>
          <div class="flex items-center gap-md">
            <label class="font-label-sm text-label-sm text-on-surface-variant uppercase">${t("langLabel")}:</label>
            <select id="pub-lang" class="rounded-lg border-outline-variant bg-surface-container-lowest py-sm px-md text-body-md focus:border-primary focus:ring-primary">
              ${[["es", "Español"], ["en", "English"], ["qu", "Runasimi (Quechua)"]].map(([v, l]) => `<option value="${v}" ${App.state.lang === v ? "selected" : ""}>${l}</option>`).join("")}
            </select>
            <a href="#/login" class="px-md py-sm rounded-lg bg-primary text-on-primary text-label-md font-semibold hover:bg-surface-tint transition-colors">Iniciar sesión</a>
          </div>
        </div>
      </header>
      <section class="relative overflow-hidden">
        <div class="absolute -top-24 -right-24 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl"></div>
        <div class="max-w-container-max mx-auto px-lg py-xl text-center relative">
          <span class="inline-flex items-center gap-xs px-3 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm mb-md"><span class="material-symbols-outlined text-[14px]">public</span> ${t("publicPortal")} · ${t("readMode")}</span>
          <h1 class="font-headline-lg text-headline-lg text-on-background max-w-3xl mx-auto">${t("heroTitle")}</h1>
          <p class="text-body-lg text-on-surface-variant max-w-2xl mx-auto mt-md">${t("heroSub")}</p>
          <div class="max-w-xl mx-auto mt-xl relative flex items-center">
            <span class="material-symbols-outlined absolute left-[12px] text-outline-variant">search</span>
            <input id="pub-search" class="w-full h-[52px] pl-[44px] pr-[12px] rounded-xl border border-outline-variant bg-surface-container-lowest text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="${t("searchPlaceholder")}"/>
          </div>
        </div>
      </section>
      <main class="max-w-container-max mx-auto px-lg pb-xl w-full flex-1">
        <h2 class="font-title-lg text-title-lg text-on-background mb-lg flex items-center gap-sm">${t("resultsTitle")} <span class="font-label-sm text-label-sm text-on-surface-variant">(${t("readMode")})</span></h2>
        <div id="pub-results" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-lg"></div>
      </main>
      <footer class="border-t border-surface-variant bg-surface-bright py-lg text-center">
        <p class="font-label-sm text-label-sm text-outline">${t("footer")}</p>
      </footer>
      <button id="pub-chatbot-btn" class="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-secondary text-on-secondary shadow-[0_12px_32px_rgba(0,106,97,0.4)] flex items-center justify-center hover:scale-105 transition-transform" aria-label="Chatbot de citas" title="${t("chatbotTitle")}">
        <span class="material-symbols-outlined text-[28px]">support_agent</span>
        <span class="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-[9px] font-bold">F2</span>
      </button>
      <div id="pub-chatbot" class="hidden fixed bottom-24 right-6 z-40 w-[360px] max-w-[calc(100vw-2rem)] bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-[0_12px_32px_rgba(0,0,0,0.16)] flex-col overflow-hidden" style="max-height:70vh">
        <div class="p-md bg-secondary text-on-secondary flex justify-between items-center">
          <div class="flex items-center gap-sm"><span class="material-symbols-outlined">support_agent</span><div><p class="font-label-md text-label-md font-bold">${t("chatbotTitle")}</p><p class="text-[10px] opacity-80">${t("fase2")}</p></div></div>
          <button id="pub-chatbot-close" class="p-1 hover:bg-white/10 rounded" aria-label="Cerrar"><span class="material-symbols-outlined text-[20px]">close</span></button>
        </div>
        <div id="chatbot-log" class="flex-1 overflow-y-auto chat-scroll p-md space-y-md text-body-md" role="log" aria-live="polite" style="min-height:220px"></div>
      </div>`;
  },
  after(root) {
    const t = (k) => DB.i18n[App.state.lang][k];
    const results = root.querySelector("#pub-results");
    const nombreDoc = (d) => `${d.tipo} ${d.anio} - ${d.empresa}`;
    function renderResults(q = "") {
      q = q.toLowerCase();
      const docs = App.state.documents.filter((d) => d.estado === "Éxito" && (!q || nombreDoc(d).toLowerCase().includes(q) || d.empresa.toLowerCase().includes(q) || d.tipo.toLowerCase().includes(q)));
      results.innerHTML = docs.length ? docs.map((d) => `
        <div class="bg-surface-container-lowest rounded-xl border border-surface-variant p-lg ambient-shadow ambient-shadow-hover flex flex-col">
          <div class="flex justify-between items-start mb-sm">
            <span class="material-symbols-outlined text-${d.tipo === "Reporte de Sostenibilidad GRI" ? "secondary" : "primary"} text-[28px]">description</span>
            <span class="inline-flex items-center px-2 py-1 rounded-full bg-surface-container-low border border-outline-variant font-label-sm text-label-sm text-on-surface-variant">${Helpers.esc(d.sector)}</span>
          </div>
          <h3 class="text-body-lg font-semibold text-on-background mb-xs">${Helpers.esc(nombreDoc(d))}</h3>
          <p class="font-label-sm text-label-sm text-on-surface-variant mb-md">${Helpers.esc(d.empresa)} · ${d.anio} · ${Helpers.esc(d.tipo)}</p>
          <button data-ver-doc="${d.id}" class="mt-auto flex items-center justify-center gap-sm w-full py-sm rounded-lg border border-primary text-primary text-label-md font-semibold hover:bg-primary/5 transition-colors"><span class="material-symbols-outlined text-[16px]">menu_book</span> ${t("verDoc")}</button>
        </div>`).join("") : `<p class="text-body-md text-on-surface-variant">${t("noResults")}</p>`;
      results.querySelectorAll("[data-ver-doc]").forEach((b) => b.addEventListener("click", () => {
        const d = App.state.documents.find((x) => x.id === b.dataset.verDoc);
        Modal.open(`
          <div class="flex justify-between items-center p-lg border-b border-outline-variant">
            <h3 class="font-title-lg text-title-lg text-on-surface flex items-center gap-sm"><span class="material-symbols-outlined text-primary">menu_book</span> ${Helpers.esc(nombreDoc(d))}</h3>
            <button data-modal-close class="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant"><span class="material-symbols-outlined">close</span></button>
          </div>
          <div class="p-xl">
            <div class="flex flex-wrap gap-sm mb-lg">${[d.empresa, d.anio, d.tipo, d.sector].map((x) => `<span class="px-3 py-1 rounded-full bg-surface-container-low border border-outline-variant font-label-sm text-label-sm">${Helpers.esc(x)}</span>`).join("")}</div>
            <div class="bg-surface-container-low rounded-lg p-lg border border-outline-variant">
              <p class="text-body-md text-on-surface leading-relaxed mb-md">Este documento se muestra en modo <strong>solo lectura</strong> para el público. Las funciones de prospección (asistente IA, reportes) están reservadas a usuarios internos.</p>
              <div class="space-y-sm">
                <div class="h-4 bg-surface-container-high rounded w-full"></div>
                <div class="h-4 bg-surface-container-high rounded w-[92%]"></div>
                <div class="h-4 bg-surface-container-high rounded w-[96%]"></div>
                <div class="h-4 bg-surface-container-high rounded w-[85%]"></div>
              </div>
            </div>
            <p class="font-label-sm text-label-sm text-outline mt-lg">Vista previa simulada · ${d.tamano} · ${Helpers.esc(d.fecha)}</p>
          </div>`);
      }));
    }
    renderResults();
    root.querySelector("#pub-search").addEventListener("input", (e) => renderResults(e.target.value));
    root.querySelector("#pub-lang").addEventListener("change", () => { App.state.lang = root.querySelector("#pub-lang").value; App.renderPublic(); });

    const bot = root.querySelector("#pub-chatbot");
    const log = root.querySelector("#chatbot-log");
    root.querySelector("#pub-chatbot-btn").addEventListener("click", () => { bot.classList.toggle("hidden"); bot.classList.toggle("flex"); if (bot.classList.contains("flex") && !log.dataset.started) chatIntro(); });
    root.querySelector("#pub-chatbot-close").addEventListener("click", () => { bot.classList.add("hidden"); bot.classList.remove("flex"); });

    function bubble(text, opts = []) {
      const el = document.createElement("div");
      el.className = "bg-surface-container-low border border-outline-variant rounded-xl rounded-tl-sm p-md text-on-surface";
      el.innerHTML = `<p>${text}</p>`;
      if (opts.length) {
        const wrap = document.createElement("div");
        wrap.className = "flex flex-wrap gap-sm mt-md";
        opts.forEach((o) => {
          const b = document.createElement("button");
          b.className = "px-3 py-2 rounded-lg bg-primary text-on-primary text-label-md font-semibold hover:bg-surface-tint transition-colors text-left";
          b.textContent = o.label;
          b.addEventListener("click", o.fn);
          wrap.appendChild(b);
        });
        el.appendChild(wrap);
      }
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
    }
    function userBubble(text) {
      const el = document.createElement("div");
      el.className = "bg-primary-container text-on-primary-container rounded-xl rounded-tr-sm p-md ml-auto w-fit max-w-[85%]";
      el.textContent = text;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
    }
    function chatIntro() {
      log.dataset.started = "1";
      bubble(t("chatbotIntro"), [
        { label: "📅 " + t("optAgendar"), fn: () => { userBubble(t("optAgendar")); pasoHorarios(); } },
        { label: "💬 " + t("optConsulta"), fn: () => { userBubble(t("optConsulta")); bubble(t("consultaMsg")); } }
      ]);
    }
    function pasoHorarios() {
      bubble(t("horariosTitle"), DB.horarios.map((h) => ({ label: h, fn: () => { userBubble(h); pasoConfirmar(h); } })));
    }
    function pasoConfirmar(h) {
      bubble(`${h}. ¿Confirmas?`, [
        { label: "✅ " + t("confirmar"), fn: () => { userBubble(t("confirmar")); bubble(t("agendada")); } }
      ]);
    }
  }
};
