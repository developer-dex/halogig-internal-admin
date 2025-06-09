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
export const siteAnalytics = createAsyncThunk(
    "/siteAnalytics",
    async ({ category, page, pageLimit }) => { // Updated to accept page and pageLimit
        try {
            const payload = await getApi(`${apiEndPoints.GET_SITE_ANALYTICS}?page=${page}&limit=${pageLimit}`); // Updated API call
            return payload;
        } catch (e) {
            showError(e.response.data.message);
            // return e;
        }
    }
);

// Export all analytics data without pagination
export const exportSiteAnalytics = createAsyncThunk(
    "/exportSiteAnalytics",
    async () => {
        try {
            const payload = await getApi(`${apiEndPoints.GET_SITE_ANALYTICS}?export=true`);
            return payload;
        } catch (e) {
            showError(e.response.data.message);
        }
    }
);

export const siteAnalyticsSlice = createSlice({
    name: "siteAnalytics",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(siteAnalytics.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(siteAnalytics.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.responseCode = payload?.status;
            state.responseData = payload?.data?.data || {};
        })
        .addCase(siteAnalytics.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        .addCase(exportSiteAnalytics.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(exportSiteAnalytics.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
        })
        .addCase(exportSiteAnalytics.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        });
    },
});

export const siteAnalyticsReducer = siteAnalyticsSlice.reducer;