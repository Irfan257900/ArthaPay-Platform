import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appClientMethods } from '../core/http.clients';
import { getPayees } from '../modules/payees/http.services';

export const fetchKpis = createAsyncThunk(
  'payees/fetchKpis',
  async ({ showLoading = true }, { rejectWithValue }) => {
    try {
      return await appClientMethods.get(`payees/kpi`);
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
);
export const fetchRecentActivityGraphData = createAsyncThunk(
  'Payee/summary/transactions',
  async ({ showLoading = true }, { rejectWithValue }) => {
    try {
      return await appClientMethods.get(`Payee/summary/transactions`);
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
);

export const fetchPayeeStatusInfo = createAsyncThunk(
  'payees/fetchPayeeStatusInfo',
  async (payeeId, { rejectWithValue }) => {
    try {
      const response = await appClientMethods.get(`payeestatusinfo/${payeeId}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching fiat payees
export const fetchFiatPayees = createAsyncThunk(
  'payees/fetchFiatPayees',
  async ({ pageNo, pageSize, data, search = null }, { rejectWithValue }) => {
    try {
      const response = await getPayees('fiat', pageNo, pageSize, search);

      return {
        data: data ? [...data, ...response?.data] : response?.data,
        loader: false,
        nextPage: pageNo + 1,
        error: ''
      }
    }
    catch (error) {
      return rejectWithValue(error.message)
    }
  }
);

// Async thunk for fetching crypto payees
export const fetchCryptoPayees = createAsyncThunk(
  'payees/fetchCryptoPayees',
  async ({ pageNo, pageSize, data, search = null }, { rejectWithValue }) => {
    try {
      const response = await getPayees('crypto', pageNo, pageSize, search);
      return {
        data: data ? [...data, ...response?.data] : response?.data,
        loader: false,
        nextPage: pageNo + 1,
        error: ''
      };
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
);

const initialState = {
  activeTab: '',
  kpis: { loading: true, data: null, error: '', refreshing: false },
  fiatPayees: { loader: true, data: null, error: '', nextPage: 1 },
  cryptoPayees: { loader: true, data: null, error: '', nextPage: 1 },
  cryptoPayeeDetails: null,
  satoshiTestDetails: null,
  recentActivityGraph: { loading: true, graphData: [], error: '' },
  payeeStatusInfo: { loading: true, data: null, error: '' },
  payeeDetails: null,
  payoutPayee: null
}
// Slice for managing payee data
const payeeSlice = createSlice({
  name: 'payees',
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
    setPayeesDetails: (state, action) => {
      state.payeeDetails = action.payload
    },
    setPayoutPayee: (state, action) => {
      state.payoutPayee = action.payload
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    },
    setCryptoPayeeDetails: (state, action) => {
      state.cryptoPayeeDetails = action.payload;
    },
    setSatoshiTestDetails: (state, action) => {
      state.satoshiTestDetails = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKpis.pending, (state, action) => {
        const { showLoading = true } = action.meta.arg || {};
        if (showLoading) {
          state.kpis = { loading: showLoading, data: null, error: '', refreshing: false };
        } else {
          state.kpis = { loading: showLoading, data: null, error: '', refreshing: true };
        }
      })
      .addCase(fetchKpis.fulfilled, (state, action) => {
        state.kpis.loading = false;
        state.kpis.data = action.payload;
        state.kpis.error = ''
        state.kpis.refreshing = false;
      })
      .addCase(fetchKpis.rejected, (state, action) => {
        state.kpis.loading = false;
        state.kpis.data = null;
        state.kpis.error = action.payload;
        state.kpis.refreshing = false;
      })
      // Fetch fiat payees
      .addCase(fetchFiatPayees.pending, (state) => {
        state.fiatPayees.loader = true;
      })
      .addCase(fetchFiatPayees.fulfilled, (state, action) => {
        state.fiatPayees = { ...state.fiatPayees, ...action.payload };
      })
      .addCase(fetchFiatPayees.rejected, (state, action) => {
        state.fiatPayees.loader = false;
        state.fiatPayees.error = action.payload;
      })
      // Fetch crypto payees
      .addCase(fetchCryptoPayees.pending, (state) => {
        state.cryptoPayees.loader = true;
      })
      .addCase(fetchCryptoPayees.fulfilled, (state, action) => {
        state.cryptoPayees = { ...state.cryptoPayees, ...action.payload };
      })
      .addCase(fetchCryptoPayees.rejected, (state, action) => {
        state.cryptoPayees.loader = false;
        state.cryptoPayees.error = action.payload;
      })
      // Fetch recent activity graph data
      .addCase(fetchRecentActivityGraphData.pending, (state, action) => {
        const { showLoading = true } = action.meta.arg || {};
        state.recentActivityGraph = { loading: showLoading, graphData: null, error: '' };
      })
      .addCase(fetchRecentActivityGraphData.fulfilled, (state, action) => {
        state.recentActivityGraph.loading = false;
        state.recentActivityGraph.graphData = action.payload?.transactionsModels;
        state.recentActivityGraph.error = ''
      })
      .addCase(fetchRecentActivityGraphData.rejected, (state, action) => {
        state.recentActivityGraph.loading = false;
        state.recentActivityGraph.graphData = null;
        state.recentActivityGraph.error = action.payload
      })
      // Fetch payee status info
      .addCase(fetchPayeeStatusInfo.pending, (state) => {
        state.payeeStatusInfo.loading = true;
        state.payeeStatusInfo.data = null;
        state.payeeStatusInfo.error = '';
      })
      .addCase(fetchPayeeStatusInfo.fulfilled, (state, action) => {
        state.payeeStatusInfo.loading = false;
        state.payeeStatusInfo.data = action.payload;
        state.payeeStatusInfo.error = '';
      })
      .addCase(fetchPayeeStatusInfo.rejected, (state, action) => {
        state.payeeStatusInfo.loading = false;
        state.payeeStatusInfo.data = null;
        state.payeeStatusInfo.error = action.payload;
      })

  }
});

export const { setErrorMessages, resetState, setCryptoPayeeDetails, setPayeesDetails, setSatoshiTestDetails, setActiveTab ,setPayoutPayee} = payeeSlice.actions;
export default payeeSlice.reducer;


