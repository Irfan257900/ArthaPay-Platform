import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { appClientMethods } from "../httpClients";


const initialState = {
    coinDetails: { loading: false, data: null, error: '' },
    preview: { loading: false, data: null, error: '' },
    fiatDetails: { loading: false, data: null, error: '' },
    currencyLists: { loading: false, data: null, error: '' },
    paymentLinkDetails: { loading: false, data: null, error: '' },
    savePaymentLinks: { loading: false, data: null, error: '' },
    selectedFiatCoin: null,
    selectedCurrencyIDR: null,
    isFiatPreviewModalOpen: false,
    selectedPayinWallet: null
}


export const fetchCoinDetails = createAsyncThunk(
    'payin/fetchCoinDetails',
    async (_, { rejectWithValue }) => {
        try {
            const response = await appClientMethods.get('payments/merchants');
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchFiatDetails = createAsyncThunk(
    'payin/fetchFiatDetails',
    async (_, { rejectWithValue }) => {
        try {
            const response = await appClientMethods.get(`payments/fiatwallets/lookup`);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const getPayinCurrencyLists = createAsyncThunk(
    'payin/getPayinCurrencyLists',
    async ({ faitCoint, setDetailsView, navigate, navigateOrNot }, { rejectWithValue }) => {
        try {
            const response = await appClientMethods.get(`payments/payin/fiat/${faitCoint}`
                // `payments/payin/fiat/${faitCoint}`
            );
            const firstCoint = response?.[0]
            setDetailsView?.(firstCoint);
            if (navigateOrNot) {
                navigate(`/payments/payins/payin/${firstCoint?.id}/${firstCoint?.code}/view/${firstCoint?.type}/fiat`)
            }
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const getPayinFiatPreview = createAsyncThunk(
    'payin/getPayinFiatPreview',
    async (obj, { rejectWithValue }) => {
        try {
            const response = await appClientMethods.post(`payments/payin/fiat/preview`, obj);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const getPaymentLinks = createAsyncThunk(
    'payin/getPaymentLinks',
    async ({ id }, { rejectWithValue }) => {
        try {
            const response = await appClientMethods.get(`payments/payin/fiat/${id}/view`);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const savePaymentLink = createAsyncThunk(
    'payin/savePaymentLink',
    async ({ saveObject }, { rejectWithValue }) => {
        try {
            const response = await appClientMethods.post(`payments/payin/standardInvoice`, saveObject);
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);




const payinSlice = createSlice({
    name: "payin",
    initialState,
    reducers: {
        setErrorMessages: (state, action) => {
            if (Array.isArray(action.payload) && action.payload?.length > 0) {
                action.payload.forEach(({ key, message }) => {
                    state[key].error = message
                });
            }
        },
        setSelectedFiatCoin: (state, action) => {
            state.selectedFiatCoin = action.payload;
        },
        setSelectedCurrencyIDR: (state, action) => {
            state.selectedCurrencyIDR = action.payload;
        },
        showFiatPreviewModal: (state) => {
            state.isFiatPreviewModalOpen = true;
        },
        hideFiatPreviewModal: (state) => {
            state.isFiatPreviewModalOpen = false;
        },
        setSelectedPayinWallet: (state, action) => {
            state.selectedPayinWallet = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCoinDetails.pending, (state) => {
                state.coinDetails.loading = true;
            })
            .addCase(fetchCoinDetails.fulfilled, (state, action) => {
                state.coinDetails.loading = false;
                state.coinDetails.data = action.payload;
            })
            .addCase(fetchCoinDetails.rejected, (state, action) => {
                state.coinDetails.loading = false;
                state.coinDetails.error = action.payload;
            })
            .addCase(getPayinFiatPreview.pending, (state) => {
                state.preview.loading = true;
            })
            .addCase(getPayinFiatPreview.fulfilled, (state, action) => {
                state.preview.loading = false;
                state.preview.data = action.payload;
            })
            .addCase(getPayinFiatPreview.rejected, (state, action) => {
                state.preview.loading = false;
                state.preview.error = action.payload;
            })
            .addCase(fetchFiatDetails.pending, (state) => {
                state.fiatDetails.loading = true;
            })
            .addCase(fetchFiatDetails.fulfilled, (state, action) => {
                state.fiatDetails.loading = false;
                state.fiatDetails.data = action.payload;
            })
            .addCase(fetchFiatDetails.rejected, (state, action) => {
                state.fiatDetails.loading = false;
                state.fiatDetails.error = action.payload;
            })
            .addCase(getPayinCurrencyLists.pending, (state) => {
                state.currencyLists.loading = true;
            })
            .addCase(getPayinCurrencyLists.fulfilled, (state, action) => {
                state.currencyLists.loading = false;
                state.currencyLists.data = action.payload;
            })
            .addCase(getPayinCurrencyLists.rejected, (state, action) => {
                state.currencyLists.loading = false;
                state.currencyLists.error = action.payload;
            })
            .addCase(getPaymentLinks.pending, (state) => {
                state.paymentLinkDetails.loading = true;
            })
            .addCase(getPaymentLinks.fulfilled, (state, action) => {
                state.paymentLinkDetails.loading = false;
                state.paymentLinkDetails.data = action.payload;
            })
            .addCase(getPaymentLinks.rejected, (state, action) => {
                state.paymentLinkDetails.loading = false;
                state.paymentLinkDetails.error = action.payload;
            })
            .addCase(savePaymentLink.pending, (state) => {
                state.savePaymentLinks.loading = true;
                state.savePaymentLinks.error = '';
            })
            .addCase(savePaymentLink.fulfilled, (state, action) => {
                state.savePaymentLinks.loading = false;
                state.savePaymentLinks.data = action.payload;
                state.savePaymentLinks.error = '';
                action.meta.arg?.onSuccess?.(action.payload);
            })
            .addCase(savePaymentLink.rejected, (state, action) => {
                state.savePaymentLinks.loading = false;
                state.savePaymentLinks.error = action.payload;
            })
    }
});


export const { setErrorMessages, setSelectedFiatCoin, setSelectedCurrencyIDR, showFiatPreviewModal, hideFiatPreviewModal, setSelectedPayinWallet } = payinSlice.actions;

export default payinSlice.reducer;