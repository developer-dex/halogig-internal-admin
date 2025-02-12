import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";
import { getApi, patchApi } from "../../services/api";


// Removed TypeScript type annotations
const initialState = {
    isLoading: false,
    isSuccess: false,
    isError: false,
    responseCode: 0,
    responseData: {},
};

// Removed TypeScript type annotations
export const clientData = createAsyncThunk(
    "/clientData",
    async ({ category, page, pageLimit }) => { // Updated to accept page and pageLimit
        try {
            const payload = await getApi(`${apiEndPoints.GET_CLIENT_DATA}?page=${page}&limit=${pageLimit}`); // Updated API call
            return payload;
        } catch (e) {
            showError(e.response.data.message);
            // return e;
        }
    }
);

export const statusChange = createAsyncThunk(
    "/statusChange",
    async (id, apiData) => { // Accept id as a parameter
        try {
            const payload = await patchApi(`${apiEndPoints.STATUS_UPDATE}/${id}/status`, apiData); // Updated API call to include id
            return payload;
        } catch (e) {
            showError(e.response.data.message);
        }
    }
);

export const clientDataSlice = createSlice({
    name: "clientData",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(clientData.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(clientData.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.responseCode = payload?.status;
            state.responseData = payload?.data?.data || {};
        })
        .addCase(clientData.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
    },
});

export const clientDataReducer = clientDataSlice.reducer;