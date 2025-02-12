import ApiInstance from "./http";
import { config } from "../config/config";
import { getAuthHeader, getHeader, getHeaderClient } from "../utils/utils";

// Removed TypeScript interfaces

export const getApi = async (url) => {
  const headers = getHeader();
  const data = await ApiInstance.get(`${url}`);
  return data;
};

export const getApiClient = async (url) => {
  const headers = getHeaderClient();
  const data = await ApiInstance.get(`${url}`, headers);
  return data;
};

export const postApi = (url, apiData) => {
  const headers = getHeader();
  return ApiInstance.post(`${url}`, apiData, headers);
};
export const postClientApi = (url, apiData) => {
  const headers = getHeaderClient();
  return ApiInstance.post(`${url}`, apiData, headers);
};

export const authPostApi = async (url, apiData) => {
  const headers = getHeader();
  try {
    const data = await ApiInstance.post(`${url}`, apiData, headers);
    return data;
  } catch (error) {
    throw error;
  }
};

export const patchApi = (url, apiData) => {
  const headers = getHeader();
  return ApiInstance.patch(`${url}`, apiData);
};
export const patchClientApi = (url, apiData) => {
  const headers = getHeaderClient();
  return ApiInstance.patch(`${url}`, apiData, headers);
};

export const putApi = (url, apiData) => {
  const headers = getHeader();
  return ApiInstance.put(`${url}`, apiData, headers);
};

export const putClientApi = (url, apiData) => {
  const headers = getHeaderClient();
  return ApiInstance.put(`${url}`, apiData, headers);
};

export const deleteApi = (url) => {
  const headers = getHeader();
  return ApiInstance.delete(`${config.apiBaseUrl}${url}`, headers);
};

export const deleteApiClient = (url) => {
  const headers = getHeaderClient();
  return ApiInstance.delete(`${config.apiBaseUrl}${url}`, headers);
};

