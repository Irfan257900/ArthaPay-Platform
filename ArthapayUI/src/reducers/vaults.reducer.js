import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { ApiControllers } from "../api/config";
import { appClientMethods } from "../core/http.clients";

const initialState = {
  isNew: false,
  activeTab: '',
  withdrawObj: null,
  withdrawSaveObj: null,
  selectedPayee: null,
  isRefreshTransactionGrid: false,
  isleftPanelRefresh: false,
  networks: [],
  selectedNetwork: null,
  isNextStep: false,
  isSelectionFromRightPanel: false,
  kpis: { loading: true, data: null, error: '' },
  graphDetails: { loading: true, data: [], error: '' },

};
export const fetchKpis = createAsyncThunk(
  'withdraw/fetchKpis',
  async (_, { rejectWithValue }) => {
    try {
      return await appClientMethods.get(`${ApiControllers.vaults}kpi`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
)


export const fetchGraphDetails = createAsyncThunk(
  'summary/transactions',
  async (_, { rejectWithValue }) => {
    try {
      return await appClientMethods.get(`summary/transactions`);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
)

const WithdrawReducer = createSlice({
  name: "withdraw",
  initialState,
  reducers: {
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
    setWithdrawObj: (state, action) => {
      state.withdrawObj = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload
    },
    setWithdrawSaveObj: (state, action) => {
      state.withdrawSaveObj = action.payload;
    },
    setPayee: (state, action) => {
      state.selectedPayee = action.payload;
    },
    setTransactionGridRefresh: (state, action) => {
      state.isRefreshTransactionGrid = action.payload;
    },
    setLeftPanelRefresh: (state, action) => {
      state.isleftPanelRefresh = action.payload;
    },
    setNetWorks: (state, action) => {
      state.networks = action.payload;
    },
    setSelectedNetWork: (state, action) => {
      state.selectedNetwork = action.payload;
    },
    setIsNextStep: (state, action) => {
      state.isNextStep = action.payload;
    },
    setIsSelectionFromRightPanel: (state, action) => {
      state.isSelectionFromRightPanel = action.payload;
    },

  },
  extraReducers: (builder) => {
    builder.addCase(fetchKpis.pending, (state) => {
      state.kpis = { loading: true, data: null, error: '' };
    })
      .addCase(fetchKpis.fulfilled, (state, action) => {
        state.kpis = { loading: false, data: action.payload, error: '' };
      })
      .addCase(fetchKpis.rejected, (state, action) => {
        state.kpis = { loading: flase, data: null, error: action.payload };
      })

      .addCase(fetchGraphDetails.pending, (state) => {
        state.graphDetails = { loading: true, data: [], error: '' };
      })
      .addCase(fetchGraphDetails.fulfilled, (state, action) => {
        state.graphDetails = { loading: false, data: action.payload?.transactionsModels || [], error: '' };
      })
      .addCase(fetchGraphDetails.rejected, (state, action) => {
        state.graphDetails = { loading: false, data: [], error: action.payload };
      })
  }
});

export const { resetState, setActiveTab, updateChange, clearValues, setWithdrawObj, setWithdrawSaveObj, setPayee, setTransactionGridRefresh, setLeftPanelRefresh, setNetWorks, setSelectedNetWork, setIsNextStep, setIsSelectionFromRightPanel } = WithdrawReducer.actions;

export default WithdrawReducer.reducer;