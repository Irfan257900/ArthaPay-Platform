import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { batchPayOutMerchatDetails, fetchBatchPayoutDetail } from "../api/services";
import { appClientMethods } from "../httpClients";
let initialState = {
    batchPaymentDetails: null,
    marchantsDetails : { loading: false, data: [] , error:null },
    paymentViewData:{ loading: false, data: null , error:null },
    leftPannelData :{ loading: false, data: [] , error:null }
}

export const fetchMerchantsDetails = createAsyncThunk(
    'batchPayoutsReducer/fetchMerchantsDetails',
    async (_,{rejectWithValue}) => {
        try {
            const response = await  batchPayOutMerchatDetails('Merchant/GetMerchantDetails');
                return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const getBatchPayoutDetails = createAsyncThunk(
    'batchPayoutsReducer/getBatchPayoutDetails',
    async ({ batchId },{rejectWithValue}) => {
        try {
            const response = await  fetchBatchPayoutDetail(batchId);
                return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchLeftPannelData = createAsyncThunk(
    'batchPayoutsReducer/fetchLeftPannelData',
    async ({url },{rejectWithValue}) => {
        try {
            const response = await  appClientMethods.get(url);
            if (response) {
                return response;
            } else {
                throw new Error(response);
            }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
const setLoading = (state, key) => {
    state[key].loading = true;
    state[key].error = null;
};

const setData = (
    state,
    action,
    key
) => {
    state[key].loading = false;
    state[key].data = action.payload;
};

const setError = (
    state,
    action,
    key
) => {
    state[key].loading = false;
    state[key].error = action.payload || 'Failed to fetch data';
};
  export const batchPayoutsReducer = createSlice({
    name: 'batchPayoutsReducer',
    initialState,
    reducers: {
        clearError: {
            reducer: (state, action) => {
                state[action.payload].error = ''
            },
            prepare: (key) => {
                return { payload: key };
            }
        },
        setBatchPaymentDetails: (state, action) => {
            state.batchPaymentDetails = action.payload;
          },
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchMerchantsDetails.pending, (state) =>
            setLoading(state, 'marchantsDetails')
        )
        .addCase(
            fetchMerchantsDetails.fulfilled,
            (state, action) =>
                setData(state, action, 'marchantsDetails')
        )
        .addCase(
            fetchMerchantsDetails.rejected,
            (state, action) =>
                setError(state, action, 'marchantsDetails')
        )
        .addCase(getBatchPayoutDetails.pending, (state) =>
            setLoading(state, 'paymentViewData')
        )
        .addCase(
            getBatchPayoutDetails.fulfilled,
            (state, action) =>
                setData(state, action, 'paymentViewData')
        )
        .addCase(
            getBatchPayoutDetails.rejected,
            (state, action) =>
                setError(state, action, 'paymentViewData')
        )
        .addCase(fetchLeftPannelData.pending, (state) =>
            setLoading(state, 'leftPannelData')
        )
        .addCase(
            fetchLeftPannelData.fulfilled,
            (state, action) =>
                setData(state, action, 'leftPannelData')
        )
        .addCase(
            fetchLeftPannelData.rejected,
            (state, action) =>
                setError(state, action, 'leftPannelData')   
        )
    }
});

export const { setBatchPaymentDetails,clearError } = batchPayoutsReducer.actions;
export default batchPayoutsReducer.reducer;
