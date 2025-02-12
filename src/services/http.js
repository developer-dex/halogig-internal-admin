// src/services/http.js
import axios from "axios";
import { config } from "../config/config";
import { UNAUTHORIZED } from "../config/httpStatusCodes";
import { clearSession } from "../config/localStorage";

const instance = axios.create({
  baseURL: config.apiBaseUrl,
});

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const { response } = error;
    if (response.status === UNAUTHORIZED) {
      clearSession();
      window.location.href = config.appBaseUrl || '';
    }
    if (response.status === 409) { // Changed from HttpStatusCode.Conflict
      window.location.href = config.baseName || '';
    }
    throw error;
  }
);

export default instance;