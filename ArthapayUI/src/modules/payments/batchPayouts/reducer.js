
export const formState = {
    selectedTokenAmount: null,
    availableBalance: null,
    isLoading: '',
    totalPaymentAmount: 0,
    amountAfterConversion: null,
    showPayeeUploadModal: false,
    formDetails: {
        selectedVaultDetails: {},
        selectedCoinInfo: {},
        selectedNetworkInfo: {},
        payeesGridData: [],
    },
    errorMsg: null,
}
export const formReducer = (state, action) => {
    state = state || formState;
    switch (action.type) {
        case "setErrorMsg": return { ...state, errorMsg: action.payload };
        case "setIsLoading": return { ...state, isLoading: action.payload };
        case "setSelectedCoinAmount": return { ...state, selectedTokenAmount: action.payload };
        case "setAvailableBalance": return { ...state, availableBalance: action.payload };
        case "setTotalPaymentAmount": return { ...state, totalPaymentAmount: action.payload };
        case "setAmountAfterConversion": return { ...state, amountAfterConversion: action.payload };
        case "setShowPayeeUploadModal": return { ...state, showPayeeUploadModal: action.payload };
        case "setFormDetails": return { ...state, formDetails: action.payload };
        default: return { ...state }
    }
};