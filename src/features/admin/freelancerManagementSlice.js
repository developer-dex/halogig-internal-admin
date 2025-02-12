import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";
import { getApi } from "../../services/api";


// Removed TypeScript type annotations
const initialState = {
    isLoading: false,
    isSuccess: false,
    isError: false,
    responseCode: 0,
    responseData: {},
};

// Removed TypeScript type annotations
export const freelancerData = createAsyncThunk(
    "/freelancerData",
    async ({ page, pageLimit }) => { // Updated to accept page and pageLimit
        try {
            const payload = await getApi(`${apiEndPoints.GET_FRELANCER_DATA}?page=${page}&limit=${pageLimit}`); // Updated API call
            return payload;
        } catch (e) {
            showError(e.response.data.message);
            // return e;
        }
    }
);

export const freelancerDataSlice = createSlice({
    name: "freelancerData",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(freelancerData.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(freelancerData.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.responseCode = payload?.status;
            state.responseData = payload?.data?.data || {};
        })
        .addCase(freelancerData.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
    },
});

export const freelancerDataReducer = freelancerDataSlice.reducer;