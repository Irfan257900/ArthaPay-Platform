import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { publishTransactionRefresh } from "../utils/pubSub";

const initialState = {
  notificationCount: 0,
  loading:false,
};

export const fetchDashboardCalls = createAsyncThunk(
  "dashboard/fetchDashboardCalls",
  async () => {
    publishTransactionRefresh();
  }
);
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setNotificationCount: (state, action) => {
      let count = action.payload;
      if (count < 0) count = 0;
      state.notificationCount = count;
    },
    transactions: { loader: true, data: null, error: "", nextPage: 1 },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchDashboardCalls.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(fetchDashboardCalls.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(fetchDashboardCalls.rejected, (state) => {
      state.loading = false;
    });
  },
});

export const { setNotificationCount } =
  dashboardSlice.actions;
export default dashboardSlice.reducer;
