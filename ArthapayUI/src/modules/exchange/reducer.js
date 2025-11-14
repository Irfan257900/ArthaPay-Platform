import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appClientMethods } from './http.clients';
 
export const fetchKpis = createAsyncThunk(
    'exchange/fetchKpis',
    async ({ showLoading = true }, { rejectWithValue }) => {
        try {
            return await appClientMethods.get(`exchange/kpi`);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
 
export const fetchRecentActivityGraphData = createAsyncThunk(
    'summary/transactions',
    async (_, { rejectWithValue }) => {
        try {
            return await appClientMethods.get(`summary/transactions`);
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
);
 
const initialState = {
    kpis: { loading: true, data: [], error: '' },
    recentActivityGraph: { loading: true, graphData: [], error: '' }
 
};
 
const exchangeSlice = createSlice({
    name: 'exchange',
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
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchKpis.pending, (state, action) => {
                const { showLoading = true } = action.meta.arg || {};
                state.kpis = {
                    ...state.kpis,
                    loading: showLoading,
                    error: '',
                };
            })
            .addCase(fetchKpis.fulfilled, (state, action) => {
                state.kpis = { loading: '', data: action.payload, error: '' };
            })
            .addCase(fetchKpis.rejected, (state, action) => {
                state.kpis = { loading: '', data: [], error: action.payload };
            })
            .addCase(fetchRecentActivityGraphData.pending, (state) => {
                state.recentActivityGraph = { loading: true, graphData: [], error: '' };
            })
            .addCase(fetchRecentActivityGraphData.fulfilled, (state, action) => {
                state.recentActivityGraph = { loading: false, graphData: action.payload?.transactionsModels, error: '' };
            })
            .addCase(fetchRecentActivityGraphData.rejected, (state, action) => {
                state.recentActivityGraph = { loading: false, graphData: [], error: action.payload };
            });
    },
});
 
export const { resetState, setErrorMessages } = exchangeSlice.actions;
export default exchangeSlice.reducer;
 
 