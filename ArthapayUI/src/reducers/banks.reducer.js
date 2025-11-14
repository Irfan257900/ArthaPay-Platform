import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appClientMethods } from '../core/httpClients';
import { ApiControllers } from '../api/config';
const { dashboard: dashboardController } = ApiControllers
import { createAccount, fetcchCryptoVaults, fetchAccountsForCreation, fetchCryptoPaymentSummary, fetchFiatPaymentSummary, fetchFiatVaultCurrencies, fetchKpiMetrics, fetchRecentActivityGraph, fetchRequirements, fetchUbos, getBeneficiaries } from '../modules/banks/http.services';

const createAccountFields = [
    'accountToCreate',
    'bankForCreateAccount',
    'accountsForCreation',
    'banksForAccountCreation',
    'curCreationStep',
    'selectedWalletTab',
    'fiatWalletsForAccCreation',
    'cryptoWalletsForAccCreation',
    'selectedFiatWalletToPay',
    'selectedCryptoWalletToPay',
    'selectedCryptoCoinToPay',
    'selectedCryptoNetworkToPay',
    'verifications',
    'selectedCryptoWalletCoins',
    'selectedCryptoCoinNetworks',
    'summaryForAccountCreation',
    'createAccountData',
]

const dashboardFields = [
    'data',
    'loading',
    'error'
]
const initialState = {
    activeTab: '',
    kpis: { loading: true, data: null, error: '' },
    data: {
        accounts: [], transactions: [], breadCrumbList: [
            { id: "1", title: "Banks", },
        ]
    },
    loading: true,
    error: null,
    accountToCreate: null,
    bankForCreateAccount: null,
    accountsForCreation: { loading: true, data: [], error: '' },
    banksForAccountCreation: { loading: false, data: [], error: '' },
    curCreationStep: 'accSelection',
    selectedWalletTab: '',
    fiatWalletsForAccCreation: { loading: false, data: [], error: '' },
    cryptoWalletsForAccCreation: { loading: false, data: [], error: '' },
    selectedFiatWalletToPay: null,
    selectedCryptoWalletToPay: null,
    selectedCryptoCoinToPay: null,
    selectedCryptoNetworkToPay: null,
    verifications: { loading: '', hasVerifications: null, error: '' },
    selectedCryptoWalletCoins: [],
    selectedCryptoCoinNetworks: { loading: false, data: [], error: '' },
    summaryForAccountCreation: { loading: false, data: null, error: '' },
    createAccountData: { loading: false, data: null, error: '' },
    breadCrumbLists: [{ id: "1", title: "Banks", }],
    recentActivityGraph: { loading: true, graphData: null, error: '' },
    kycRequirements: { loading: false, data: null, error: '' },
    kycDocInfo: [],
    beneficiaries: { loading: false, data: [], error: '' },
    uboDetails: { loading: false, data: null, error: '' },
    uboBenficiaries: [],
    directorBeneficiaries: [],
    addressInformation: [],
    ipNumber: "",
    Reapply: false,
    selector:null,
    type:null,
    additionalInfo:null
}


export const fetchData = createAsyncThunk('banks/fetchData', async (args, { rejectWithValue }) => {
    try {
        const [accounts] = await Promise.all([appClientMethods.get(`${dashboardController}bank/dashboard/customerbankaccounts/Bank`)])
        return {
            accounts, breadCrumbList: [
                { id: "1", title: "Banks", },
            ]
        }
    } catch (error) {
        return rejectWithValue(error.message);
    }
});

export const fetchBeneficiaries = createAsyncThunk(
    'banks/fetchBeneficiaries',
    async (beneficiaryType, { rejectWithValue }) => {
        try {
            const response = await getBeneficiaries(beneficiaryType)
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchUboDetails = createAsyncThunk(
    'banks/fetchUboDetails',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetchUbos(id)
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


export const fetchKpis = createAsyncThunk(
    'banks/fetchKpis',
    async ({ showLoading = true }, { rejectWithValue }) => {
        try {
            return await fetchKpiMetrics();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)
export const fetchRecentActivityGraphData = createAsyncThunk(
    'summary/transactions',
    async (_, { rejectWithValue }) => {
        try {
            return await fetchRecentActivityGraph();
        } catch (error) {
            return rejectWithValue(error.message)
        }
    }
);
export const fetchAccountsToCreate = createAsyncThunk(
    'banks/fetchAccountsToCreate',
    async (_, { rejectWithValue }) => {
        try {
            return await fetchAccountsForCreation();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchKycRequirements = createAsyncThunk(
    'banks/fetchKycRequirements',
    async (bankId, { rejectWithValue }) => {
        try {
            const response = await fetchRequirements(bankId)
            return response;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchFiatWallets = createAsyncThunk(
    'banks/fetchFiatWallets',
    async (_, { rejectWithValue }) => {
        try {
            return await fetchFiatVaultCurrencies();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)
export const fetchCryptoWallets = createAsyncThunk(
    'banks/fetchCryptoWallets',
    async (_, { rejectWithValue }) => {
        try {
            return await fetcchCryptoVaults();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const fetchVerifications = createAsyncThunk(
    'banks/fetchVerifications',
    async (_, { rejectWithValue }) => {
        try {
            const verifications = await appClientMethods.get(`${ApiControllers.security}/Verificationfields`)
            const allFalseOrNull = Object.entries(verifications || {}).every(([, value]) => value === null || value === false)
            return !allFalseOrNull
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)
export const fetchCryptoCoinNetworks = createAsyncThunk(
    'banks/fetchCryptoCoinNetworks',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState()
            const { selectedCryptoWalletToPay, selectedCryptoCoinToPay } = state.banks
            return await appClientMethods.get(`${ApiControllers.common}Vaults/NetworkLu/${selectedCryptoCoinToPay?.code}/${selectedCryptoWalletToPay?.id}/withdrawcrypto`)
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)

export const fetchFiatSummaryForAccCreation = createAsyncThunk(
    'banks/fetchFiatSummaryForAccCreation',
    async (productId, { rejectWithValue, getState }) => {
        try {
            const state = getState()
            const { selectedFiatWalletToPay, accountToCreate, bankForCreateAccount } = state.banks
            if (!productId) {
                throw new Error("Invalid account to create!")
            } else if (!selectedFiatWalletToPay) {
                throw new Error("Please select one wallet!")
            }
            else if (selectedFiatWalletToPay?.amount <= 0) {
                throw new Error("You don't have sufficient balance!")
            }
            else {
                const requestPayload = {
                    "walletId": selectedFiatWalletToPay.id
                }
                return await fetchFiatPaymentSummary(bankForCreateAccount?.productId || productId, requestPayload)
            }
        }
        catch (error) {
            return rejectWithValue(error.message)
        }
    }
)


export const fetchCryptoSummaryForAccCreation = createAsyncThunk(
    'banks/fetchCryptoSummaryForAccCreation',
    async (productId, { rejectWithValue, getState }) => {
        try {
            const state = getState()
            const { selectedCryptoCoinToPay, selectedCryptoWalletToPay, selectedCryptoNetworkToPay, accountToCreate, bankForCreateAccount } = state.banks
            if (!productId) {
                throw new Error("Invalid account to create!")
            } else if (!selectedCryptoWalletToPay) {
                throw new Error("Please select one wallet!")
            } else if (!selectedCryptoCoinToPay) {
                throw new Error("Please select coin!")
            } else if (!selectedCryptoNetworkToPay) {
                throw new Error("Please select network!")
            } else {
                const requestPayload = {
                    "walletId": selectedCryptoNetworkToPay.id,
                }
                return await fetchCryptoPaymentSummary(bankForCreateAccount?.productId || productId, requestPayload);
            }
        }
        catch (error) {
            return rejectWithValue(error.message)
        }
    }
)

export const createBankAccount = createAsyncThunk(
    'banks/createBankAccount',
    async (productId, { rejectWithValue, getState }) => {
        try {
            const state = getState()
            const { selectedFiatWalletToPay, summaryForAccountCreation: { data: summary }, accountToCreate, selectedCryptoNetworkToPay, bankForCreateAccount, kycDocInfo, addressInformation, uboBenficiaries, directorBeneficiaries } = state.banks
            const walletId = summary?.walletId || (summary?.payingWalletType === 'Fiat' ? selectedFiatWalletToPay?.id : selectedCryptoNetworkToPay?.id)
            const { trackAuditLogData } = state.userConfig
            return await createAccount(bankForCreateAccount?.productId || productId,
                {
                    walletId: walletId||null,
                    amount: summary?.amount|| 0,
                    metadata: trackAuditLogData ? JSON.stringify(trackAuditLogData) : null,
                    documents: kycDocInfo,
                    address: addressInformation,
                    ubo: uboBenficiaries,
                    director: directorBeneficiaries,
                    isReapply: state.banks.Reapply,
                    sector: state.banks.selector,
                    type: state.banks.type,
                    dob:state.banks.additionalInfo,
                }
            )
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)








const banksSlice = createSlice({
    name: 'banks',
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
        resetDashboardState: (state, action) => {
            if (Array.isArray(action.payload) && action.payload?.length > 0) {
                action.payload.forEach(key => {
                    state[key] = initialState[key]
                });
            } else {
                dashboardFields.forEach(key => {
                    state[key] = initialState[key]
                })
            }
        },
        resetCreateAccountState: (state, action) => {
            if (Array.isArray(action.payload) && action.payload?.length > 0) {
                action.payload.forEach(key => {
                    state[key] = initialState[key]
                });
            } else {
                createAccountFields.forEach(key => {
                    state[key] = initialState[key]
                })
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
        setActiveTab: (state, action) => {
            state.activeTab = action.payload
        },
        setCurCreationStep: (state, action) => {
            state.curCreationStep = action.payload
        },
        setAccountToCreate: (state, action) => {
            state.accountToCreate = action.payload
            state.bankForCreateAccount = null
        },
        setBankForCreateAccount: (state, action) => {
            state.bankForCreateAccount = action.payload
        },
        setAccountsForCreation: (state, action) => {
            state.accountsForCreation.data = action.payload
        },
        setSelectedWalletTab: (state, action) => {
            state.selectedWalletTab = action.payload
        },
        setSelectedFiatWalletToPay: (state, action) => {
            state.selectedFiatWalletToPay = action.payload
        },
        setSelectedCryptoWalletToPay: (state, action) => {
            state.selectedCryptoWalletToPay = action?.payload
            state.selectedCryptoWalletCoins = action?.payload?.vaultDetails
            state.selectedCryptoCoinNetworks.data = []
            state.selectedCryptoCoinToPay = null
            state.selectedCryptoNetworkToPay = null
        },
        setSelectedCryptoCoinToPay: (state, action) => {
            state.selectedCryptoCoinToPay = action.payload
            state.selectedCryptoCoinNetworks.data = action.payload.networks
            state.selectedCryptoNetworkToPay = null
        },
        setSelectedCryptoWalletCoins: (state, action) => {
            state.selectedCryptoWalletCoins = action.payload
            state.selectedCryptoCoinNetworks = { loading: false, data: [], error: '' }
            state.selectedCryptoCoinToPay = null
            state.selectedCryptoNetworkToPay = null
        },
        setSelectedCryptoCoinNetworks: (state, action) => {
            state.selectedCryptoCoinNetworks = action.payload
        },
        setSelectedCryptoNetworkToPay: (state, action) => {
            state.selectedCryptoNetworkToPay = action.payload

        },
        setBreadcrumb: (state, action) => {
            state.breadCrumbLists = action.payload;
        },
        setKycDocInfo: (state, action) => {
            state.kycDocInfo = action.payload;
        },
        setUboBenficiaries: (state, action) => {
            state.uboBenficiaries = action.payload;
        },
        setDirectorBenficiaries: (state, action) => {
            state.directorBeneficiaries = action.payload;
        },
        setAddressInformation: (state, action) => {
            state.addressInformation = action.payload;
        },
        setIpNumber: (state, action) => {
            state.ipNumber = action.payload;
        },

        setReapply: (state, action) => {
            state.Reapply = action.payload;
        },
        setSelector: (state, action) => {
            state.selector = action.payload;
        },
        setType: (state, action) => {
            state.type = action.payload;
        },
        setAdditionalInfo: (state, action) => {
            state.additionalInfo = action.payload;
    },
    },

        extraReducers: (builder) => {
            builder
                .addCase(fetchData.pending, (state) => {
                    state.loading = true;
                    state.error = null;
                })
                .addCase(fetchData.fulfilled, (state, action) => {
                    state.loading = false;
                    state.data = action.payload;
                })
                .addCase(fetchData.rejected, (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                })
                .addCase(fetchKpis.pending, (state, action) => {
                    const { showLoading = true } = action.meta.arg || {};
                    state.kpis = {
                        ...state.kpis,
                        loading: showLoading,
                        error: '',
                    };
                })
                .addCase(fetchKpis.fulfilled, (state, action) => {
                    state.kpis = { loading: false, data: action.payload, error: '' };
                })
                .addCase(fetchKpis.rejected, (state, action) => {
                    state.kpis = { loading: false, data: null, error: action.payload };
                })
                .addCase(fetchAccountsToCreate.pending, (state) => {
                    state.accountsForCreation.loading = true;
                    state.accountsForCreation.data = null;
                    state.accountsForCreation.error = '';
                })
                .addCase(fetchAccountsToCreate.fulfilled, (state, action) => {
                    state.accountsForCreation.loading = false;
                    state.accountsForCreation.data = action.payload;
                    state.accountsForCreation.error = '';
                })
                .addCase(fetchAccountsToCreate.rejected, (state, action) => {
                    state.accountsForCreation.loading = false;
                    state.accountsForCreation.data = null;
                    state.accountsForCreation.error = action.payload;
                })
                .addCase(fetchFiatWallets.pending, (state) => {
                    state.fiatWalletsForAccCreation.loading = true;
                    state.fiatWalletsForAccCreation.error = '';
                })
                .addCase(fetchFiatWallets.fulfilled, (state, action) => {
                    state.fiatWalletsForAccCreation.loading = false;
                    state.fiatWalletsForAccCreation.data = action.payload;
                })
                .addCase(fetchFiatWallets.rejected, (state, action) => {
                    state.fiatWalletsForAccCreation.loading = false;
                    state.fiatWalletsForAccCreation.error = action.payload;
                })
                .addCase(fetchVerifications.pending, (state) => {
                    state.verifications.loading = true;
                    state.verifications.error = '';
                })
                .addCase(fetchVerifications.fulfilled, (state, action) => {
                    state.verifications.loading = false;
                    state.verifications.error = '';
                    state.verifications.hasVerifications = action.payload;
                })
                .addCase(fetchVerifications.rejected, (state, action) => {
                    state.verifications.loading = false;
                    state.verifications.error = action.payload;
                })
                .addCase(fetchCryptoWallets.pending, (state) => {
                    state.cryptoWalletsForAccCreation.loading = true;
                    state.cryptoWalletsForAccCreation.error = '';
                })
                .addCase(fetchCryptoWallets.fulfilled, (state, action) => {
                    state.cryptoWalletsForAccCreation.loading = false;
                    state.cryptoWalletsForAccCreation.error = '';
                    state.cryptoWalletsForAccCreation.data = action.payload;
                })
                .addCase(fetchCryptoWallets.rejected, (state, action) => {
                    state.cryptoWalletsForAccCreation.loading = false;
                    state.cryptoWalletsForAccCreation.error = action.payload;
                })
                .addCase(fetchCryptoCoinNetworks.pending, (state) => {
                    state.selectedCryptoCoinNetworks.loading = true;
                    state.selectedCryptoCoinNetworks.error = '';
                })
                .addCase(fetchCryptoCoinNetworks.fulfilled, (state, action) => {
                    state.selectedCryptoCoinNetworks.loading = false;
                    state.selectedCryptoCoinNetworks.error = '';
                    state.selectedCryptoCoinNetworks.data = action.payload;
                })
                .addCase(fetchCryptoCoinNetworks.rejected, (state, action) => {
                    state.selectedCryptoCoinNetworks.loading = false;
                    state.selectedCryptoCoinNetworks.error = action.payload;
                })
                .addCase(fetchFiatSummaryForAccCreation.pending, (state) => {
                    state.summaryForAccountCreation.loading = true;
                    state.summaryForAccountCreation.error = '';
                })
                .addCase(fetchFiatSummaryForAccCreation.fulfilled, (state, action) => {
                    state.summaryForAccountCreation.loading = false;
                    state.summaryForAccountCreation.error = '';
                    state.summaryForAccountCreation.data = { ...action.payload, payingWalletType: 'Fiat' };
                    // state.curCreationStep = 'fiatSummary'
                })
                .addCase(fetchFiatSummaryForAccCreation.rejected, (state, action) => {
                    state.summaryForAccountCreation.loading = false;
                    state.summaryForAccountCreation.error = action.payload;
                })
                .addCase(fetchCryptoSummaryForAccCreation.pending, (state) => {
                    state.summaryForAccountCreation.loading = true;
                    state.summaryForAccountCreation.error = '';
                })
                .addCase(fetchCryptoSummaryForAccCreation.fulfilled, (state, action) => {
                    state.summaryForAccountCreation.loading = false;
                    state.summaryForAccountCreation.error = '';
                    state.summaryForAccountCreation.data = { ...action.payload, payingWalletType: 'Crypto' };
                    // state.curCreationStep = 'cryptoSummary'
                })
                .addCase(fetchCryptoSummaryForAccCreation.rejected, (state, action) => {
                    state.summaryForAccountCreation.loading = false;
                    state.summaryForAccountCreation.error = action.payload;
                })
                .addCase(createBankAccount.pending, (state) => {
                    state.createAccountData.loading = true;
                    state.createAccountData.error = '';
                })
                .addCase(createBankAccount.fulfilled, (state, action) => {
                    state.createAccountData.loading = false;
                    state.createAccountData.error = '';
                    state.createAccountData.data = action.payload;
                    state.curCreationStep = 'success'
                })
                .addCase(createBankAccount.rejected, (state, action) => {
                    state.createAccountData.loading = false;
                    state.createAccountData.error = action.payload;
                })
                .addCase(fetchRecentActivityGraphData.pending, (state) => {
                    state.recentActivityGraph.loading = true;
                    state.recentActivityGraph.graphData = null;
                    state.recentActivityGraph.error = ''
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
                .addCase(fetchKycRequirements.pending, (state) => {
                    state.kycRequirements.loading = true;
                    state.kycRequirements.error = '';
                })
                .addCase(fetchKycRequirements.fulfilled, (state, action) => {
                    state.kycRequirements.loading = false;
                    state.kycRequirements.data = action.payload;
                })
                .addCase(fetchKycRequirements.rejected, (state, action) => {
                    state.kycRequirements.loading = false;
                    state.kycRequirements.error = action.payload;
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
                });
        },
    });
export const { resetState, clearErrorMessage, setActiveTab, setAccountToCreate, setBankForCreateAccount, setCurCreationStep, setSelectedWalletTab, setSelectedFiatWalletToPay, setSelectedCryptoCoinToPay, setSelectedCryptoWalletToPay, setSelectedCryptoWalletCoins, setSelectedCryptoCoinNetworks, setSelectedCryptoNetworkToPay, resetCreateAccountState, resetDashboardState, setErrorMessage, setBreadcrumb, setKycDocInfo, setUboBenficiaries, setDirectorBenficiaries, setAddressInformation, setIpNumber, ipNumber, setReapply,setSelector,setType,setAdditionalInfo,selector,type } = banksSlice.actions
export default banksSlice;
