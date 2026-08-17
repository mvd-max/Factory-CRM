
const API = import.meta.env.VITE_API_URL;

export const apiFetch = (
  endpoint: string,
  options: RequestInit = {}
) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  return fetch(`${API}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-user-role": user.role || "admin",
      ...(options.headers || {}),
    },
  });
};

export default API;