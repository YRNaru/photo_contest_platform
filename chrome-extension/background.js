const DEFAULT_BACKEND_BASE_URL = "http://localhost:18001";
const STORAGE_KEYS = {
  backendBaseUrl: "backendBaseUrl",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
};

function normalizeBackendBaseUrl(rawUrl) {
  const value = (rawUrl || DEFAULT_BACKEND_BASE_URL).trim();
  const url = new URL(value);
  return url.toString().replace(/\/$/, "").replace(/\/api$/, "");
}

function buildApiUrl(backendBaseUrl, path) {
  return `${backendBaseUrl}/api${path.startsWith("/") ? path : `/${path}`}`;
}

async function getStoredState() {
  const data = await chrome.storage.local.get(Object.values(STORAGE_KEYS));
  return {
    backendBaseUrl: normalizeBackendBaseUrl(data[STORAGE_KEYS.backendBaseUrl]),
    accessToken: data[STORAGE_KEYS.accessToken] || null,
    refreshToken: data[STORAGE_KEYS.refreshToken] || null,
  };
}

async function setTokens({ accessToken, refreshToken }) {
  const updates = {};
  if (typeof accessToken === "string") {
    updates[STORAGE_KEYS.accessToken] = accessToken;
  }
  if (typeof refreshToken === "string") {
    updates[STORAGE_KEYS.refreshToken] = refreshToken;
  }
  await chrome.storage.local.set(updates);
}

async function clearTokens() {
  await chrome.storage.local.remove([STORAGE_KEYS.accessToken, STORAGE_KEYS.refreshToken]);
}

async function setBackendBaseUrl(backendBaseUrl) {
  const normalized = normalizeBackendBaseUrl(backendBaseUrl);
  const current = await getStoredState();
  await chrome.storage.local.set({ [STORAGE_KEYS.backendBaseUrl]: normalized });
  if (current.backendBaseUrl !== normalized) {
    await clearTokens();
  }
  return normalized;
}

function parseResponseBody(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (_error) {
    return text;
  }
}

function extractErrorMessage(payload, fallbackMessage) {
  if (!payload) {
    return fallbackMessage;
  }

  if (typeof payload === "string") {
    return payload;
  }

  if (typeof payload.detail === "string") {
    return payload.detail;
  }

  if (Array.isArray(payload.non_field_errors)) {
    return payload.non_field_errors.join("\n");
  }

  if (typeof payload.error === "string") {
    return payload.error;
  }

  const messages = Object.entries(payload)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}: ${value.join(", ")}`;
      }
      return `${key}: ${String(value)}`;
    })
    .join("\n");

  return messages || fallbackMessage;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  const payload = parseResponseBody(text);

  if (!response.ok) {
    const error = new Error(extractErrorMessage(payload, "API request failed."));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

async function refreshAccessToken(backendBaseUrl, refreshToken) {
  if (!refreshToken) {
    throw new Error("ログインしてください。");
  }

  const payload = await requestJson(buildApiUrl(backendBaseUrl, "/auth/token/refresh/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  await setTokens({
    accessToken: payload.access,
    refreshToken: payload.refresh || refreshToken,
  });

  return payload.access;
}

async function authenticatedApiRequest(path, { method = "GET", body = null, backendBaseUrl } = {}) {
  const state = await getStoredState();
  const targetBaseUrl = backendBaseUrl ? normalizeBackendBaseUrl(backendBaseUrl) : state.backendBaseUrl;

  let accessToken = state.accessToken;
  const headers = {};
  if (body !== null) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  try {
    const data = await requestJson(buildApiUrl(targetBaseUrl, path), {
      method,
      headers,
      body: body === null ? null : JSON.stringify(body),
    });
    return { data, backendBaseUrl: targetBaseUrl };
  } catch (error) {
    if (error.status !== 401 || !state.refreshToken) {
      if (error.status === 401) {
        await clearTokens();
      }
      throw error;
    }

    accessToken = await refreshAccessToken(targetBaseUrl, state.refreshToken);
    const retryHeaders = { ...headers, Authorization: `Bearer ${accessToken}` };
    const data = await requestJson(buildApiUrl(targetBaseUrl, path), {
      method,
      headers: retryHeaders,
      body: body === null ? null : JSON.stringify(body),
    });
    return { data, backendBaseUrl: targetBaseUrl };
  }
}

function listFromPaginatedPayload(payload) {
  if (!payload) {
    return [];
  }
  return Array.isArray(payload) ? payload : payload.results || [];
}

async function fetchCurrentUser(backendBaseUrl) {
  const response = await authenticatedApiRequest("/users/me/", { backendBaseUrl });
  return response.data;
}

async function getExtensionState() {
  const state = await getStoredState();
  if (!state.accessToken) {
    return {
      backendBaseUrl: state.backendBaseUrl,
      isAuthenticated: false,
      user: null,
    };
  }

  try {
    const user = await fetchCurrentUser(state.backendBaseUrl);
    return {
      backendBaseUrl: state.backendBaseUrl,
      isAuthenticated: true,
      user,
    };
  } catch (_error) {
    await clearTokens();
    return {
      backendBaseUrl: state.backendBaseUrl,
      isAuthenticated: false,
      user: null,
    };
  }
}

async function loginWithProvider(provider, backendBaseUrl) {
  const normalizedBaseUrl = await setBackendBaseUrl(backendBaseUrl);
  const redirectUri = chrome.identity.getRedirectURL("oauth2");
  const authUrl = `${normalizedBaseUrl}/accounts/extension/login/${encodeURIComponent(
    provider
  )}/?redirect_uri=${encodeURIComponent(redirectUri)}`;

  const finalUrl = await chrome.identity.launchWebAuthFlow({
    url: authUrl,
    interactive: true,
  });

  if (!finalUrl) {
    throw new Error("認証を完了できませんでした。");
  }

  const finalParams = new URL(finalUrl).searchParams;
  const accessToken = finalParams.get("access_token");
  const refreshToken = finalParams.get("refresh_token");

  if (!accessToken || !refreshToken) {
    throw new Error("JWTトークンを取得できませんでした。");
  }

  await setTokens({ accessToken, refreshToken });
  const user = await fetchCurrentUser(normalizedBaseUrl);

  return {
    backendBaseUrl: normalizedBaseUrl,
    isAuthenticated: true,
    user,
  };
}

async function getSubmissionContests(backendBaseUrl) {
  const response = await authenticatedApiRequest("/contests/", { backendBaseUrl });
  return listFromPaginatedPayload(response.data).filter((contest) => contest.phase === "submission");
}

async function getTweetPreview(tweetUrl, backendBaseUrl) {
  const response = await authenticatedApiRequest("/entries/tweet_preview/", {
    method: "POST",
    body: { tweet_url: tweetUrl },
    backendBaseUrl,
  });
  return response.data;
}

async function registerTweet({ contestSlug, tweetUrl, title, description, backendBaseUrl }) {
  const response = await authenticatedApiRequest(`/contests/${contestSlug}/register_tweet/`, {
    method: "POST",
    body: {
      tweet_url: tweetUrl,
      title,
      description,
    },
    backendBaseUrl,
  });
  return response.data;
}

async function handleMessage(message) {
  switch (message.type) {
    case "GET_STATE":
      return getExtensionState();
    case "SET_BACKEND_BASE_URL":
      return {
        backendBaseUrl: await setBackendBaseUrl(message.backendBaseUrl),
      };
    case "LOGIN":
      return loginWithProvider(message.provider, message.backendBaseUrl);
    case "LOGOUT":
      await clearTokens();
      return {
        backendBaseUrl: (await getStoredState()).backendBaseUrl,
        isAuthenticated: false,
        user: null,
      };
    case "GET_TWEET_PREVIEW":
      return getTweetPreview(message.tweetUrl, message.backendBaseUrl);
    case "GET_SUBMISSION_CONTESTS":
      return getSubmissionContests(message.backendBaseUrl);
    case "REGISTER_TWEET":
      return registerTweet(message.payload);
    default:
      throw new Error("Unknown extension action.");
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message)
    .then((data) => sendResponse({ ok: true, data }))
    .catch((error) => {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected error.",
      });
    });

  return true;
});
