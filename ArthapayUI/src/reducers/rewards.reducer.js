import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAccountsForCreation } from '../modules/banks/http.services';
import { loyaltyAppClientMethods } from '../core/http.clients';


const initialState = {
  rewardsDetails: { loading: false, data: null, error: null },
  walletDetails: { loading: false, data: null, error: null },
  questsDetails: { loading: false, data: null, error: null },
  mysteryBoxes: { loading: false, data: null, error: null },
  dashboard: { loading: false, data: null, error: null },
}

export const fetchDashboard = createAsyncThunk(
  'rewards/fetchDashboard',
  async (_, { rejectWithValue, getState }) => {
    try {
      const customerId = getState().userConfig?.details?.id;
      const response = await loyaltyAppClientMethods.get(`loyalty/dashboard/${customerId}`, '');
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const getRewardsDetails = createAsyncThunk(
  'rewards/getRewardsDetails',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAccountsForCreation(); // This is static data, replace with actual API call if needed
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const getWalletDetails = createAsyncThunk(
  'rewards/getWalletDetails',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAccountsForCreation(); // This is static data, replace with actual API call if needed
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const getQuestsDetails = createAsyncThunk(
  'rewards/getQuestsDetails',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAccountsForCreation(); // This is static data, replace with actual API call if needed
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getMysteryBoxes = createAsyncThunk(
  'rewards/getMysteryBoxes',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchAccountsForCreation(); // This is static data, replace with actual API call if needed
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);



const rewardsSlice = createSlice({
  name: 'rewards',
  initialState,
  reducers: {
    clearErrorMessage: (state, action) => {
      if (Array.isArray(action.payload) && action.payload?.length > 0) {
        action.payload.forEach(key => {
          state[key].error = initialState[key].error
        });
      } else {
        state.error = null
      }
    },
    setErrorMessage: (state, action) => {
      if (Array.isArray(action.payload) && action.payload?.length > 0) {
        action.payload.forEach(({ key, message }) => {
          state[key].error = message
        });
      } else {
        state.error = action.payload
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(getRewardsDetails.pending, (state) => {
        state.rewardsDetails.loading = true;
        state.rewardsDetails.error = null;
      })
      .addCase(getRewardsDetails.fulfilled, (state, action) => {
        state.rewardsDetails.loading = false;
        state.rewardsDetails.data = action.payload;
      })
      .addCase(getRewardsDetails.rejected, (state, action) => {
        state.rewardsDetails.loading = false;
        state.rewardsDetails.error = action.payload;
      })
      .addCase(getWalletDetails.pending, (state) => {
        state.walletDetails.loading = true;
        state.walletDetails.error = null;
      })
      .addCase(getWalletDetails.fulfilled, (state, action) => {
        state.walletDetails.loading = false;
        state.walletDetails.data = action.payload;
      })
      .addCase(getWalletDetails.rejected, (state, action) => {
        state.walletDetails.loading = false;
        state.walletDetails.error = action.payload;
      })
      .addCase(getQuestsDetails.pending, (state) => {
        state.questsDetails.loading = true;
        state.questsDetails.error = null;
      })
      .addCase(getQuestsDetails.fulfilled, (state, action) => {
        state.questsDetails.loading = false;
        state.questsDetails.data = action.payload;
      })
      .addCase(getQuestsDetails.rejected, (state, action) => {
        state.questsDetails.loading = false;
        state.questsDetails.error = action.payload;
      })
      .addCase(getMysteryBoxes.pending, (state) => {
        state.mysteryBoxes.loading = true;
        state.mysteryBoxes.error = null;
      })
      .addCase(getMysteryBoxes.fulfilled, (state, action) => {
        state.mysteryBoxes.loading = false;
        state.mysteryBoxes.data = action.payload;
      })
      .addCase(getMysteryBoxes.rejected, (state, action) => {
        state.mysteryBoxes.loading = false;
        state.mysteryBoxes.error = action.payload;
      })
      .addCase(fetchDashboard.pending, (state) => {
        state.dashboard.loading = true;
        state.dashboard.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.data = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.dashboard.loading = false;
        state.dashboard.error = action.payload;
      });
  },
});

export const {
  clearErrorMessage,setErrorMessage,resetState} = rewardsSlice.actions;
export default rewardsSlice.reducer;

