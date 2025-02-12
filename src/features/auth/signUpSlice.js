// src/features/auth/signUpSlice.js
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
  responseData: {},
  token: "",
  isFromBooking: false,
  uuid: "",
  isReviewWrite: false,
  isBookMarking: false,
};

// Removed TypeScript type annotations
export const signUpData = createAsyncThunk(
  "/signUpData",
  async (values) => { // Removed type annotation for values
    try {
      const valuesData = values;
      console.log("valuesData 9999::::", valuesData);
      const payload = await authPostApi(apiEndPoints.SIGN_UP_PATH, valuesData);
      console.log("payload data 9999::::", payload);
      return payload;
    } catch (e) {
      console.log("error 9999::::", e.response.data.responseMessage);
      showError(e.response.data.responseMessage);
    }
  }
);

export const signUpDataSlice = createSlice({
  name: "signUpData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(signUpData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signUpData.fulfilled, (state, { payload }) => {
        console.log("payload data 92255999::::", payload);
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload && payload?.status;
        state.responseData = payload && payload?.data?.data;
      })
      .addCase(signUpData.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const signUpDataReducer = signUpDataSlice.reducer;