export const saveAdminAuth = (token, adminUser) => {
  localStorage.setItem("adminToken", token);
  localStorage.setItem("adminUser", JSON.stringify(adminUser));
};

export const getAdminToken = () => {
  return localStorage.getItem("adminToken") || localStorage.getItem("token") || "";
};

export const setAdminToken = (token) => {
  localStorage.setItem("adminToken", token);
};

export const getAdminUser = () => {
  try {
    const raw = localStorage.getItem("adminUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearAdminSession = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
};

export const isAuthenticated = () => {
  return !!(localStorage.getItem("adminToken") || localStorage.getItem("token"));
};

export const isAdmin = () => {
  const user = getAdminUser();
  return !!(localStorage.getItem("adminToken") || user?.role === "admin");
};
