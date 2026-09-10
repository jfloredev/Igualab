const App = (() => {
  const state = {
    logged: false,
    role: null,
    user: null,
    lang: "es",
    config: { minutos: 30, bloqueo: true, notif: false },
    users: [...DB.users],
    documents: [...DB.documents],
    reports: [...DB.reports],
    audit: [...DB.audit]
  };

  const MENUS = {
    superadmin: [
      { key: "dashboard", label: "Dashboard", icon: "dashboard" },
      { key: "usuarios", label: "Usuarios y roles", icon: "group" },
      { key: "ingesta", label: "Ingesta de documentos", icon: "upload_file" },
      { key: "config", label: "Configuración", icon: "settings" },
      { key: "auditoria", label: "Auditoría de accesos", icon: "history" }
    ],
    administrador: [
      { key: "dashboard", label: "Dashboard", icon: "dashboard" },
      { key: "ia", label: "Asistente de IA", icon: "psychology" },
      { key: "reportes", label: "Reportes de prospección", icon: "assessment" },
      { key: "descargas", label: "Descargar reportes", icon: "download" }
    ]
  };

  let idleTimer = null;
  let timerInterval = null;

  function save() {
    try {
      localStorage.setItem("igualab-mock", JSON.stringify({
        users: state.users,
        documents: state.documents,
        reports: state.reports,
        audit: state.audit,
        config: state.config
      }));
    } catch (e) { /* noop */ }
  }

  function load() {
    try {
      const raw = localStorage.getItem("igualab-mock");
      if (!raw) return;
      const d = JSON.parse(raw);
      Object.assign(state, {
        users: d.users || state.users,
        documents: d.documents || state.documents,
        reports: d.reports || state.reports,
        audit: d.audit || state.audit,
        config: d.config || state.config
      });
    } catch (e) { /* noop */ }
  }

  function now() {
    return new Date().toLocaleString("es-PE", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", "");
  }

  function pushAudit(tipo, accion) {
    state.audit.push({ id: Date.now(), fecha: now(), usuario: state.user ? state.user.nombre : "Sistema", tipo, accion });
    save();
  }

  function show(screen) {
    ["screen-login", "screen-app", "screen-public"].forEach((id) => document.getElementById(id).classList.add("hidden"));
    document.getElementById(screen).classList.remove("hidden");
    document.getElementById("role-switcher").classList.toggle("hidden", screen !== "screen-app");
  }

  function renderSidebar() {
    const nav = document.getElementById("sidebar-nav");
    const items = MENUS[state.role] || [];
    const current = (location.hash || "#/dashboard").split("/")[1];
    nav.innerHTML = items.map((m) => `
      <a href="#/${m.key}" class="nav-item ${m.key === current ? "active" : ""}">
        <span class="material-symbols-outlined ${m.key === current ? "filled" : ""}">${m.icon}</span>
        <span class="text-body-md">${m.label}</span>
      </a>`).join("") + `
      <div class="mt-xl px-sm ${state.role === "administrador" ? "" : "hidden"}">
        <a href="#/ia" class="w-full flex items-center justify-center gap-sm bg-primary text-on-primary px-lg py-sm rounded-lg text-label-md font-bold hover:bg-primary-container transition-colors shadow-sm">
          <span class="material-symbols-outlined filled text-lg">auto_awesome</span> Nueva Consulta AI
        </a>
      </div>`;
  }

  function renderProfile() {
    const initials = state.user.nombre.split(" ").map((n) => n[0]).slice(0, 2).join("");
    ["sidebar-avatar", "header-avatar"].forEach((id) => { document.getElementById(id).textContent = initials; });
    document.getElementById("sidebar-name").textContent = state.user.nombre;
    document.getElementById("header-name").textContent = state.user.nombre;
    const label = DB.roleLabels[state.role];
    document.getElementById("sidebar-role").textContent = label;
    document.getElementById("header-role").textContent = label;
  }

  function currentKey() {
    const k = (location.hash || "#/dashboard").split("/")[1] || "dashboard";
    return k === "login" || k === "publico" ? "dashboard" : k;
  }

  function render() {
    const allowed = (MENUS[state.role] || []).map((m) => m.key);
    let key = currentKey();
    if (!allowed.includes(key)) {
      key = allowed[0];
      location.hash = "#/" + key;
      return;
    }
    renderSidebar();
    renderProfile();
    const view = document.getElementById("view");
    const v = Views[key];
    view.innerHTML = v.html();
    view.scrollTop = 0;
    if (v.after) v.after(view);
    bindViewActions(view);
  }

  function rerender() { render(); }

  function renderPublic() {
    show("screen-public");
    const screen = document.getElementById("screen-public");
    screen.innerHTML = Views.publico.html();
    Views.publico.after(screen);
  }

  function route() {
    const key = (location.hash || "#/dashboard").split("/")[1];
    if (!state.logged) {
      if (key === "publico") { renderPublic(); }
      else show("screen-login");
      return;
    }
    if (key === "publico") { renderPublic(); return; }
    show("screen-app");
    render();
  }

  function bindViewActions(root) {
    root.querySelectorAll("[data-action]").forEach((el) => {
      el.addEventListener("click", () => {
        const a = el.dataset.action;
        if (a === "crear-usuario") userForm(null);
        if (a === "cfg-save") saveConfig(root);
        if (a === "cfg-cancel") UI.toast("Cambios descartados.", "info");
        if (a === "export-audit") exportCSV("auditoria");
        if (a === "export-bolsa") exportCSV("bolsa");
        if (a === "go-auditoria") { location.hash = "#/auditoria"; }
        if (a === "aud-clear") ["#aud-tipo", "#aud-user", "#aud-desde", "#aud-hasta"].forEach((s) => { root.querySelector(s).value = ""; root.querySelector(s).dispatchEvent(new Event("change")); });
      });
    });
    root.querySelectorAll("[data-editar]").forEach((b) => b.addEventListener("click", () => userForm(state.users.find((u) => u.id == b.dataset.editar))));
    root.querySelectorAll("[data-baja]").forEach((b) => b.addEventListener("click", () => baja(state.users.find((u) => u.id == b.dataset.baja))));
    root.querySelectorAll("[data-revocar]").forEach((b) => b.addEventListener("click", () => revocar(state.users.find((u) => u.id == b.dataset.revocar))));
  }

  function userForm(u) {
    const esNuevo = !u;
    const overlay = UI.modal(`
      <div class="p-xl">
        <h3 class="font-title-lg text-title-lg text-on-background mb-lg flex items-center gap-sm"><span class="material-symbols-outlined text-primary">person_${esNuevo ? "add" : "edit"}</span> ${esNuevo ? "Crear usuario" : "Editar usuario"}</h3>
        <div class="space-y-md">
          <div class="flex flex-col gap-xs"><label class="font-label-md text-label-md text-on-surface-variant">Nombre completo</label>
            <input id="uf-nombre" value="${u ? UI.esc(u.nombre) : ""}" class="rounded-xl border-outline-variant py-sm px-md text-body-md focus:border-primary focus:ring-primary" placeholder="Ej. Ana García"/></div>
          <div class="flex flex-col gap-xs"><label class="font-label-md text-label-md text-on-surface-variant">Correo electrónico</label>
            <input id="uf-correo" type="email" value="${u ? UI.esc(u.correo) : ""}" class="rounded-xl border-outline-variant py-sm px-md text-body-md focus:border-primary focus:ring-primary" placeholder="ana@igualab.org"/></div>
          <div class="flex flex-col gap-xs"><label class="font-label-md text-label-md text-on-surface-variant">Rol</label>
            <select id="uf-rol" class="rounded-xl border-outline-variant py-sm px-md text-body-md focus:border-primary focus:ring-primary">
              ${Object.entries(DB.roleLabels).map(([k, l]) => `<option value="${k}" ${u && u.rol === k ? "selected" : ""}>${l}</option>`).join("")}
            </select></div>
          <div id="uf-error" class="hidden rounded-lg bg-error-container text-on-error-container px-md py-sm text-body-md"></div>
        </div>
        <div class="flex justify-end gap-sm mt-lg">
          <button data-modal-close class="px-lg py-sm rounded-lg border border-outline-variant text-body-md text-on-surface-variant hover:bg-surface-container-low">Cancelar</button>
          <button id="uf-save" class="px-lg py-sm rounded-lg bg-primary text-on-primary text-label-md font-semibold hover:bg-surface-tint">${esNuevo ? "Crear" : "Guardar"}</button>
        </div>
      </div>`);
    overlay.querySelector("#uf-save").addEventListener("click", () => {
      const nombre = overlay.querySelector("#uf-nombre").value.trim();
      const correo = overlay.querySelector("#uf-correo").value.trim();
      const rol = overlay.querySelector("#uf-rol").value;
      const err = overlay.querySelector("#uf-error");
      const dup = state.users.find((x) => x.correo === correo && x.id !== (u ? u.id : -1));
      if (!nombre || !correo) { err.textContent = "Nombre y correo son obligatorios."; err.classList.remove("hidden"); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) { err.textContent = "Formato de correo inválido."; err.classList.remove("hidden"); return; }
      if (dup) { err.textContent = "Correo duplicado: ya existe un usuario con ese correo."; err.classList.remove("hidden"); return; }
      if (esNuevo) {
        state.users.push({ id: Date.now(), nombre, correo, rol, estado: "Activo" });
        pushAudit("Cambio de rol", `Creó usuario '${nombre}' con rol ${DB.roleLabels[rol]}`);
        UI.toast("Usuario creado y activo.", "success");
      } else {
        Object.assign(u, { nombre, correo, rol });
        pushAudit("Cambio de rol", `Editó usuario '${nombre}' (rol: ${DB.roleLabels[rol]})`);
        UI.toast("Usuario actualizado.", "success");
      }
      save(); UI.closeModal(); render();
    });
  }

  function baja(u) {
    const overlay = UI.modal(`
      <div class="p-xl text-center">
        <span class="material-symbols-outlined text-[48px] text-tertiary">person_off</span>
        <h3 class="font-title-lg text-title-lg text-on-background mt-md">Dar de baja a ${UI.esc(u.nombre)}?</h3>
        <p class="text-body-md text-on-surface-variant mt-sm">La cuenta se desactivará (baja lógica) conservando su historial para trazabilidad.</p>
        <div class="flex justify-center gap-sm mt-lg">
          <button data-modal-close class="px-lg py-sm rounded-lg border border-outline-variant text-body-md text-on-surface-variant">Cancelar</button>
          <button id="baja-ok" class="px-lg py-sm rounded-lg bg-tertiary text-on-tertiary text-label-md font-semibold">Dar de baja</button>
        </div>
      </div>`);
    overlay.querySelector("#baja-ok").addEventListener("click", () => {
      u.estado = "Inactivo";
      pushAudit("Cambio de rol", `Dio de baja (lógica) a '${u.nombre}'`);
      save(); UI.closeModal(); render();
      UI.toast("Usuario desactivado. Historial conservado.", "success");
    });
  }

  function revocar(u) {
    const overlay = UI.modal(`
      <div class="p-xl text-center">
        <span class="material-symbols-outlined text-[48px] text-error">no_accounts</span>
        <h3 class="font-title-lg text-title-lg text-on-background mt-md">Revocar rol de ${UI.esc(u.nombre)}?</h3>
        <p class="text-body-md text-on-surface-variant mt-sm">Se revocará el rol de Administrador y el acceso quedará deshabilitado.</p>
        <div class="flex justify-center gap-sm mt-lg">
          <button data-modal-close class="px-lg py-sm rounded-lg border border-outline-variant text-body-md text-on-surface-variant">Cancelar</button>
          <button id="rev-ok" class="px-lg py-sm rounded-lg bg-error text-on-error text-label-md font-semibold">Revocar rol</button>
        </div>
      </div>`);
    overlay.querySelector("#rev-ok").addEventListener("click", () => {
      u.estado = "Inactivo";
      pushAudit("Cambio de rol", `Revocó rol de Administrador a '${u.nombre}' → acceso deshabilitado`);
      save(); UI.closeModal(); render();
      UI.toast("Rol revocado. Acceso deshabilitado.", "success");
    });
  }

  function saveConfig(root) {
    state.config = {
      minutos: parseInt(root.querySelector("#cfg-min").value, 10),
      bloqueo: root.querySelector("#cfg-bloqueo").checked,
      notif: root.querySelector("#cfg-notif").checked
    };
    pushAudit("Configuración", `Ajustó expiración de sesión a ${state.config.minutos} minutos`);
    save(); render(); startIdleWatch();
    UI.toast("Configuración aplicada y registrada en auditoría.", "success");
  }

  function exportCSV(tipo) {
    let rows, name;
    if (tipo === "auditoria") {
      rows = [["fecha", "usuario", "tipo", "accion"]].concat(state.audit.map((a) => [a.fecha, a.usuario, a.tipo, a.accion]));
      name = "auditoria_igualab.csv";
    } else {
      const pIdx = 0;
      rows = [["empresa", "ticker", "sector", "precio", "emisiones", "intensidad"]].concat(DB.empresas.map((e) => [e.nombre, e.ticker, e.sector, DB.bolsa.series[e.id].precio[pIdx], DB.bolsa.series[e.id].emisiones[pIdx], DB.bolsa.series[e.id].intensidad[pIdx]]));
      name = "bolsa_igualab.csv";
    }
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    UI.toast("Exportado: " + name, "success");
  }

  function startIdleWatch() {
    clearInterval(timerInterval);
    clearTimeout(idleTimer);
    if (!state.logged) return;
    let remaining = state.config.minutos * 60;
    const timerEl = document.getElementById("session-timer");
    timerEl.classList.remove("hidden");
    const fmt = () => `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;
    timerEl.textContent = "Sesión activa · " + fmt();
    timerInterval = setInterval(() => {
      remaining--;
      if (remaining <= 60) timerEl.textContent = "Sesión activa · " + fmt();
    }, 1000);
    resetIdle();
    ["mousemove", "keydown", "click", "scroll"].forEach((ev) => document.addEventListener(ev, resetIdle, { passive: true }));
    function resetIdle() {
      remaining = state.config.minutos * 60;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        clearInterval(timerInterval);
        logout(true);
      }, state.config.minutos * 60 * 1000);
    }
  }

  function logout(expired = false) {
    pushAudit("Inicio de sesión", expired ? "Sesión expirada por inactividad (RNF-01)" : "Cierre de sesión");
    state.logged = false;
    state.user = null;
    state.role = null;
    clearInterval(timerInterval);
    clearTimeout(idleTimer);
    location.hash = "#/login";
    route();
    UI.toast(expired ? "Tu sesión expiró por inactividad. Vuelve a autenticarte." : "Sesión cerrada.", expired ? "warn" : "info");
  }

  const ROLES_VALIDOS = ["superadmin", "administrador"];

  function login(correo, pass) {
    const err = document.getElementById("login-error");
    err.classList.add("hidden");

    // Mock sin restricciones: siempre entra.
    // Si el correo coincide con un usuario, se usa; si no, entra con uno por defecto.
    const user =
      state.users.find((u) => correo && u.correo.toLowerCase() === correo.toLowerCase()) ||
      state.users.find((u) => u.estado === "Activo" && ROLES_VALIDOS.includes(u.rol)) ||
      state.users[0];

    state.logged = true;
    state.user = user;
    state.role = user.rol;
    pushAudit("Inicio de sesión", `Login exitoso (${DB.roleLabels[user.rol]})`);
    location.hash = "#/dashboard";
    route();
    startIdleWatch();
    UI.toast(`Bienvenido, ${user.nombre.split(" ")[0]} · ${DB.roleLabels[user.rol]}`, "success");
  }

  function bindGlobal() {
    document.getElementById("form-login").addEventListener("submit", (e) => {
      e.preventDefault();
      login(document.getElementById("login-email").value.trim(), document.getElementById("login-pass").value);
    });
    document.getElementById("toggle-pass").addEventListener("click", () => {
      const p = document.getElementById("login-pass");
      p.type = p.type === "password" ? "text" : "password";
    });
    document.getElementById("forgot-pass").addEventListener("click", (e) => {
      e.preventDefault();
      UI.modal(`
        <div class="p-xl text-center">
          <span class="material-symbols-outlined text-[48px] text-primary">lock_reset</span>
          <h3 class="font-title-lg text-title-lg text-on-background mt-md">Recuperar contraseña</h3>
          <p class="text-body-md text-on-surface-variant mt-sm">Te enviaremos un enlace de recuperación al correo registrado.</p>
          <input id="fp-mail" class="w-full mt-lg rounded-xl border-outline-variant py-sm px-md text-body-md focus:border-primary focus:ring-primary" placeholder="tu@igualab.org"/>
          <div class="flex justify-center gap-sm mt-lg">
            <button data-modal-close class="px-lg py-sm rounded-lg border border-outline-variant text-body-md text-on-surface-variant">Cancelar</button>
            <button id="fp-send" class="px-lg py-sm rounded-lg bg-primary text-on-primary text-label-md font-semibold">Enviar enlace</button>
          </div>
        </div>`);
      document.getElementById("fp-send").addEventListener("click", () => { UI.closeModal(); UI.toast("Enlace de recuperación enviado por correo.", "success"); });
    });
    document.querySelectorAll("[data-action='logout'], [data-action='logout'] *").forEach(() => { });
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-action='logout']");
      if (t) { e.preventDefault(); logout(false); }
    });
    document.getElementById("role-select").addEventListener("change", (e) => {
      const nuevo = e.target.value;
      const acc = DB.demoAccounts[nuevo];
      state.role = nuevo;
      state.user = state.users.find((u) => u.correo === acc.correo) || { nombre: acc.nombre, correo: acc.correo };
      pushAudit("Cambio de rol", `Demo: sesión como ${DB.roleLabels[nuevo]} (${state.user.nombre})`);
      render();
      UI.toast(`Ahora navegando como ${DB.roleLabels[nuevo]}`, "info");
    });
    window.addEventListener("hashchange", route);
  }

  function init() {
    load();
    bindGlobal();
    route();
  }

  return { state, pushAudit, rerender, renderPublic, init };
})();

document.addEventListener("DOMContentLoaded", App.init);
