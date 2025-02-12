import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { authPostApi } from "../../services/api";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";

// Removed TypeScript type annotations
const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  responseCode: 0,
};

// Removed TypeScript type annotations
export const forgotPasswordData = createAsyncThunk(
  "/forgotPasswordData",
  async (values) => { // Removed type annotation for values
    try {
      const payload = await authPostApi(apiEndPoints.FORGOT_PASSWORD_PATH, values);
      return payload;
    } catch (e) {
      showError(e.response.data.message);
    }
  }
);
export const forgotPasswordSlice = createSlice({
  name: "forgotPasswordData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(forgotPasswordData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(forgotPasswordData.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
      })
      .addCase(forgotPasswordData.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const forgotPasswordReducer = forgotPasswordSlice.reducer;