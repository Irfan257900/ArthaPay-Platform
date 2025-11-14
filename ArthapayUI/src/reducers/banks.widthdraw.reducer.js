import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getDetails, fetchWithdrawAccountBanks, fetchAccountPayees, fetchWithdrawSummary, withdrawAmount } from '../modules/banks/http.services';
// Async thunk for fetching banks
export const getAccounts = createAsyncThunk(
    'transfer/getAccounts',
    async (_, { rejectWithValue }) => {
        try {
            return await getDetails();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchBanks = createAsyncThunk(
    'transfer/fetchBanks',
    async ({ currency }, { rejectWithValue }) => {
        try {
            return await fetchWithdrawAccountBanks(currency);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchPayees = createAsyncThunk(
    'transfer/fetchPayees',
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState()
            const selectedCurrency = state.transferReducer.selectedCurrency || state.transferReducer.accounts.data?.[0]
            return await fetchAccountPayees(selectedCurrency?.currency);

        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);
export const fetchSummary = createAsyncThunk(
  'transfer/fetchSummary',
  async (params, { rejectWithValue, getState }) => {
    try {
      const { amount, onSuccess } = params || {};
      const requestedAmount = amount?.replace(/,/g, '') || 0;

      const state = getState();
      const selectedPaymentSchema = state.accountsReducer.selectedPaymentSchema;
      const { selectedCurrency, selectedBank, selectedPayee, accounts } = state.transferReducer;

      // Validate required fields
      if (!selectedCurrency?.currency) {
        throw new Error("Please select account");
      } else if (requestedAmount === '0') {
        throw new Error("Amount must be greater than zero.");
      } else if (!requestedAmount || requestedAmount === '.' || requestedAmount === '') {
        throw new Error("Please enter amount.");
      } else if (!selectedBank) {
        throw new Error("Please select bank account");
      } else if (!selectedPayee?.id) {
        throw new Error("Please select one payee");
      } else if (!selectedPaymentSchema) {
        throw new Error("Please select a payment scheme.");
      }
      const parsedAmount = parseFloat(requestedAmount);
      const format = (value) => parseFloat(value).toLocaleString();
      if (parsedAmount < selectedBank.minLimit) {
        throw new Error(`Minimum value must be ${format(selectedBank.minLimit)}.`);
      }
      if (parsedAmount > selectedBank.maxLimit) {
        throw new Error(`Amount cannot exceed ${format(selectedBank.maxLimit)}.`);
      }
      if (parsedAmount > selectedBank.amount) {
        throw new Error(`Insufficient balance.`);
      }
      const summaryPayload = {
        amount: parsedAmount,
        payeeId: selectedPayee?.id,
        accountId: selectedBank?.id,
      };
      const response = await fetchWithdrawSummary(summaryPayload);
      onSuccess?.(response);
      return response;

    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);



export const executeWithdraw = createAsyncThunk(
    'transfer/executeWithdraw',
    async ({ onSuccess }, { dispatch, rejectWithValue, getState }) => {
        try {
            const state = getState()
            const { trackAuditLogData } = state.userConfig
            const selectedPaymentSchema = state.accountsReducer.selectedPaymentSchema
            const { selectedCurrency, selectedBank, selectedPayee, summary: { data: summary } } = state.transferReducer
            if (!selectedCurrency?.currency) {
                throw new Error("Please select account")
            } else if (!selectedBank) {
                throw new Error("Please select bank account")
            }
            else if (!selectedPayee?.id) {
                throw new Error("Please select one payee")
            } else if (!summary) {
                throw new Error("Invalid Details! Please try again")
            }
            else {
                const requestPayload = {
                    "payeeId": summary.payeeId,
                    "amount": summary.requestedAmount,
                    "accountId": selectedBank?.id,
                    "paymentscheme": selectedPaymentSchema?.code,
                    "metadata": trackAuditLogData ? JSON.stringify(trackAuditLogData) : null
                }
                const response = await withdrawAmount(requestPayload);
                onSuccess?.(response)
                // dispatch(getAccounts({ step: 'init' }))
                // dispatch(fetchBanks({
                //     currency: summary.walletCode,
                // }))
                return response
            }
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
)
const initialState = {
    totalAmount: 0,
    currencyObj: '',
    selectedCurrency: '',
    amountGiven: '',
    accountId: '',
    selectedPayee: null,
    accounts: { loader: true, data: null, error: '' },
    detailsObj: {},
    accountDetails: [],
    selectedObj: {},
    transactionId: '',
    setBackBankAmount: '',
    resetTransferDetails: null,
    initialselectedObj: {},
    productObj: {},
    banks: { loading: true, data: [], error: '' },
    selectedBank: {},
    payees: { loading: true, data: null, error: '' },
    summary: { loading: false, data: null, error: '' },
    save: { loading: false, data: null, error: '' },
    triggerFlag: false,


};

const transferSlice = createSlice({
    name: 'transfer',
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
        setCurrency: (state, action) => {
            state.currencyObj = action.payload;
        },
        setAmountGiven: (state, action) => {
            state.amountGiven = action.payload;
        },
        setBackBankAmount: (state, action) => {
            state.setBackBankAmount = action.payload;
        },
        setAccountId: (state, action) => {
            state.accountId = action.payload;
        },
        setDetails: (state, action) => {
            state.detailsObj = action.payload;
        },
        resetTransferDetails: (state, action) => {
            state.resetTransferDetails = action.payload;
        },
        setAccountDetails: (state, action) => {
            state.accountDetails = action.payload;
        },
        setSelectedObj: (state, action) => {
            state.selectedObj = action.payload;
        },
        setSelectedPayee: (state, action) => {
            state.selectedPayee = action.payload
        },
        setTransactionId: (state, action) => {
            state.transactionId = action.payload;
        },
        setInitialSelectedObj: (state, action) => {
            state.initialselectedObj = action.payload;
        },
        setSelectedCurrency: (state, action) => {
            state.selectedCurrency = action.payload
        },
        setProductObj: (state, action) => {
            state.productObj = action.payload;
        },
        setSelectedBank: (state, action) => {
            state.selectedBank = action.payload;
        },
        setTriggerFlag: (state, action) => {
            state.triggerFlag = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAccounts.pending, (state) => {
                state.accounts = { loader: true, data: null, error: '' };
            })
            .addCase(getAccounts.fulfilled, (state, action) => {
                state.totalAmount = action.payload.totalAmount
                state.accounts = { loader: false, data: action.payload.accounts, error: '' };
            })
            .addCase(getAccounts.rejected, (state, action) => {
                state.accounts = { loader: false, data: null, error: action.payload };
            })
            .addCase(fetchPayees.pending, (state) => {
                state.payees = { loading: true, data: null, error: '' };
            })
            .addCase(fetchPayees.fulfilled, (state, action) => {
                action.meta.arg.setFilteredPayees?.(action.payload)
                state.payees = { loading: false, data: action.payload, error: '' };
            })
            .addCase(fetchPayees.rejected, (state, action) => {
                state.payees = { loading: false, data: null, error: action.payload };
            })
            .addCase(fetchBanks.pending, (state) => {
                state.banks = { loading: true, data: null, error: '' }
            })
            .addCase(fetchBanks.fulfilled, (state, action) => {
                state.banks = { loading: false, data: action.payload, error: '' }
            })
            .addCase(fetchBanks.rejected, (state, action) => {
                state.banks = { loading: false, data: null, error: action.payload }
            })
            .addCase(fetchSummary.pending, (state) => {
                state.summary = { loading: true, data: null, error: '' }
            })
            .addCase(fetchSummary.fulfilled, (state, action) => {
                state.summary = { loading: false, data: action.payload, error: '' }
            })
            .addCase(fetchSummary.rejected, (state, action) => {
                state.summary = { loading: false, data: null, error: action.payload }
            })
            .addCase(executeWithdraw.pending, (state) => {
                state.save = { loading: true, data: null, error: '' }
            })
            .addCase(executeWithdraw.fulfilled, (state, action) => {
                state.save = { loading: false, data: action.payload, error: '' }
            })
            .addCase(executeWithdraw.rejected, (state, action) => {
                state.save = { loading: false, data: null, error: action.payload }
            });
    },
});
export const {
    resetState,
    setErrorMessages,
    setCurrency,
    setAmountGiven,
    setBackBankAmount,
    setAccountId,
    setDetails,
    resetTransferDetails,
    setAccountDetails,
    setSelectedObj,
    setTransactionId,
    setInitialSelectedObj,
    setProductObj,
    setSelectedCurrency,
    setSelectedBank,
    setSelectedPayee,
    setTriggerFlag,
} = transferSlice.actions;

export default transferSlice.reducer;
