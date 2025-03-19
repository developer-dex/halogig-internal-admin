import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";
import { getApi, patchApi, postApi } from "../../services/api";


// Removed TypeScript type annotations
const initialState = {
    isLoading: false,
    isSuccess: false,
    isError: false,
    responseCode: 0,
    responseData: {},
    enrollAsData: [],
    countryData: []
};

// Removed TypeScript type annotations
export const contactData = createAsyncThunk(
    "/contactData",
    async ({ category, page, pageLimit }) => { // Updated to accept page and pageLimit
        try {
            const payload = await getApi(`${apiEndPoints.GET_CONTACT_US}?page=${page}&limit=${pageLimit}`); // Updated API call
            return payload;
        } catch (e) {
            showError(e.response.data.message);
            // return e;
        }
    }
);

export const getEnrollAsData = createAsyncThunk(
    "/getEnrollAsData",
    async () => {
        try {
            const payload = await getApi(apiEndPoints.GET_ENROLL_AS);
            return payload;
        } catch (e) {
            showError(e.response.data.message);
        }
    }
);
export const getIndustryData = createAsyncThunk(
    "/getIndustryData",
    async () => {
        try {
            const payload = await getApi(apiEndPoints.GET_INDUSTRY);
            return payload;
        } catch (e) {
            showError(e.response.data.message);
        }
    }
);

export const getCountryData = createAsyncThunk(
    "/getCountryData",
    async () => {
        try {
            const payload = await getApi(apiEndPoints.GET_COUNTRIES);
            return payload;
        } catch (e) {
            showError(e.response.data.message);
        }
    }
);

export const addClient = createAsyncThunk(
    "/addClient",
    async (data) => {
        try {
            const payload = await postApi(apiEndPoints.ADD_CLIENT, data);
            return payload;
        } catch (e) {
            showError(e.response.data.message);
            throw e;
        }
    }
);

export const contactDataSlice = createSlice({
    name: "contactData",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(contactData.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(contactData.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.responseCode = payload?.status;
            state.responseData = payload?.data?.data || {};
        })
        .addCase(contactData.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        // Add cases for enrollAs data
        .addCase(getEnrollAsData.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(getEnrollAsData.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.enrollAsData = payload?.data?.data || [];
        })
        .addCase(getEnrollAsData.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        // Add cases for country data
        .addCase(getCountryData.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(getCountryData.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.countryData = payload?.data?.data || [];
        })
        .addCase(getCountryData.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        .addCase(addClient.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(addClient.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.responseCode = payload?.status;
            state.responseData = payload?.data?.data || {};
        })
        .addCase(addClient.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        .addCase(getIndustryData.pending, (state) => {
            state.isLoading = true;
        })
        .addCase(getIndustryData.fulfilled, (state, { payload }) => {
            state.isLoading = false;
            state.isSuccess = true;
            state.industryData = payload?.data?.data || [];
        })
        .addCase(getIndustryData.rejected, (state) => {
            state.isLoading = false;
            state.isError = true;
        })
        
    },
});

export const contactDataReducer = contactDataSlice.reducer;