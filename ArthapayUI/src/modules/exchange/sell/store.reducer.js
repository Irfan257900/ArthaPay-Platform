import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appClientMethods } from '../http.clients';

export const fetchCryptoCoins = createAsyncThunk(
    'sell/fetchCryptoCoins',
    async (params, { rejectWithValue, getState }) => {
        const { page = 1, pageSize, data } = params || {}
        const state = getState()
        const { pageSize: defaultPageSize } = state.sellState.cryptoCoins
        try {
            const response = await appClientMethods.get(`assets?pageNo=${page}&pageSize=${pageSize || defaultPageSize}`);
            return { ...response, assets: page === 1 ? response.assets : [...(data || []), ...response.assets] }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchAssetDetails = createAsyncThunk(
    'sell/fetchAssetDetails',
    async ({ assets, assetCode, onSuccess }, { rejectWithValue,dispatch }) => {
        try {
            const response = await appClientMethods.get(`assets/sell/${assetCode}`);
            const cryptoAsset = assets.cryptoAssets.find(
                (a) => a?.code === response?.code
            );
            if (!cryptoAsset) {
                dispatch(setSelectedFiatCoin(null));
                return;
            }

            const fiatCodes = cryptoAsset.supportedCurrencies?.split(",") || [];
            const fiatAssets = fiatCodes
                .map((code) => assets.fiatAssets?.[code.trim()])
                .filter(Boolean);
            dispatch(setSelectedFiatCoin(fiatAssets[0]));
            onSuccess?.({ response, fiatAssets })
            return response
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchAssetsAndBalances = createAsyncThunk(
    'sell/fetchAssetsAndBalances',
    async (_, { rejectWithValue }) => {
        try {
            return await appClientMethods.get(`assets/sell/balances`);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
const initialState = {
    summaryDetails: null,
    selectedCryptoCoin: null,
    refreshData: false,
    saveResponse: null,
    selectedFiatCoin: null,
    cryptoCoins: { loader: 'init', data: [], error: null, pageSize: 20, page: 1 },
    assetDetails: { loading: true, data: null, error: '' },
    widgetAssets: { loading: true, data: null, error: '' }
};

const sellSlice = createSlice({
    name: 'sell',
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
        setRefreshData: (state, action) => {
            state.refreshData = action.payload
        },
        setSummaryDetails(state, action) {
            state.summaryDetails = action.payload;
        },
        setSelectedCryptoCoin(state, action) {
            state.selectedCryptoCoin = action.payload;
        },
        setSelectedFiatCoin(state, action) {
            state.selectedFiatCoin = action.payload;
        },
        clearCryptoCoinsError(state) {
            state.cryptoCoins = { ...state.cryptoCoins, error: '' }
        },
        setSaveResponse(state, action) {
            state.saveResponse = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCryptoCoins.pending, (state, action) => {
                state.cryptoCoins.loader = action.meta.arg.step;
                state.cryptoCoins.data = null;
                state.cryptoCoins.error = '';
            })
            .addCase(fetchCryptoCoins.fulfilled, (state, action) => {
                state.cryptoCoins.loader = '';
                state.cryptoCoins.error = '';
                state.cryptoCoins.data = action.payload;
                state.cryptoCoins.page = action.meta.arg.page
            })
            .addCase(fetchCryptoCoins.rejected, (state, action) => {
                state.cryptoCoins.loader = '';
                state.cryptoCoins.error = action.payload;
                state.cryptoCoins.data = null;
            })
            .addCase(fetchAssetDetails.pending, (state) => {
                state.assetDetails.loading = true;
                state.assetDetails.data = null;
                state.assetDetails.error = '';
            })
            .addCase(fetchAssetDetails.fulfilled, (state, action) => {
                state.assetDetails.loading = false;
                state.assetDetails.error = '';
                state.assetDetails.data = action.payload;
            })
            .addCase(fetchAssetDetails.rejected, (state, action) => {
                state.assetDetails.loading = false;
                state.assetDetails.error = action.payload;
                state.assetDetails.data = null;
            })
            .addCase(fetchAssetsAndBalances.pending, (state) => {
                state.widgetAssets.loading = true;
                state.widgetAssets.data = null;
                state.widgetAssets.error = '';
            })
            .addCase(fetchAssetsAndBalances.fulfilled, (state, action) => {
                state.widgetAssets.loading = false;
                state.widgetAssets.error = '';
                const { fiatAssets, cryptoAssets } = action.payload || {}
                const fiatAssetMap = {};
                fiatAssets?.forEach(asset => {
                    fiatAssetMap[asset.code] = asset
                });
                state.widgetAssets.data = { cryptoAssets, fiatAssets: fiatAssetMap };
            })
            .addCase(fetchAssetsAndBalances.rejected, (state, action) => {
                state.widgetAssets.loading = false;
                state.widgetAssets.error = action.payload;
                state.widgetAssets.data = null;
            });
    },
});

export const { resetState, setErrorMessages, setRefreshData, setSelectedCryptoCoin, setSelectedFiatCoin, setSummaryDetails, clearCryptoCoinsError, setSaveResponse } = sellSlice.actions;
export default sellSlice.reducer;
