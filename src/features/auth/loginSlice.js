// src/features/auth/loginSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authPostApi, getApiClient, patchApi, postApi, postClientApi } from "../../services/api";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  responseCode: 0,
  responseData: {},
  token: "",
};

export const loginData = createAsyncThunk(
  "/loginData",
  async (values) => {
    try {
      const valuesData = { ...values };
      const payload = await authPostApi(apiEndPoints.LOGIN_PATH, valuesData);
      console.log("payload:::", payload);
      return payload;
    } catch (e) {
      showError(e.response.data.message);
    }
  }
);

export const fetchDataStatus = createAsyncThunk(
  "/fetchDataStatus",
  async () => {
    try {
      const payload = await getApiClient(apiEndPoints.GET_SOFTWARE_STATUS);
      return payload;
    } catch (e) {
      showError(e.response.data.message);
    }
  }
);

export const profilePicture = createAsyncThunk(
  "/profilePicture",
  async (values) => {
    try {
      const payload = await patchApi(apiEndPoints.PROFILE_PICTURE, values);
      return payload;
    } catch (e) {
      showError(e.response.data.message);
    }
  }
);

export const loginDataSlice = createSlice({
  name: "loginData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginData.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload && payload.status;
        state.responseData = payload && payload.data.data;
      })
      .addCase(loginData.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })
      .addCase(fetchDataStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchDataStatus.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload && payload.status;
        state.responseData = payload && payload.data.data;
      })
      .addCase(fetchDataStatus.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      })
      .addCase(profilePicture.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(profilePicture.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload && payload.status;
        state.responseData = payload && payload.data.data;
      })
      .addCase(profilePicture.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const loginDataReducer = loginDataSlice.reducer;