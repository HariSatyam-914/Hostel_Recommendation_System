import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    /*
     * Do not attach an old JWT to public authentication
     * endpoints.
     *
     * Google OAuth profile completion is performed before
     * the new JWT is created.
     */
    const isPublicAuthRequest =
      config.url === "/api/auth/login" ||
      config.url === "/api/auth/register" ||
      config.url === "/api/auth/oauth2/exchange" ||
      config.url === "/api/auth/oauth2/complete-profile";

    if (token && !isPublicAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;