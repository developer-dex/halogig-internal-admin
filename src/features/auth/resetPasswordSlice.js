// src/features/auth/resetPasswordSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authPostApi } from "../../services/api";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";
import { useNavigate } from "react-router-dom";

// Removed TypeScript type annotations
const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  responseCode: 0,
};

// Removed TypeScript type annotations
export const resetPasswordData = createAsyncThunk(
  "/resetPasswordData",
  async (values) => { // Removed type annotation for values
    try {
      const payload = await authPostApi(apiEndPoints.RESET_PASSWORD_PATH, values);
      return payload;
    } catch (e) {
      console.log("error 9999::::", e.response.data.responseMessage);
      showError(e.response.data.responseMessage);
    }
  }
);

export const resetPasswordSlice = createSlice({
  name: "resetPasswordData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(resetPasswordData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(resetPasswordData.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
      })
      .addCase(resetPasswordData.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const resetPasswordReducer = resetPasswordSlice.reducer;