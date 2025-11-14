import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchAccountDetails, fetchAccountsForCreation, getDetails, fetchDepositAccountBanks } from '../modules/banks/http.services';

// Async Thunks for fetching data
export const getAccounts = createAsyncThunk(
  'accounts/getAccounts',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState()
      const userId = state.userConfig.details.id
      const response = await getDetails(userId);
      if (response) {
        return { data: response };
      }
      return rejectWithValue(response.originalError?.message || response.error || response);
    } catch (error) {
      return rejectWithValue(error.message || error);
    }
  }
);

export const getAccountsForCreation = createAsyncThunk(
  'accounts/getAccountsForCreation',
  async ({ rejectWithValue }) => {
    try {
      const response = await fetchAccountsForCreation();
      if (response) {
        return { data: response };
      }
      return rejectWithValue(response.originalError.message || response.error || response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAccountDetails = createAsyncThunk(
  'accounts/getAccountDetails',
  async ({ id }, { rejectWithValue }) => {
    try {
      return await fetchAccountDetails(id);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAccountBanks = createAsyncThunk(
  'accounts/getAccountBanks',
  async ({ currency }, { rejectWithValue }) => {
    try {
      return await fetchDepositAccountBanks(currency);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  totalAmount: 0,
  accounts: { loader: true, data: null, error: '' },
  accountsForCreation: { loader: false, data: null, error: '' },
  accountDetails: { loading: true, data: null, error: '' },
  accountBanks: { loading: true, data: null, error: '' },
  transactionId: '',
  selectedCurrency: null,
  selectedBank: null,
  detailsForReview: { loader: false, data: null, error: '' },
  countries: { loader: false, data: null, error: '' },
  states: { loader: false, data: null, error: '' },
  entityTypes: { loader: false, data: null, error: '' },
  isRefresh: false,
  selectedPaymentSchema: null
}
// Create the slice
const accountsSlice = createSlice({
  name: 'accounts',
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
    setSelectedPaymentSchema: (state, action) => {
      state.selectedPaymentSchema = action.payload;
    },
    setSelectedCurrency: (state, action) => {
      state.selectedCurrency = action.payload;
    },
    setSelectedBank: (state, action) => {
      state.selectedBank = action.payload;
    },
    transactionId: (state, action) => {
      state.transactionId = action.payload;
    },
    setIsRefresh: (state, action) => {
      state.isRefresh = action.payload;
    },
    clearError: (state, action) => {
      state[action.payload.type].error = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAccounts.pending, (state) => {
        state.accounts.loader = { loader: true, data: null, error: '' };
      })
      .addCase(getAccounts.fulfilled, (state, action) => {
        state.totalAmount = action.payload.data.totalAmount
        state.accounts = { loader: false, data: action.payload.data.accounts, error: '' };
      })
      .addCase(getAccounts.rejected, (state, action) => {
        state.accounts = { loader: false, data: null, error: action.payload };
      })

      .addCase(getAccountsForCreation.pending, (state) => {
        state.accountsForCreation.loader = true;
      })
      .addCase(getAccountsForCreation.fulfilled, (state, action) => {
        state.accountsForCreation = { loader: false, data: action.payload.data, error: '' };
      })
      .addCase(getAccountsForCreation.rejected, (state, action) => {
        state.accountsForCreation = { loader: false, data: null, error: action.payload };
      })

      .addCase(getAccountDetails.pending, (state) => {
        state.accountDetails.loading = true;
        state.accountDetails.data = null;
        state.accountDetails.error = ''
      })
      .addCase(getAccountDetails.fulfilled, (state, action) => {
        state.accountDetails.loading = false;
        state.accountDetails.data = action.payload;
        state.accountDetails.error = ''
      })
      .addCase(getAccountDetails.rejected, (state, action) => {
        state.accountDetails.loading = false;
        state.accountDetails.data = null;
        state.accountDetails.error = action.payload
      })

      .addCase(getAccountBanks.pending, (state) => {
        state.accountBanks.loading = true;
        state.accountBanks.data = null
        state.accountBanks.error = ""
      })
      .addCase(getAccountBanks.fulfilled, (state, action) => {
        state.accountBanks.loading = false;
        state.accountBanks.data = action.payload
        state.accountBanks.error = ""
      })
      .addCase(getAccountBanks.rejected, (state, action) => {
        state.accountBanks.loading = false;
        state.accountBanks.data = null
        state.accountBanks.error = action.payload
      })
  },
});

export const { setErrorMessages, resetState, setSelectedBank, setSelectedCurrency, transactionId, clearError, setIsRefresh,setSelectedPaymentSchema } = accountsSlice.actions;

export default accountsSlice.reducer;
