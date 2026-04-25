const STATUS_PATH_PATTERN = /\/status\/\d+/;
const INLINE_BUTTON_HOST_ATTR = "data-photo-contest-inline-button";
const FLOATING_BUTTON_ID = "photo-contest-floating-button-host";
const MODAL_HOST_ID = "photo-contest-modal-host";

const modalState = {
  backendBaseUrl: "",
  user: null,
  isAuthenticated: false,
  preview: null,
  contests: [],
  title: "",
  description: "",
  contestSlug: "",
  loading: false,
  statusMessage: "",
  statusTone: "info",
};

let modalElements = null;
let observer = null;
let lastKnownUrl = "";

function currentTweetUrl() {
  return window.location.href.split("?")[0];
}

function isStatusPage() {
  return STATUS_PATH_PATTERN.test(window.location.pathname);
}

async function sendExtensionMessage(message) {
  const response = await chrome.runtime.sendMessage(message);
  if (!response || !response.ok) {
    throw new Error(response?.error || "拡張機能との通信に失敗しました。");
  }
  return response.data;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setStatusMessage(message, tone = "info") {
  modalState.statusMessage = message;
  modalState.statusTone = tone;
  renderModal();
}

function ensureModal() {
  if (modalElements) {
    return modalElements;
  }

  const host = document.createElement("div");
  host.id = MODAL_HOST_ID;
  document.documentElement.appendChild(host);

  const shadowRoot = host.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = `
    <style>
      :host {
        all: initial;
      }

      .overlay {
        position: fixed;
        inset: 0;
        z-index: 2147483647;
        display: none;
        align-items: center;
        justify-content: center;
        padding: 20px;
        background: rgba(7, 12, 20, 0.62);
        backdrop-filter: blur(10px);
        font-family: "Segoe UI", sans-serif;
      }

      .overlay.open {
        display: flex;
      }

      .panel {
        width: min(680px, 100%);
        max-height: min(88vh, 920px);
        overflow: auto;
        border-radius: 24px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background:
          radial-gradient(circle at top left, rgba(29, 155, 240, 0.18), transparent 34%),
          radial-gradient(circle at bottom right, rgba(255, 122, 89, 0.16), transparent 36%),
          #0f1722;
        color: #f7fafc;
        box-shadow: 0 20px 80px rgba(0, 0, 0, 0.45);
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 24px 24px 8px;
      }

      .title {
        font-size: 22px;
        font-weight: 700;
        letter-spacing: 0.01em;
      }

      .subtitle {
        margin-top: 6px;
        color: rgba(226, 232, 240, 0.78);
        font-size: 13px;
      }

      .close-button {
        border: 0;
        background: rgba(255, 255, 255, 0.08);
        color: #f7fafc;
        width: 38px;
        height: 38px;
        border-radius: 999px;
        cursor: pointer;
        font-size: 20px;
      }

      .body {
        padding: 16px 24px 24px;
      }

      .stack {
        display: grid;
        gap: 18px;
      }

      .card {
        padding: 16px 18px;
        border-radius: 18px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        background: rgba(15, 23, 34, 0.72);
      }

      .section-title {
        font-size: 14px;
        font-weight: 700;
        color: #8fd3ff;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
      }

      .label {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
        color: rgba(226, 232, 240, 0.84);
      }

      .input,
      .textarea,
      .select {
        width: 100%;
        box-sizing: border-box;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: rgba(10, 16, 25, 0.9);
        color: #f8fafc;
        padding: 12px 14px;
        font-size: 14px;
      }

      .textarea {
        min-height: 130px;
        resize: vertical;
      }

      .actions,
      .login-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .button {
        border: 0;
        border-radius: 999px;
        padding: 11px 18px;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: transform 160ms ease, opacity 160ms ease;
      }

      .button:hover {
        transform: translateY(-1px);
      }

      .button:disabled {
        cursor: progress;
        opacity: 0.7;
        transform: none;
      }

      .button-primary {
        background: linear-gradient(135deg, #1d9bf0, #53b8ff);
        color: #06131f;
      }

      .button-secondary {
        background: rgba(255, 255, 255, 0.1);
        color: #f8fafc;
      }

      .button-danger {
        background: rgba(255, 92, 92, 0.18);
        color: #ffd9d9;
      }

      .status {
        border-radius: 16px;
        padding: 12px 14px;
        font-size: 13px;
        line-height: 1.5;
      }

      .status-info {
        background: rgba(59, 130, 246, 0.16);
        color: #dbeafe;
      }

      .status-success {
        background: rgba(34, 197, 94, 0.16);
        color: #dcfce7;
      }

      .status-error {
        background: rgba(239, 68, 68, 0.18);
        color: #fee2e2;
      }

      .muted {
        color: rgba(226, 232, 240, 0.7);
        font-size: 13px;
      }

      .preview-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 10px;
        font-size: 12px;
        color: rgba(191, 219, 254, 0.9);
      }

      .preview-text {
        margin: 0;
        white-space: pre-wrap;
        color: rgba(248, 250, 252, 0.92);
        font-size: 14px;
        line-height: 1.6;
      }

      .row {
        display: grid;
        gap: 14px;
      }

      @media (min-width: 720px) {
        .row {
          grid-template-columns: 1fr 1fr;
        }
      }
    </style>
    <div class="overlay">
      <div class="panel" role="dialog" aria-modal="true" aria-label="X作品を応募">
        <div class="header">
          <div>
            <div class="title">X作品を応募</div>
            <div class="subtitle">このツイートをフォトコンテスト作品として登録します。</div>
          </div>
          <button class="close-button" type="button" aria-label="閉じる">×</button>
        </div>
        <div class="body"></div>
      </div>
    </div>
  `;

  const overlay = shadowRoot.querySelector(".overlay");
  const body = shadowRoot.querySelector(".body");
  const closeButton = shadowRoot.querySelector(".close-button");

  closeButton.addEventListener("click", closeModal);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  modalElements = { host, shadowRoot, overlay, body };
  return modalElements;
}

function closeModal() {
  const modal = ensureModal();
  modal.overlay.classList.remove("open");
}

function openModal() {
  const modal = ensureModal();
  modal.overlay.classList.add("open");
  modalState.loading = true;
  modalState.statusMessage = "";
  renderModal();
  refreshModalData();
}

function renderModal() {
  const modal = ensureModal();
  const disabledAttr = modalState.loading ? "disabled" : "";
  const statusMarkup = modalState.statusMessage
    ? `<div class="status status-${modalState.statusTone}">${escapeHtml(modalState.statusMessage)}</div>`
    : "";

  const backendMarkup = `
    <div class="card">
      <div class="section-title">Connection</div>
      <label class="label" for="pc-backend-url">Backend URL</label>
      <div class="actions">
        <input id="pc-backend-url" class="input" type="url" value="${escapeHtml(
          modalState.backendBaseUrl
        )}" placeholder="http://localhost:18001" />
        <button class="button button-secondary" type="button" id="pc-save-backend" ${disabledAttr}>保存</button>
      </div>
      <div class="muted" style="margin-top: 10px;">APIサーバーのベースURLを指定します。</div>
    </div>
  `;

  let authMarkup = "";
  if (!modalState.isAuthenticated) {
    authMarkup = `
      <div class="card">
        <div class="section-title">Login</div>
        <div class="muted" style="margin-bottom: 14px;">応募前に拡張機能からログインしてください。</div>
        <div class="login-actions">
          <button class="button button-primary" type="button" data-login-provider="twitter_oauth2" ${disabledAttr}>Xでログイン</button>
          <button class="button button-secondary" type="button" data-login-provider="google" ${disabledAttr}>Googleでログイン</button>
        </div>
      </div>
    `;
  } else {
    const preview = modalState.preview;
    const contests = modalState.contests;
    const contestOptions = contests.length
      ? contests
          .map((contest) => {
            const selected = modalState.contestSlug === contest.slug ? "selected" : "";
            return `<option value="${escapeHtml(contest.slug)}" ${selected}>${escapeHtml(contest.title)}</option>`;
          })
          .join("")
      : `<option value="">応募中のコンテストがありません</option>`;

    authMarkup = `
      <div class="card">
        <div class="section-title">Account</div>
        <div class="actions" style="justify-content: space-between;">
          <div class="muted">ログイン中: ${escapeHtml(
            modalState.user?.username || modalState.user?.email || "Unknown user"
          )}</div>
          <button class="button button-danger" type="button" id="pc-logout-button" ${disabledAttr}>ログアウト</button>
        </div>
      </div>
      <div class="card">
        <div class="section-title">Tweet Preview</div>
        ${
          preview
            ? `
              <div class="preview-meta">
                <span>@${escapeHtml(preview.author_username || "unknown")}</span>
                <span>写真 ${escapeHtml(preview.media_urls.length)}</span>
              </div>
              <p class="preview-text">${escapeHtml(preview.text || "")}</p>
            `
            : `<div class="muted">ツイートを読み込み中です…</div>`
        }
      </div>
      <div class="card">
        <div class="section-title">Entry</div>
        <div class="stack">
          <div>
            <label class="label" for="pc-contest-select">応募先コンテスト</label>
            <select id="pc-contest-select" class="select" ${disabledAttr}>${contestOptions}</select>
          </div>
          <div>
            <label class="label" for="pc-title-input">タイトル</label>
            <input id="pc-title-input" class="input" type="text" maxlength="200" value="${escapeHtml(
              modalState.title
            )}" ${disabledAttr} />
          </div>
          <div>
            <label class="label" for="pc-description-input">説明</label>
            <textarea id="pc-description-input" class="textarea" ${disabledAttr}>${escapeHtml(
              modalState.description
            )}</textarea>
          </div>
          <div class="actions">
            <button class="button button-primary" type="button" id="pc-submit-button" ${disabledAttr}>この作品を応募する</button>
          </div>
        </div>
      </div>
    `;
  }

  modal.body.innerHTML = `
    <div class="stack">
      ${statusMarkup}
      ${backendMarkup}
      ${authMarkup}
    </div>
  `;

  wireModalEvents();
}

function wireModalEvents() {
  const modal = ensureModal();
  const backendInput = modal.shadowRoot.querySelector("#pc-backend-url");
  const saveButton = modal.shadowRoot.querySelector("#pc-save-backend");

  if (backendInput) {
    backendInput.addEventListener("input", (event) => {
      modalState.backendBaseUrl = event.target.value;
    });
  }

  if (saveButton) {
    saveButton.addEventListener("click", async () => {
      await saveBackendUrl();
    });
  }

  modal.shadowRoot.querySelectorAll("[data-login-provider]").forEach((button) => {
    button.addEventListener("click", async () => {
      await handleLogin(button.getAttribute("data-login-provider"));
    });
  });

  const logoutButton = modal.shadowRoot.querySelector("#pc-logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      modalState.loading = true;
      renderModal();
      await sendExtensionMessage({ type: "LOGOUT" });
      modalState.user = null;
      modalState.isAuthenticated = false;
      modalState.preview = null;
      modalState.contests = [];
      modalState.loading = false;
      setStatusMessage("ログアウトしました。", "info");
    });
  }

  const contestSelect = modal.shadowRoot.querySelector("#pc-contest-select");
  if (contestSelect) {
    contestSelect.addEventListener("change", (event) => {
      modalState.contestSlug = event.target.value;
    });
  }

  const titleInput = modal.shadowRoot.querySelector("#pc-title-input");
  if (titleInput) {
    titleInput.addEventListener("input", (event) => {
      modalState.title = event.target.value;
    });
  }

  const descriptionInput = modal.shadowRoot.querySelector("#pc-description-input");
  if (descriptionInput) {
    descriptionInput.addEventListener("input", (event) => {
      modalState.description = event.target.value;
    });
  }

  const submitButton = modal.shadowRoot.querySelector("#pc-submit-button");
  if (submitButton) {
    submitButton.addEventListener("click", async () => {
      await submitEntry();
    });
  }
}

async function saveBackendUrl() {
  modalState.loading = true;
  renderModal();

  try {
    const result = await sendExtensionMessage({
      type: "SET_BACKEND_BASE_URL",
      backendBaseUrl: modalState.backendBaseUrl,
    });
    modalState.backendBaseUrl = result.backendBaseUrl;
    modalState.isAuthenticated = false;
    modalState.user = null;
    modalState.preview = null;
    modalState.contests = [];
    setStatusMessage("Backend URL を保存しました。必要なら再ログインしてください。", "info");
  } catch (error) {
    setStatusMessage(error.message, "error");
  } finally {
    modalState.loading = false;
    renderModal();
  }
}

async function handleLogin(provider) {
  modalState.loading = true;
  setStatusMessage("ログイン画面を開いています…", "info");

  try {
    const state = await sendExtensionMessage({
      type: "LOGIN",
      provider,
      backendBaseUrl: modalState.backendBaseUrl,
    });
    modalState.backendBaseUrl = state.backendBaseUrl;
    modalState.user = state.user;
    modalState.isAuthenticated = true;
    await refreshModalData();
    setStatusMessage("ログインしました。応募内容を確認してください。", "success");
  } catch (error) {
    modalState.loading = false;
    setStatusMessage(error.message, "error");
  }
}

async function refreshModalData() {
  modalState.loading = true;
  renderModal();

  try {
    const state = await sendExtensionMessage({ type: "GET_STATE" });
    modalState.backendBaseUrl = state.backendBaseUrl;
    modalState.user = state.user;
    modalState.isAuthenticated = state.isAuthenticated;

    if (!state.isAuthenticated) {
      modalState.preview = null;
      modalState.contests = [];
      modalState.loading = false;
      renderModal();
      return;
    }

    const [preview, contests] = await Promise.all([
      sendExtensionMessage({
        type: "GET_TWEET_PREVIEW",
        tweetUrl: currentTweetUrl(),
        backendBaseUrl: modalState.backendBaseUrl,
      }),
      sendExtensionMessage({
        type: "GET_SUBMISSION_CONTESTS",
        backendBaseUrl: modalState.backendBaseUrl,
      }),
    ]);

    modalState.preview = preview;
    modalState.contests = contests;

    if (!modalState.title) {
      modalState.title = preview.default_title || "";
    }
    if (!modalState.description) {
      modalState.description = preview.default_description || "";
    }
    if (!modalState.contestSlug && contests.length) {
      modalState.contestSlug = contests[0].slug;
    }
  } catch (error) {
    setStatusMessage(error.message, "error");
  } finally {
    modalState.loading = false;
    renderModal();
  }
}

async function submitEntry() {
  if (!modalState.contestSlug) {
    setStatusMessage("応募先コンテストを選択してください。", "error");
    return;
  }

  if (!modalState.title.trim()) {
    setStatusMessage("タイトルを入力してください。", "error");
    return;
  }

  modalState.loading = true;
  renderModal();

  try {
    const result = await sendExtensionMessage({
      type: "REGISTER_TWEET",
      payload: {
        contestSlug: modalState.contestSlug,
        tweetUrl: currentTweetUrl(),
        title: modalState.title.trim(),
        description: modalState.description,
        backendBaseUrl: modalState.backendBaseUrl,
      },
    });

    if (result.entry_url) {
      setStatusMessage(`${result.detail} 作品ページを新しいタブで開きます。`, "success");
      window.open(result.entry_url, "_blank", "noopener,noreferrer");
    } else {
      setStatusMessage(result.detail, "success");
    }
  } catch (error) {
    setStatusMessage(error.message, "error");
  } finally {
    modalState.loading = false;
    renderModal();
  }
}

function createButtonMarkup(label) {
  const wrapper = document.createElement("span");
  const shadowRoot = wrapper.attachShadow({ mode: "open" });
  shadowRoot.innerHTML = `
    <style>
      button {
        border: 0;
        border-radius: 999px;
        padding: 8px 14px;
        background: linear-gradient(135deg, #1d9bf0, #67c3ff);
        color: #07111b;
        font: 700 13px/1 "Segoe UI", sans-serif;
        cursor: pointer;
        box-shadow: 0 10px 24px rgba(29, 155, 240, 0.28);
      }

      button:hover {
        transform: translateY(-1px);
      }
    </style>
    <button type="button">${escapeHtml(label)}</button>
  `;

  shadowRoot.querySelector("button").addEventListener("click", openModal);
  return wrapper;
}

function removeFloatingButton() {
  const host = document.getElementById(FLOATING_BUTTON_ID);
  if (host) {
    host.remove();
  }
}

function ensureFloatingButton() {
  if (!isStatusPage()) {
    removeFloatingButton();
    return;
  }

  if (document.getElementById(FLOATING_BUTTON_ID)) {
    return;
  }

  const host = document.createElement("div");
  host.id = FLOATING_BUTTON_ID;
  host.style.position = "fixed";
  host.style.right = "20px";
  host.style.bottom = "24px";
  host.style.zIndex = "2147483646";
  host.appendChild(createButtonMarkup("この作品を応募"));
  document.documentElement.appendChild(host);
}

function findInlineActionBar() {
  const candidates = document.querySelectorAll('article [role="group"]');
  return candidates.length ? candidates[0] : null;
}

function ensureInlineButton() {
  if (!isStatusPage()) {
    removeFloatingButton();
    document.querySelectorAll(`[${INLINE_BUTTON_HOST_ATTR}]`).forEach((node) => node.remove());
    return;
  }

  const actionBar = findInlineActionBar();
  if (!actionBar) {
    ensureFloatingButton();
    return;
  }

  removeFloatingButton();

  const mountParent = actionBar.parentElement || actionBar;
  if (mountParent.querySelector(`[${INLINE_BUTTON_HOST_ATTR}]`)) {
    return;
  }

  const host = document.createElement("span");
  host.setAttribute(INLINE_BUTTON_HOST_ATTR, "true");
  host.style.marginTop = "10px";
  host.style.display = "inline-flex";
  host.appendChild(createButtonMarkup("この作品を応募"));
  mountParent.appendChild(host);
}

function installObserver() {
  if (observer) {
    return;
  }

  observer = new MutationObserver(() => {
    if (window.location.href !== lastKnownUrl) {
      lastKnownUrl = window.location.href;
      modalState.preview = null;
      modalState.statusMessage = "";
      modalState.title = "";
      modalState.description = "";
      modalState.contestSlug = "";
    }
    ensureInlineButton();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
}

function boot() {
  lastKnownUrl = window.location.href;
  ensureModal();
  installObserver();
  ensureInlineButton();
  window.setInterval(ensureInlineButton, 1500);
}

boot();
