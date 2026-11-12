const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function getAuthHeader() {
  const token = localStorage.getItem("debatex_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If not on login page and unauthorized, clear session
    if (window.location.pathname !== "/" && window.location.pathname !== "") {
      localStorage.removeItem("debatex_token");
      localStorage.removeItem("debatex_user");
      window.location.href = "/";
    }
  }

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const errorMessage =
      (isJson && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    register: (name, email, password) =>
      request("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      }),
    login: (email, password) =>
      request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    me: () => request("/auth/me"),
  },

  // Topics
  topics: {
    getAll: () => request("/topics"),
    getById: (id) => request(`/topics/${id}`),
  },

  // Rooms
  rooms: {
    create: (roomData) =>
      request("/rooms", {
        method: "POST",
        body: JSON.stringify(roomData),
      }),
    get: (code) => request(`/rooms/${code}`),
    list: () => request("/rooms"),
    start: (code) =>
      request(`/rooms/${code}/start`, {
        method: "PATCH",
      }),
    end: (code) =>
      request(`/rooms/${code}/end`, {
        method: "PATCH",
      }),
  },

  // Messages
  messages: {
    get: (code) => request(`/rooms/${code}/messages`),
    send: (code, content) =>
      request(`/rooms/${code}/messages`, {
        method: "POST",
        body: JSON.stringify({ content }),
      }),
  },

  // Evaluation
  evaluation: {
    get: (code) => request(`/rooms/${code}/evaluation`),
    generate: (code) =>
      request(`/rooms/${code}/evaluation`, {
        method: "POST",
      }),
  },
};

export default api;
