import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { appClientMethods } from "../httpClients";
import { appClientMethods as coreappClientMethods } from '../../../core/http.clients';

const initialState = {
  isleftPanelRefresh: false,
  isNextStep: false,
  fiatRefresh: false,
  kpisData: { loading: false, data: null, error: '' },
  recentActivityGraph: { loading: true, graphData: null, error: '' },
  payoutKycKybrequirementsData: { loading: false, data: null, error: '' },
  payinLookupData: { loading: false, data: null, error: '' },
  addressLookupData: { loading: false, data: null, error: '' },
  saveKycKybrequirementsData: { loading: false, data: null, error: '' },
  beneficiaries: { loading: false, data: [], error: '' },
  uboDetails: { loading: false, data: null, error: '' },
  payoutPersonalDetails: { loading: false, data: null, error: '' },
  selectedPurpose: null,
  selectedSource: null,
  uboBenficiaries: [],
  isRefreshRecentTransations:false
};


export const fetchKpisData = createAsyncThunk(
  "Payments/fetchKpisData",
  async ({ showLoading = true }, { rejectWithValue }) => {
    try {
      const response = await appClientMethods.get('payments/kpi')
      return response
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);



export const fetchRecentActivityGraphData = createAsyncThunk(
  'summary/transactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await appClientMethods.get(`summary/transactions`);
      return response
    } catch (error) {
      return rejectWithValue(error.message)
    }
  }
);


export const payoutKycKybrequirements = createAsyncThunk(
  "Payments/payoutKycKybrequirements",
  async ({ productId }, { rejectWithValue }) => {
    try {
      const response = await appClientMethods.get(`payouts/${productId}/kycrequirements`)
      return response
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const payoutPersonalDetails = createAsyncThunk(
  "Payments/payoutPersonalDetails",
  async (_, { rejectWithValue }) => {
    try {
      const response = await appClientMethods.get(`payments/kycKybdetails`)
      return response
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
)


export const payinLookup = createAsyncThunk(
  "Payments/payinLookup",
  async (_, { rejectWithValue }) => {
    try {
      const response = await coreappClientMethods.get(`payments/lookup`)
      return response
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);



export const addressLookups = createAsyncThunk(
  "Payments/addressLookup",
  async (_, { rejectWithValue }) => {
    try {
      const response = await coreappClientMethods.get('addresses')
      return response
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


export const saveKycKybrequirements = createAsyncThunk(
  "Payments/saveKycKybrequirements",
  async ({ payload }, { rejectWithValue }) => {
    try {
      const response = await appClientMethods.post(`payouts/kycrequirements`, payload)
      return response
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBeneficiaries = createAsyncThunk(
  'Payments/fetchBeneficiaries',
  async (beneficiaryType, { rejectWithValue }) => {
    try {
      const response = await coreappClientMethods.get(`beneficiaries?beneficiaryType=${beneficiaryType}`)
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUboDetails = createAsyncThunk(
  'payments/fetchUboDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await coreappClientMethods.get(`uboDetails?id=${id}`);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const payoutFormSlice = createSlice({
  name: "antdFormData",
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
    setErrorMessages: (state, action) => {
      if (Array.isArray(action.payload) && action.payload?.length > 0) {
        action.payload.forEach(({ key, message }) => {
          state[key].error = message
        });
      }
    },
    setFormData: (state, action) => {
      return { ...state, ...action.payload };
    },
    setRefreshRecentTransaction:(state,action)=>{
       state.isRefreshRecentTransations=action.payload
    },
    setLeftPanelRefresh: (state, action) => {
      state.isleftPanelRefresh = action.payload;
    },
    setIsNextStep: (state, action) => {
      state.isNextStep = action.payload;
    },
    setCryptoDetails: (state, action) => {
      return { ...state, ...action.payload };
    },
    setCryptoDetailsRefresh: (state, action) => {
      state.isleftPanelRefresh = action.payload;
    },
    setCryptoIsNextStep: (state, action) => {
      state.isNextStep = action.payload;
    },
    setFiatIsRefresh: (state, action) => {
      state.fiatRefresh = action.payload;
    },
    setSelectedPurpose: (state, action) => {
      state.selectedPurpose = action.payload
    },
    setSelectedSource: (state, action) => {
      state.selectedSource = action.payload
    },
    setUboBenficiaries: (state, action) => {
      state.uboBenficiaries = action.payload;
    },
    clearFormData: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKpisData.pending, (state, action) => {
        const { showLoading = true } = action.meta.arg || {};
        state.kpisData.loader = showLoading;
        state.kpisData.data = null;
        state.kpisData.error = '';
      })
      .addCase(fetchKpisData.fulfilled, (state, action) => {
        state.kpisData.loader = false;
        state.kpisData.error = '';
        state.kpisData.data = action.payload;
      })
      .addCase(fetchKpisData.rejected, (state, action) => {
        state.kpisData.loader = false;
        state.kpisData.error = action.payload;
        state.kpisData.data = null;
      })
      .addCase(fetchRecentActivityGraphData.pending, (state) => {
        state.recentActivityGraph = { loading: true, graphData: null, error: '' };
      })
      .addCase(fetchRecentActivityGraphData.fulfilled, (state, action) => {
        state.recentActivityGraph = { loading: false, graphData: action.payload?.transactionsModels, error: '' };
      })
      .addCase(fetchRecentActivityGraphData.rejected, (state, action) => {
        state.recentActivityGraph = { loading: false, graphData: null, error: action.payload };
      })
      .addCase(payoutKycKybrequirements.pending, (state) => {
        state.payoutKycKybrequirementsData = { loading: true, data: null, error: '' };
      })
      .addCase(payoutKycKybrequirements.fulfilled, (state, action) => {
        state.payoutKycKybrequirementsData = { loading: false, data: action.payload, error: '' };
      })
      .addCase(payoutKycKybrequirements.rejected, (state, action) => {
        state.payoutKycKybrequirementsData = { loading: false, data: null, error: action.payload };
      })
      .addCase(payinLookup.pending, (state) => {
        state.payinLookupData = { loading: true, data: null, error: '' };
      })
      .addCase(payinLookup.fulfilled, (state, action) => {
        state.payinLookupData = { loading: false, data: action.payload, error: '' };
      })
      .addCase(payinLookup.rejected, (state, action) => {
        state.payinLookupData = { loading: false, data: null, error: action.payload };
      })
      .addCase(addressLookups.pending, (state) => {
        state.addressLookupData = { loading: true, data: null, error: '' };
      })
      .addCase(addressLookups.fulfilled, (state, action) => {
        state.addressLookupData = { loading: false, data: action.payload, error: '' };
      })
      .addCase(addressLookups.rejected, (state, action) => {
        state.addressLookupData = { loading: false, data: null, error: action.payload };
      })
      .addCase(saveKycKybrequirements.pending, (state) => {
        state.saveKycKybrequirementsData = { loading: true, data: null, error: '' };
      })
      .addCase(saveKycKybrequirements.fulfilled, (state, action) => {
        state.saveKycKybrequirementsData = { loading: false, data: action.payload, error: '' };
        action.meta.arg.onSuccess?.()
      })
      .addCase(saveKycKybrequirements.rejected, (state, action) => {
        state.saveKycKybrequirementsData = { loading: false, data: null, error: action.payload };
      })
      .addCase(fetchBeneficiaries.pending, (state) => {
        state.beneficiaries.loading = true;
        state.beneficiaries.error = '';
      })
      .addCase(fetchBeneficiaries.fulfilled, (state, action) => {
        state.beneficiaries.loading = false;
        state.beneficiaries.data = action.payload;
        state.beneficiaries.error = '';
      })
      .addCase(fetchBeneficiaries.rejected, (state, action) => {
        state.beneficiaries.loading = false;
        state.beneficiaries.data = [];
        state.beneficiaries.error = action.payload;
      })
      .addCase(fetchUboDetails.pending, (state) => {
        state.uboDetails.loading = true;
        state.uboDetails.error = '';
      })
      .addCase(fetchUboDetails.fulfilled, (state, action) => {
        state.uboDetails.loading = false;
        state.uboDetails.data = action.payload;
        state.uboDetails.error = '';
      })
      .addCase(fetchUboDetails.rejected, (state, action) => {
        state.uboDetails.loading = false;
        state.uboDetails.data = null;
        state.uboDetails.error = action.payload;
      })
      .addCase(payoutPersonalDetails.pending, (state) => {
        state.payoutPersonalDetails.loading = true;
        state.payoutPersonalDetails.error = '';
      })
      .addCase(payoutPersonalDetails.fulfilled, (state, action) => {
        state.payoutPersonalDetails.loading = false;
        state.payoutPersonalDetails.data = action.payload;
        state.payoutPersonalDetails.error = '';
      })
      .addCase(payoutPersonalDetails.rejected, (state, action) => {
        state.payoutPersonalDetails.loading = false;
        state.payoutPersonalDetails.data = null;
        state.payoutPersonalDetails.error = action.payload;
      });
  },
});

export const { resetState, setFormData, clearFormData, setLeftPanelRefresh, setIsNextStep, setCryptoDetails, setCryptoDetailsRefresh, setCryptoIsNextStep, setFiatIsRefresh, setSelectedPurpose, setSelectedSource, setUboBenficiaries, setErrorMessages,setRefreshRecentTransaction } = payoutFormSlice.actions;

export default payoutFormSlice.reducer;