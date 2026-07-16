(() => {
  "use strict";

  const form = document.getElementById("verifyForm");
  const input = document.getElementById("tokenInput");
  const verifyButton = document.getElementById("verifyButton");
  const searchPanel = document.getElementById("searchPanel");
  const resultPanel = document.getElementById("resultPanel");
  const errorPanel = document.getElementById("errorPanel");
  const liveRegion = document.getElementById("liveRegion");
  const appToast = bootstrap.Toast.getOrCreateInstance(document.getElementById("appToast"));

  const STATUS = {
    vigente: {
      title: "Credencial vigente",
      badge: "Vigente",
      icon: "bi-shield-check",
      warning: ""
    },
    vencida: {
      title: "Credencial vencida",
      badge: "Vencida",
      icon: "bi-calendar2-x",
      warning: "La vigencia de esta credencial ha concluido. No debe considerarse una identificación laboral activa."
    },
    revocada: {
      title: "Credencial revocada",
      badge: "Revocada",
      icon: "bi-shield-x",
      warning: "Esta credencial fue dada de baja y ya no acredita una relación laboral vigente."
    }
  };

  const normalizeToken = (value) =>
    value.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");

  const safeImagePath = (value) => {
    const fallback = "assets/img/avatar-placeholder.svg";
    if (!value || typeof value !== "string") return fallback;
    if (/^(https?:|data:|javascript:|\/\/)/i.test(value)) return fallback;
    return value.startsWith("assets/img/") ? value : fallback;
  };

  const formatDate = (isoDate) => {
    if (!isoDate) return "No especificada";
    const date = new Date(`${isoDate}T12:00:00`);
    if (Number.isNaN(date.getTime())) return "No especificada";
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }).format(date);
  };

  const setLoading = (loading) => {
    verifyButton.disabled = loading;
    verifyButton.querySelector(".button-label").classList.toggle("d-none", loading);
    verifyButton.querySelector(".button-loading").classList.toggle("d-none", !loading);
    input.readOnly = loading;
  };

  const showOnly = (panel) => {
    [searchPanel, resultPanel, errorPanel].forEach((item) => item.classList.add("d-none"));
    panel.classList.remove("d-none");
    panel.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const showError = (message) => {
    document.getElementById("errorMessage").textContent = message;
    liveRegion.textContent = message;
    showOnly(errorPanel);
  };

  const renderCredential = (record) => {
    const requestedStatus = String(record.estado || "revocada").toLowerCase();
    const statusKey = Object.hasOwn(STATUS, requestedStatus) ? requestedStatus : "revocada";
    const status = STATUS[statusKey];
    const banner = document.getElementById("statusBanner");
    const badge = document.getElementById("statusBadge");
    const warning = document.getElementById("warningBox");

    banner.className = `status-banner ${statusKey === "vigente" ? "" : statusKey}`.trim();
    document.getElementById("statusIcon").className = `bi ${status.icon}`;
    document.getElementById("resultTitle").textContent = status.title;

    badge.className = `status-chip ${statusKey}`;
    badge.innerHTML = `<span class="status-dot" aria-hidden="true"></span>${status.badge}`;

    document.getElementById("employeePhoto").src = safeImagePath(record.foto);
    document.getElementById("employeePhoto").alt = `Fotografía de ${record.nombre || "la persona titular"}`;
    document.getElementById("employeeName").textContent = record.nombre || "Sin nombre registrado";
    document.getElementById("employeePosition").textContent = record.puesto || "Personal operativo";
    document.getElementById("employeeId").textContent = record.folio || "—";
    document.getElementById("companyName").textContent = record.empresa || "RecyInd";
    document.getElementById("validity").textContent =
      `${formatDate(record.vigencia_inicio)} – ${formatDate(record.vigencia_fin)}`;
    document.getElementById("checkedAt").textContent =
      new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(new Date());

    warning.textContent = status.warning;
    warning.classList.toggle("d-none", !status.warning);

    liveRegion.textContent = `${status.title}. Titular: ${record.nombre}.`;
    showOnly(resultPanel);
  };

  const fetchCredential = async (token) => {
    const response = await fetch(`data/${encodeURIComponent(token)}.json`, {
      cache: "no-store",
      headers: { Accept: "application/json" }
    });

    if (response.status === 404) throw new Error("NOT_FOUND");
    if (!response.ok) throw new Error("NETWORK");
    return response.json();
  };

  const verify = async (rawToken) => {
    const token = normalizeToken(rawToken);
    input.value = token;

    if (token.length < 8 || token.length > 80) {
      form.classList.add("was-validated");
      input.focus();
      return;
    }

    form.classList.remove("was-validated");
    setLoading(true);

    try {
      const record = await fetchCredential(token);
      renderCredential(record);
      const url = new URL(window.location.href);
      url.searchParams.set("v", token);
      history.replaceState({}, "", url);
    } catch (error) {
      const message = error.message === "NOT_FOUND"
        ? "El código no corresponde a una credencial registrada o el registro fue eliminado."
        : "No fue posible realizar la consulta. Revisa tu conexión e inténtalo nuevamente.";
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    verify(input.value);
  });

  document.getElementById("newSearchButton").addEventListener("click", () => {
    history.replaceState({}, "", window.location.pathname);
    input.value = "";
    showOnly(searchPanel);
    input.focus();
  });

  document.getElementById("errorBackButton").addEventListener("click", () => {
    history.replaceState({}, "", window.location.pathname);
    showOnly(searchPanel);
    input.focus();
  });

  document.getElementById("copyButton").addEventListener("click", async () => {
    const folio = document.getElementById("employeeId").textContent;
    try {
      await navigator.clipboard.writeText(folio);
      document.getElementById("toastText").textContent = "Folio copiado.";
      appToast.show();
    } catch {
      document.getElementById("toastText").textContent = "No fue posible copiar el folio.";
      appToast.show();
    }
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  const tokenFromQr = new URLSearchParams(window.location.search).get("v");
  if (tokenFromQr) {
    input.value = normalizeToken(tokenFromQr);
    verify(input.value);
  }
})();
