
export const stepTwoState = {
    errorMsg: null,
    topupLoader: false,
    topUpCommissionDetails: null,
    topUpCommissionLoader: false,
    isTopUpCommissionShow: false,
    assets: [],
    confirmAsset: '',
    topUpButtonDisable: true,
    networks: [],
    selectedNetwork: {},
    selectNetwork: '',
    depositDetails: null,
    loader: false,
}
export const stepTworeducer = (state, action) => {
    state = state || stepTwoState;
    switch (action.type) {
        case "setErrorMsg": return { ...state, errorMsg: action.payload };
        case "setTopupLoader": return { ...state, topupLoader: action.payload };
        case "setTopUpCommissionDetails": return { ...state, topUpCommissionDetails: action.payload };
        case "setTopUpCommissionLoader": return { ...state, topUpCommissionLoader: action.payload };
        case "setIsTopUpCommissionShow": return { ...state, isTopUpCommissionShow: action.payload };
        case "setAssets": return { ...state, assets: action.payload };
        case "setConfirmAsset": return { ...state, confirmAsset: action.payload };
        case "setTopUpButtonDisable": return { ...state, topUpButtonDisable: action.payload };
        case "setNetworks": return { ...state, networks: action.payload };
        case "setSelectedNetwork": return { ...state, selectedNetwork: action.payload };
        case "setSelectNetwork": return { ...state, selectNetwork: action.payload };
        case "setDepositDetails": return { ...state, depositDetails: action.payload };
        case "setLoader": return { ...state, loader: action.payload };
        default: return { ...state }
    }
};