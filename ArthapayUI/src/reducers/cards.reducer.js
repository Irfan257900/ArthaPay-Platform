import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { cardClientMethods } from '../modules/cards/httpClients';
const initialState = {
    activeTab: '',
    kpis: { loading: true, data: null, error: '' },
    myCards: { loading: true, data: null, error: '', selected: null },
    cardsToApply: { loading: true, data: null, error: '', selected: null },
    actionDrawer: '',
    cardsToBind: { loading: true, data: null, error: '' },
    cardToBind: { loading: true, data: null, error: '' },
    applyCardKycInfo: null,
    graphDetails: { loading: true, data: [], error: '' },
    isloadBalance:true,
    availableBalance:{ loading: true, data: null, error: '' },
    selectedAvailableBalance: null,
    coins: [],
    dropdownVisible: false,
    mbDDvisible: false,
    selectedCoin: "USD",
    currentStep:0,
    stepsError: null
}
export const fetchKpis = createAsyncThunk(
    'cards/fetchKpis',
     async ({showLoading = true},{rejectWithValue}) => {//NOSONAR
        try {
            return await cardClientMethods.get(`cards/Kpi`);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)
export const fetchCardToBind= createAsyncThunk(
    'cards/fetchCardToBind',
    async ({id}, { rejectWithValue }) => {
        try {
            return await cardClientMethods.get(`cards/physical/bind`);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)
export const fetchGraphDetails = createAsyncThunk(
    'cards/fetchGraphDetails',
    async ({showLoading = true}, { rejectWithValue }) => {//NOSONAR
        try {
            return await cardClientMethods.get(`summary/transactions`);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)
export const getMyCradsAvailableBalance = createAsyncThunk(
    'cards/getMyCradsAvailableBalance',
    async ({ onSuccess } = {}, { rejectWithValue,dispatch }) => {
        try {
            const response = await cardClientMethods.get(`cards/balances/summary`);
            const reconstructedCoins = response.coins?.split(',')?.map((code) => ({
                name: code,
                code,
                eur:response.eur,
                usd:response.usd
            }));
            dispatch(setSelectedAvailableBalance(response?.usd));
            dispatch(setCoins(reconstructedCoins));
            if (onSuccess) onSuccess(response);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)
const cardsSlice = createSlice({
    name: 'cards',
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
        setActiveTab:(state,action)=>{
            state.activeTab=action.payload
        },
        setApplyCardKycInfo(state, action) {
            state.applyCardKycInfo =  action.payload
        },
        setIsloadBalance(state, action) { 
            state.isloadBalance =  action.payload
        },
        setSelectedAvailableBalance(state, action) {
            state.selectedAvailableBalance =  action.payload
        },
        setCoins(state, action) {
            state.coins =  action.payload
        },
        setDropdownVisible(state, action) {
            state.dropdownVisible =  action.payload
        },
        setSelectedCoin(state, action) {
            state.selectedCoin =  action.payload
        },
        setMbDDvisible(state, action) {
            state.mbDDvisible =  action.payload
        },
        setCurrentStep(state, action) {
            state.currentStep =  action.payload
        },
        setStepsError(state, action) {
            state.stepsError = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchKpis.pending, (state, action) => {
                const { showLoading = true } = action.meta.arg || {};
                state.kpis = { loading: showLoading, data: null, error: '' };
            })
            .addCase(fetchKpis.fulfilled, (state, action) => {
                state.kpis = { loading: false, data: action.payload, error: '' };
            })
            .addCase(fetchKpis.rejected, (state, action) => {
                state.kpis = { loading: false, data: null, error: action.payload };
            })
            .addCase(fetchCardToBind.pending, (state) => {
                state.cardToBind = { loading: true, data: null, error: '' };
            })
            .addCase(fetchCardToBind.fulfilled, (state, action) => {
                state.cardToBind = { loading: false, data: action.payload, error: '' };
            })
            .addCase(fetchCardToBind.rejected, (state, action) => {
                state.cardToBind = { loading: false, data: null, error: action.payload };
            })
            .addCase(fetchGraphDetails.pending, (state, action) => {
                const { showLoading = true } = action.meta.arg || {};
                state.graphDetails = { loading: showLoading, data: [], error: '' };
            })
            .addCase(fetchGraphDetails.fulfilled, (state, action) => {
                state.graphDetails = { loading: false, data: action.payload?.transactionsModels || [], error: '' };
            })
            .addCase(fetchGraphDetails.rejected, (state, action) => {
                state.graphDetails = { loading: false, data: [], error: action.payload };
            })
            .addCase(getMyCradsAvailableBalance.pending, (state) => {
                state.availableBalance = { loading: true, data: null, error: '' };
            })
            .addCase(getMyCradsAvailableBalance.fulfilled, (state, action) => {
                state.availableBalance = { loading: false, data: action.payload, error: '' };
            })
            .addCase(getMyCradsAvailableBalance.rejected, (state, action) => {
                state.availableBalance = { loading: false, data: null, error: action.payload };
            })
    },
});
export const { setErrorMessages, resetState,setActiveTab,setApplyCardKycInfo,setIsloadBalance,setSelectedAvailableBalance,setCoins,setDropdownVisible,setSelectedCoin,setMbDDvisible,setCurrentStep,setStepsError } = cardsSlice.actions
export default cardsSlice.reducer;
