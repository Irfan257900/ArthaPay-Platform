import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { appClientMethods } from "../core/http.clients";
import { ApiControllers } from "../api/config";
const { common: commonController } = ApiControllers
const initialState = {
  isNew: false,
  withdrawVerifyObj: {},
  addresses: { loading: true, data: null, total: 0, pageSize: 10, page: 1, error: '', selectedAddress: null },
};
export const fetchAddresses = createAsyncThunk(
  'userProfile/fetchAddresses',
  async ({ page }, { rejectWithValue, getState }) => {
    try {
      const state = getState()
      const userId = state.userConfig.details.id
      const { pageSize } = state.profileStore.addresses
      return await appClientMethods.get(`customer/addresses?page=${page}&pageSize=${pageSize}`)
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
)
const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    setErrorMessages: (state, action) => {
      if (Array.isArray(action.payload) && action.payload?.length > 0) {
        action.payload.forEach(({ key, message }) => {
          state[key].error = message
        });
      }
    },
    resetState: (state, action) => {
      if (Array.isArray(action.payload) && action.payload?.length > 0) {
        action.payload.forEach(key => {
          state[key] = initialState[key]
        });
      } else {
        return initialState;
      }
    },
    updateChange: (state) => {
      state.isNew = true;
    },
    clearValues: (state) => {
      state.isNew = false;
    },
    withdrawVerifyObj: (state, action) => {
      state.withdrawVerifyObj = action.payload;
    },
    setSelectedAddress: (state, action) => {
      state.addresses.selectedAddress = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.addresses.loading = true;
        state.addresses.error = '';
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addresses.loading = false;
        state.addresses.error = '';
        state.addresses.data = action.payload.data;
        state.addresses.total = action.payload.total
        state.addresses.page = action.meta.arg.page
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.addresses.loading = false;
        state.addresses.error = action.payload;
        state.addresses.data = null;
        state.addresses.page = action.meta.arg.page
      })
  }
});

export const { updateChange, clearValues, withdrawVerifyObj, setErrorMessages, resetState, setSelectedAddress } = userProfileSlice.actions;

export default userProfileSlice.reducer;
