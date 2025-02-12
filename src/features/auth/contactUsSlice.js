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
export const contactUsData = createAsyncThunk(
  "/contactUsData",
  async (values) => { // Removed type annotation for values
    try {
      const valuesData = values;
      
      const payload = await authPostApi(apiEndPoints.CONTACT_US_PATH, valuesData);
      
      return payload;
    } catch (e) {
      showError(e.response.data.responseMessage);
    }
  }
);

export const contactUsDataSlice = createSlice({
  name: "contactUsData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(contactUsData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(contactUsData.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload && payload.status; // Removed optional chaining
        state.responseData = payload && payload.data.data; // Removed optional chaining
      })
      .addCase(contactUsData.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
      });
  },
});

export const contactUsDataReducer = contactUsDataSlice.reducer;