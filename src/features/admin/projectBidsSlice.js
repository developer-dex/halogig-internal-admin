import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiEndPoints } from "../../config/path";
import { showError } from "../../helpers/messageHelper";
import { getApi } from "../../services/api";

const initialState = {
  isLoading: false,
  isSuccess: false,
  isError: false,
  responseCode: 0,
  responseData: {},
  bids: [],
  totalCount: 0,
  currentBid: null,
};

// Get all project bids (admin view)
export const getAllProjectBids = createAsyncThunk(
  "/getAllProjectBids",
  async ({ page, pageLimit }) => {
    try {
      const payload = await getApi(`${apiEndPoints.GET_ALL_PROJECT_BIDS}?page=${page}&limit=${pageLimit}`);
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to fetch project bids");
      throw e;
    }
  }
);

// Get project bid details by ID
export const getProjectBidDetails = createAsyncThunk(
  "/getProjectBidDetails",
  async (bidId) => {
    try {
      const payload = await getApi(`${apiEndPoints.GET_PROJECT_BID_DETAILS}/${bidId}`);
      return payload;
    } catch (e) {
      showError(e.response?.data?.message || "Failed to fetch bid details");
      throw e;
    }
  }
);

export const projectBidsSlice = createSlice({
  name: "projectBids",
  initialState,
  reducers: {
    clearProjectBidsState: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.responseCode = 0;
      state.responseData = {};
      state.bids = [];
      state.totalCount = 0;
      state.currentBid = null;
    },
    clearCurrentBid: (state) => {
      state.currentBid = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // GetAllProjectBids
      .addCase(getAllProjectBids.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getAllProjectBids.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
        state.bids = payload?.data?.data?.bids || [];
        state.totalCount = payload?.data?.data?.total_count || 0;
      })
      .addCase(getAllProjectBids.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      })
      // GetProjectBidDetails
      .addCase(getProjectBidDetails.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.isSuccess = false;
      })
      .addCase(getProjectBidDetails.fulfilled, (state, { payload }) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.responseCode = payload?.status;
        state.currentBid = payload?.data?.data || null;
      })
      .addCase(getProjectBidDetails.rejected, (state) => {
        state.isLoading = false;
        state.isError = true;
        state.isSuccess = false;
      });
  },
});

export const { clearProjectBidsState, clearCurrentBid } = projectBidsSlice.actions;
export const projectBidsReducer = projectBidsSlice.reducer;

