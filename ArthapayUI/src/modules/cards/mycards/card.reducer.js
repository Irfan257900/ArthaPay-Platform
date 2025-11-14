
export const initialState = {
    details: {},
    errorMsg: null,
    loader: false,
    freeze: false,
    showTransactions: false,
    isViewCard: false,
    leftPanelSelectedData: {},
    isTopUpChange: false,
    selectedCurdID: null,
    isModalOpen: false,
    coins: [],
    selectedCoin: "USD",
    availableBalance: null,
    availableBalanceLoader: false,
    isShowMyStatusProgress: null,
    selectedAvailableBalance: null,
    dropdownVisible: false,
    mbDDvisible: false,
    showPinModal: false,
    setPinModal: false,
    freezeModal: false,
    modalAction: false,
    topUpModal: false,
    availableBalanceUpdate: false,
    disabledIcons: {},
    assignCard: false,
    activeTab: 'My Cards',
    cardKpis: [],
    transactionFlags: {},
}
export const reducer = (state, action) => {
    state = state || initialState;
    switch (action.type) {
        case "setDetails": return { ...state, details: action.payload };
        case "setErrorMsg": return { ...state, errorMsg: action.payload };
        case "setLoader": return { ...state, loader: action.payload };
        case "setFreeze": return { ...state, freeze: action.payload };
        case "setShowTransactions": return { ...state, showTransactions: action.payload };
        case "setIsViewCard": return { ...state, isViewCard: action.payload };
        case "setLeftPanelSelectedData": return { ...state, leftPanelSelectedData: action.payload };
        case "setIsTopUpChange": return { ...state, isTopUpChange: action.payload };
        case "setSelectedCurdID": return { ...state, selectedCurdID: action.payload };
        case "setIsModalOpen": return { ...state, isModalOpen: action.payload };
        case "setCoins": return { ...state, coins: action.payload };
        case "setSelectedCoin": return { ...state, selectedCoin: action.payload };
        case "setAvailableBalance": return { ...state, availableBalance: action.payload };
        case "setAvailableBalanceLoader": return { ...state, availableBalanceLoader: action.payload };
        case "setIsShowMyStatusProgress": return { ...state, isShowMyStatusProgress: action.payload };
        case "setSelectedAvailableBalance": return { ...state, selectedAvailableBalance: action.payload };
        case "setDropdownVisible": return { ...state, dropdownVisible: action.payload };
        case "setMbDDvisible": return { ...state, mbDDvisible: action.payload };
        case "setShowPinModal": return { ...state, showPinModal: action.payload };
        case "setSetPinModal": return { ...state, setPinModal: action.payload };
        case "setFreezeModal": return { ...state, freezeModal: action.payload };
        case "setModalAction": return { ...state, modalAction: action.payload };
        case "setTopUpModal": return { ...state, topUpModal: action.payload };
        case "setAvailableBalanceUpdate": return { ...state, availableBalanceUpdate: action.payload };
        case "setDisabledIcons": return { ...state, disabledIcons: action.payload };
        case "setAssignCard": return { ...state, assignCard: action.payload };
        case "setActiveTab": return { ...state, activeTab: action.payload };
        case "setCardsKpis": return { ...state, cardKpis: action.payload };
        case "setTransactionFlags": return { ...state, transactionFlags: action.payload };
        default: return { ...state }
    }
};

export const assignCardState = {
    data: [],
    error: null,
    loader: false,
    saveBtnLoader: false,
    filteredPayees: null,
}
export const assignCardreducer = (state, action) => {
    state = state || assignCardState;
    switch (action.type) {
        case "setData": return { ...state, data: action.payload };
        case "setLoader": return { ...state, loader: action.payload };
        case "setError": return { ...state, error: action.payload };
        case "setSaveBtnLoader": return { ...state, saveBtnLoader: action.payload };
        case "setFilteredPayees": return { ...state, filteredPayees: action.payload };
        default: return { ...state }
    }
};

export const topUpCardState = {
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
    inputAmount: null,
}
export const topUpCardreducer = (state, action) => {
    state = state || topUpCardState;
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
        case "setInputAmount": return { ...state, inputAmount: action.payload };
        default: return { ...state }
    }
};

export const showPinState = {
    getPin: null,
    showPinLoader: false,
    errorMsg: null,
}
export const showPinreducer = (state, action) => {
    state = state || showPinState;
    switch (action.type) {
        case "setGetPin": return { ...state, getPin: action.payload };
        case "setLoader": return { ...state, loader: action.payload };
        case "setErrorMsg": return { ...state, errorMsg: action.payload };
        default: return { ...state }
    }
};

export const freezeOrUnfreezeState = {
    error: null,
    btnLoader: false,
    fileLists: { SignImage: [] },
    uploadRules: { freezeSignImage: false },
    previewImages: { SignImage: "" }
}
export const freezeOrUnfreezereducer = (state, action) => {
    state = state || freezeOrUnfreezeState;
    switch (action.type) {
        case "setError": return { ...state, error: action.payload };
        case "setBtnLoader": return { ...state, btnLoader: action.payload };
        case "setFileLists": return { ...state, fileLists: action.payload };
        case "setUploadRules": return { ...state, uploadRules: action.payload };
        case "setPreviewImages": return { ...state, previewImages: action.payload };
        default: return { ...state }
    }
};

export const setPinState = {
    error: null,
    setPinLoader: false,
    fileLists: { SignImage: [] },
    uploadRules: { setPinSignImage: false },
    previewImages: { SignImage: "" }
}
export const setPinreducer = (state, action) => {
    state = state || setPinState;
    switch (action.type) {
        case "setError": return { ...state, error: action.payload };
        case "setSetPinLoader": return { ...state, setPinLoader: action.payload };
        case "setFileLists": return { ...state, fileLists: action.payload };
        case "setUploadRules": return { ...state, uploadRules: action.payload };
        case "setPreviewImages": return { ...state, previewImages: action.payload };
        default: return { ...state }
    }
};

