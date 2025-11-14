import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  selectedAddress: { loading: false, data: null },
  allAddresses: { loading: false, data: [] },
  cryptoNetwork: { loading: false, data: null },
  selectedCard: { loading: false, data: null },
  networksInfo: { loading: false, data: null },
};

const applyCardSlice = createSlice({
  name: 'applyCard',
  initialState,
  reducers: {
    getSelectedAddress(state, action) {
      state.selectedAddress = { data: action.payload.data, loading: action.payload.loading };
    },
    selectedCryptoWallet(state, action) { 
      state.cryptoNetwork = { data: action.payload.data, loading: action.payload.loading };
    },
    getSelectedCard(state, action) {
      state.selectedCard = { data: action.payload.data, loading: action.payload.loading };
    },
    setNetworksData(state, action) {
      state.networksInfo =  { data: action.payload.data, loading: action.payload.loading };
    },
  },
});

export const { getSelectedAddress, selectedCryptoWallet, getSelectedCard ,setNetworksData} = applyCardSlice.actions;

export default applyCardSlice.reducer;

