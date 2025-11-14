import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getMerchantLU } from "../httpServices";

export const fetchVaults = createAsyncThunk(
  "vaults/fetchVaults",
  async ({ screenName }) => {
    try {
      const response = await getMerchantLU(screenName);
      if (response) { 
        return { response, screenName };
      }
    } catch (error) {
      return { error: error.message, screenName };
    }
  }
);


const buildPayoutFiatVault = (data = []) => {
  return {
    id: "default-fiat-vault",
    name: "Default Fiat Vault",
    type: "payoutfiat",
    totalInBaseAmount: data.reduce((sum, coin) => sum + (coin.amount || 0), 0),
    isDefault: true,
    createdDate: new Date().toISOString(),
    details: data.map((coin) => ({
      ...coin,
      transactionAdditionalFields: coin.transactionAdditionalFields
        ? JSON.parse(coin.transactionAdditionalFields)
        : null,
    })),
  };
};



const initialState = {
  vaults: {
    loader: true,
    data: [],
    error: ""
  },
  selectedFiatVault: null,
  selectedFiatCoin: null,
  selectedCryptoVault: null,
  selectedCryptoCoin: null,
  selectedRightFormFiatVault: null,
  selectedRightFormCryptoVault: null,
  selectTab: 'Pay In',
  resourceData: null,
  isSenderApproved:'',
};

const vaultsAccordionSlice = createSlice({
  name: "vaultsAccordion",
  initialState,
  reducers: {
    setSelectedTab: (state, action) => {
      state.selectTab = action.payload
    },
    setSelectedFiatVault: (state, action) => {
      state.selectedFiatVault = action.payload;
    },
    setSelectedRightFormFiatVault: (state, action) => {
      state.selectedRightFormFiatVault = action.payload;
    },
    setSelectedFiatCoin: (state, action) => {
      state.selectedFiatCoin = action.payload;
    },
    setSelectedCryptoVault: (state, action) => {
      state.selectedCryptoVault = action.payload;
    },
    setSelectedRightFormCryptoVault: (state, action) => {
      state.selectedRightFormCryptoVault = action.payload;
    },
    setSelectedCryptoCoin: (state, action) => {
      state.selectedCryptoCoin = action.payload;
    },
    setSelectedResourceData: (state, action) => {
      state.resourceData = action.payload
    },
    setIsSenderApproved: (state, action) => {
      state.isSenderApproved = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVaults.pending, (state) => {
        state.vaults.loader = true;
        state.vaults.data = null;
        state.vaults.error = "";
      })
      .addCase(fetchVaults.fulfilled, (state, action) => {
        state.vaults.loader = false;
        if (action.payload?.screenName === "payoutfiat") {
          // transform the response into vault object
          const fiatVault = buildPayoutFiatVault(action.payload?.response);
          state.selectedFiatVault = fiatVault;
          state.selectedRightFormFiatVault = fiatVault;
          state.selectedFiatCoin = fiatVault.details[0];  // first coin as default selection?
          state.resourceData = fiatVault.details?.transactionAdditionalFields || null;
          state.vaults.data = fiatVault;
        } else if (action.payload?.screenName === "payoutcrypto") {
          state.selectedCryptoVault = action.payload.response.vault;
          state.selectedRightFormCryptoVault = action.payload.response.vault;
          state.selectedCryptoCoin = action.payload.response.coin;
          state.vaults.data = action.payload.response;
          state.isSenderApproved=action.payload?.response?.[0]?.providerStatus
        }

        state.vaults.error = "";
      })
      .addCase(fetchVaults.rejected, (state, action) => {
        state.vaults.loader = false;
        state.vaults.data = null;
        state.vaults.error = action.payload.error;
      });
  },
});

export const {
  setSelectedTab,
  setSelectedFiatVault,
  setSelectedFiatCoin,
  setSelectedCryptoVault,
  setSelectedCryptoCoin,
  setSelectedRightFormFiatVault,
  setSelectedRightFormCryptoVault,
  setSelectedResourceData,
  setIsSenderApproved
} = vaultsAccordionSlice.actions;

export default vaultsAccordionSlice.reducer;