// src/features/auth/fetchFrontImageSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getApi } from "../../services/api";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  responseCode: 0,
  responseData: {},
};

export const fetchFrontImage = createAsyncThunk(
  "/fetchCmsData",
  async (category) => {
    try {
      const payload = await getApi(
        `${apiEndPoints.FRONT_IMAGE}?category=${category}`
      );
      return payload;
    } catch (e) {
      showError(e.response.data.message);
      // return e;
    }
  }
);

export const fetchFrontImageSlice = createSlice({
  name: "fetchFrontImage",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFrontImage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchFrontImage.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
        state.responseData = payload?.data?.data || {};
      })
      .addCase(fetchFrontImage.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const fetchFrontImageReducer = fetchFrontImageSlice.reducer;