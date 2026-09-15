const App = (() => {
  const state = {
    logged: false,
    role: null,
    user: null,
    lang: "es",
    // RF-005: expiración por inactividad (2 horas por defecto). RN-036.
    config: { minutos: 120, bloqueo: true, notif: false },
    users: [...DB.users],
    empresas: JSON.parse(JSON.stringify(DB.empresas)),
    documents: JSON.parse(JSON.stringify(DB.documents)),
    reports: [...DB.reports],
    audit: [...DB.audit],
    analisis: JSON.parse(JSON.stringify(DB.analisis))
  };

  const MENUS = {
    superadmin: [
      { key: "usuarios", label: "Usuarios y roles", icon: "group" },
      { key: "ingesta", label: "Ingesta de documentos", icon: "upload_file" },
      { key: "auditoria", label: "Auditoría", icon: "history" }
    ],
    administrador: [
      { key: "ia", label: "Asistente de IA", icon: "psychology" },
      { key: "reportes", label: "Reportes de prospección", icon: "assessment" },
      { key: "descargas", label: "Descargar reportes", icon: "download" }
    ]
  };

  let idleTimer = null;
  let timerInterval = null;

  function save() {
    try {
      localStorage.setItem("igualab-mock-v2", JSON.stringify({
        users: state.users,
        empresas: state.empresas,
        documents: state.documents,
        reports: state.reports,
        audit: state.audit,
        analisis: state.analisis,
        config: state.config
      }));
    } catch (e) { /* noop */ }
  }

  function load() {
    try {
      const raw = localStorage.getItem("igualab-mock-v2");
      if (!raw) return;
      const d = JSON.parse(raw);
      Object.assign(state, {
        users: d.users || state.users,
        empresas: d.empresas || state.empresas,
        documents: d.documents || state.documents,
        reports: d.reports || state.reports,
        audit: d.audit || state.audit,
        analisis: d.analisis || state.analisis,
        config: d.config || state.config
      });
    } catch (e) { /* noop */ }
  }

  function now() {
    return new Date().toLocaleString("es-PE", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).replace(",", "");
  }

  // RN-027 / RN-028: registro automático e inmutable (cuenta, fecha, hora, tipo).
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
          <span class="material-symbols-outlined filled text-lg">auto_awesome</span> Nueva consulta IA
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
        if (a === "crear-empresa") empresaForm();
        if (a === "export-audit") exportCSV("auditoria");
        if (a === "go-auditoria") { location.hash = "#/auditoria"; }
        if (a === "aud-clear") ["#aud-tipo", "#aud-user", "#aud-desde", "#aud-hasta"].forEach((s) => { root.querySelector(s).value = ""; root.querySelector(s).dispatchEvent(new Event("change")); });
      });
    });
    root.querySelectorAll("[data-editar]").forEach((b) => b.addEventListener("click", () => userForm(state.users.find((u) => u.id == b.dataset.editar))));
    root.querySelectorAll("[data-toggle]").forEach((b) => b.addEventListener("click", () => toggleEstado(state.users.find((u) => u.id == b.dataset.toggle))));
    root.querySelectorAll("[data-transferir]").forEach((b) => b.addEventListener("click", () => transferirSuperadmin(state.users.find((u) => u.id == b.dataset.transferir))));
  }

  // --- Usuarios --------------------------------------------------------------
  // RN-008: la app crea siempre cuentas Administrador. RN-007: nombre, correo, contraseña.
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
          ${esNuevo ? `
          <div class="flex flex-col gap-xs"><label class="font-label-md text-label-md text-on-surface-variant">Contraseña temporal</label>
            <input id="uf-pass" type="text" class="rounded-xl border-outline-variant py-sm px-md text-body-md focus:border-primary focus:ring-primary" placeholder="Mín. 8 · mayús., minús., dígito y símbolo"/>
            <p class="font-label-sm text-label-sm text-outline">RNF-001: mínimo 8 caracteres con mayúscula, minúscula, dígito y carácter especial.</p></div>
          <div class="flex items-center gap-sm rounded-lg bg-surface-container-low p-sm border border-outline-variant">
            <span class="material-symbols-outlined text-secondary text-[18px]">badge</span>
            <p class="font-label-sm text-label-sm text-on-surface-variant">La cuenta se crea con rol <strong class="text-on-surface">Administrador</strong> (RN-008). El rol SuperAdmin sólo se obtiene por transferencia.</p>
          </div>` : `
          <div class="flex items-center gap-sm rounded-lg bg-surface-container-low p-sm border border-outline-variant">
            <span class="material-symbols-outlined text-secondary text-[18px]">badge</span>
            <p class="font-label-sm text-label-sm text-on-surface-variant">Rol actual: <strong class="text-on-surface">${DB.roleLabels[u.rol]}</strong></p>
          </div>`}
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
      const err = overlay.querySelector("#uf-error");
      const showErr = (m) => { err.textContent = m; err.classList.remove("hidden"); };
      // RN-011 (unicidad de correo → RF-011).
      const dup = state.users.find((x) => x.correo.toLowerCase() === correo.toLowerCase() && x.id !== (u ? u.id : -1));
      if (!nombre || !correo) return showErr("Nombre y correo son obligatorios.");
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) return showErr("Formato de correo inválido.");
      if (dup) return showErr("Ya existe una cuenta con ese correo (RF-011).");
      if (esNuevo) {
        const pass = overlay.querySelector("#uf-pass").value;
        if (!passwordValida(pass, correo)) return showErr("La contraseña debe tener al menos 8 caracteres e incluir mayúscula, minúscula, dígito y carácter especial (RNF-001).");
        state.users.push({ id: Date.now(), nombre, correo, rol: "administrador", estado: "Activo" });
        pushAudit("Cambio de rol", `Creó la cuenta '${nombre}' con rol Administrador`);
        UI.toast("Cuenta creada como Administrador y habilitada.", "success");
      } else {
        Object.assign(u, { nombre, correo });
        pushAudit("Cambio de rol", `Editó los datos de la cuenta '${nombre}'`);
        UI.toast("Cuenta actualizada.", "success");
      }
      save(); UI.closeModal(); render();
    });
  }

  // RNF-001: complejidad mínima de contraseña.
  function passwordValida(p, correo) {
    if (!p || p.length < 8) return false;
    if (correo && p.toLowerCase() === correo.toLowerCase()) return false;
    return /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p) && /[^A-Za-z0-9]/.test(p);
  }

  // RF-012 / RN-005: habilitar / deshabilitar cuentas de Administrador.
  // RF-013 / RN-002: el SuperAdmin no puede deshabilitarse (debe transferirse el rol).
  function toggleEstado(u) {
    if (u.rol === "superadmin") {
      UI.toast("No puedes deshabilitar la cuenta SuperAdmin. Transfiere el rol primero (RF-013).", "warn");
      return;
    }
    const habilitar = u.estado === "Inactivo";
    const overlay = UI.modal(`
      <div class="p-xl text-center">
        <span class="material-symbols-outlined text-[48px] ${habilitar ? "text-primary" : "text-tertiary"}">${habilitar ? "how_to_reg" : "person_off"}</span>
        <h3 class="font-title-lg text-title-lg text-on-background mt-md">${habilitar ? "Habilitar" : "Deshabilitar"} a ${UI.esc(u.nombre)}?</h3>
        <p class="text-body-md text-on-surface-variant mt-sm">${habilitar ? "La cuenta recuperará el acceso a la plataforma." : "Perderá acceso inmediato y se cerrará su sesión activa (RN-005). El historial se conserva."}</p>
        <div class="flex justify-center gap-sm mt-lg">
          <button data-modal-close class="px-lg py-sm rounded-lg border border-outline-variant text-body-md text-on-surface-variant">Cancelar</button>
          <button id="tg-ok" class="px-lg py-sm rounded-lg ${habilitar ? "bg-primary text-on-primary" : "bg-tertiary text-on-tertiary"} text-label-md font-semibold">${habilitar ? "Habilitar" : "Deshabilitar"}</button>
        </div>
      </div>`);
    overlay.querySelector("#tg-ok").addEventListener("click", () => {
      u.estado = habilitar ? "Activo" : "Inactivo";
      pushAudit("Cambio de rol", `${habilitar ? "Habilitó" : "Deshabilitó"} la cuenta de '${u.nombre}'`);
      save(); UI.closeModal(); render();
      UI.toast(`Cuenta ${habilitar ? "habilitada" : "deshabilitada"}.`, "success");
    });
  }

  // RN-009 / RF-014 / RF-015: transferencia atómica del rol SuperAdmin.
  function transferirSuperadmin(destino) {
    if (destino.rol === "superadmin") { UI.toast("Esta cuenta ya es SuperAdmin.", "info"); return; }
    if (destino.estado !== "Activo") { UI.toast("La cuenta destino debe estar habilitada (RF-015).", "warn"); return; }
    const origen = state.users.find((x) => x.rol === "superadmin");
    const overlay = UI.modal(`
      <div class="p-xl text-center">
        <span class="material-symbols-outlined text-[48px] text-tertiary">swap_horiz</span>
        <h3 class="font-title-lg text-title-lg text-on-background mt-md">Transferir rol SuperAdmin</h3>
        <p class="text-body-md text-on-surface-variant mt-sm">Se transferirá el rol <strong>SuperAdmin</strong> de <strong>${UI.esc(origen.nombre)}</strong> a <strong>${UI.esc(destino.nombre)}</strong>.</p>
        <p class="text-body-md text-on-surface-variant mt-sm">La operación es <strong>atómica</strong>: la cuenta origen pasará a Administrador (RN-009). Debe existir siempre una sola cuenta SuperAdmin (RN-002).</p>
        <div class="flex justify-center gap-sm mt-lg">
          <button data-modal-close class="px-lg py-sm rounded-lg border border-outline-variant text-body-md text-on-surface-variant">Cancelar</button>
          <button id="tr-ok" class="px-lg py-sm rounded-lg bg-tertiary text-on-tertiary text-label-md font-semibold">Confirmar transferencia</button>
        </div>
      </div>`);
    overlay.querySelector("#tr-ok").addEventListener("click", () => {
      origen.rol = "administrador";
      destino.rol = "superadmin";
      pushAudit("Cambio de rol", `Transfirió el rol SuperAdmin de '${origen.nombre}' a '${destino.nombre}'`);
      // RF-050: aplicar el rol vigente en la sesión activa.
      if (state.user && state.user.correo === origen.correo) { state.role = "administrador"; }
      save(); UI.closeModal(); render();
      UI.toast(`Rol SuperAdmin transferido a ${destino.nombre}.`, "success");
    });
  }

  // --- Empresas (RN-035 / RF-052 / RF-053) ----------------------------------
  function empresaForm() {
    const overlay = UI.modal(`
      <div class="p-xl">
        <h3 class="font-title-lg text-title-lg text-on-background mb-lg flex items-center gap-sm"><span class="material-symbols-outlined text-primary">add_business</span> Agregar empresa</h3>
        <div class="space-y-md">
          <div class="flex flex-col gap-xs"><label class="font-label-md text-label-md text-on-surface-variant">Nombre de la empresa</label>
            <input id="ef-nombre" class="rounded-xl border-outline-variant py-sm px-md text-body-md focus:border-primary focus:ring-primary" placeholder="Ej. Compañía Minera del Norte S.A.A."/></div>
          <div class="flex flex-col gap-xs"><label class="font-label-md text-label-md text-on-surface-variant">Sector (RN-019)</label>
            <select id="ef-sector" class="rounded-xl border-outline-variant py-sm px-md text-body-md focus:border-primary focus:ring-primary">
              ${DB.sectores.map((s) => `<option>${s}</option>`).join("")}
            </select></div>
          <div id="ef-error" class="hidden rounded-lg bg-error-container text-on-error-container px-md py-sm text-body-md"></div>
        </div>
        <div class="flex justify-end gap-sm mt-lg">
          <button data-modal-close class="px-lg py-sm rounded-lg border border-outline-variant text-body-md text-on-surface-variant hover:bg-surface-container-low">Cancelar</button>
          <button id="ef-save" class="px-lg py-sm rounded-lg bg-primary text-on-primary text-label-md font-semibold hover:bg-surface-tint">Registrar</button>
        </div>
      </div>`);
    overlay.querySelector("#ef-save").addEventListener("click", () => {
      const nombre = overlay.querySelector("#ef-nombre").value.trim();
      const sector = overlay.querySelector("#ef-sector").value;
      const err = overlay.querySelector("#ef-error");
      if (!nombre) { err.textContent = "El nombre es obligatorio (RF-053)."; err.classList.remove("hidden"); return; }
      if (state.empresas.some((e) => e.nombre.toLowerCase() === nombre.toLowerCase())) { err.textContent = "Ya existe una empresa con ese nombre."; err.classList.remove("hidden"); return; }
      const id = nombre.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 12) + Date.now().toString().slice(-3);
      state.empresas.push({ id, nombre, sector, activa: true });
      pushAudit("Registro de empresa", `Registró la empresa '${nombre}' (sector ${sector})`);
      save(); UI.closeModal(); render();
      UI.toast(`Empresa '${nombre}' registrada.`, "success");
    });
  }

  // Exportación de auditoría (apoyo a RF-048).
  function exportCSV() {
    const rows = [["fecha", "usuario", "tipo", "accion"]].concat(state.audit.map((a) => [a.fecha, a.usuario, a.tipo, a.accion]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "auditoria_igualab.csv";
    a.click();
    UI.toast("Exportado: auditoria_igualab.csv", "success");
  }

  // RF-005 / RN-036: expiración de sesión por inactividad.
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
    pushAudit("Inicio de sesión", expired ? "Sesión expirada por inactividad (RF-005)" : "Cierre de sesión");
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

  function login(correo) {
    const err = document.getElementById("login-error");
    err.classList.add("hidden");
    // Mock permisivo: si el correo coincide con una cuenta habilitada, se usa.
    const user =
      state.users.find((u) => correo && u.correo.toLowerCase() === correo.toLowerCase() && u.estado === "Activo") ||
      state.users.find((u) => u.estado === "Activo" && ROLES_VALIDOS.includes(u.rol)) ||
      state.users[0];

    // RN-004 / Flujo alternativo: cuenta deshabilitada.
    const exacta = state.users.find((u) => correo && u.correo.toLowerCase() === correo.toLowerCase());
    if (exacta && exacta.estado !== "Activo") {
      err.textContent = "Usuario deshabilitado. Contacte al administrador.";
      err.classList.remove("hidden");
      return;
    }

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
      login(document.getElementById("login-email").value.trim());
    });
    document.getElementById("toggle-pass").addEventListener("click", () => {
      const p = document.getElementById("login-pass");
      p.type = p.type === "password" ? "text" : "password";
    });
    // RF-002 / RNF-007 / RNF-009: recuperación por enlace seguro (30 min).
    document.getElementById("forgot-pass").addEventListener("click", (e) => {
      e.preventDefault();
      UI.modal(`
        <div class="p-xl text-center">
          <span class="material-symbols-outlined text-[48px] text-primary">lock_reset</span>
          <h3 class="font-title-lg text-title-lg text-on-background mt-md">Recuperar contraseña</h3>
          <p class="text-body-md text-on-surface-variant mt-sm">Ingresa tu correo. Si está registrado, te enviaremos un enlace de recuperación con vigencia de <strong>30 minutos</strong> (RF-002).</p>
          <input id="fp-mail" class="w-full mt-lg rounded-xl border-outline-variant py-sm px-md text-body-md focus:border-primary focus:ring-primary" placeholder="tu@igualab.org"/>
          <div class="flex justify-center gap-sm mt-lg">
            <button data-modal-close class="px-lg py-sm rounded-lg border border-outline-variant text-body-md text-on-surface-variant">Cancelar</button>
            <button id="fp-send" class="px-lg py-sm rounded-lg bg-primary text-on-primary text-label-md font-semibold">Enviar enlace</button>
          </div>
        </div>`);
      // RNF-007: respuesta idéntica para toda cuenta (no revela existencia).
      document.getElementById("fp-send").addEventListener("click", () => { UI.closeModal(); UI.toast("Si el correo está registrado, recibirás un enlace de recuperación en los próximos minutos.", "info"); });
    });
    document.addEventListener("click", (e) => {
      const t = e.target.closest("[data-action='logout']");
      if (t) { e.preventDefault(); logout(false); }
    });
    document.getElementById("role-select").addEventListener("change", (e) => {
      const nuevo = e.target.value;
      const acc = DB.demoAccounts[nuevo];
      state.role = nuevo;
      state.user = state.users.find((u) => u.correo === acc.correo) || { nombre: acc.nombre, correo: acc.correo };
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
