export const referralState = {
    isOpen: false,
    loader: false,
    btnLoader: false,
    formData: {
        minFee: null,
        maxFee: null,
        flatFee: null,
    },
    formLoader: false,
    selectedRecord: null,
    formErrorMsg: null,
    data: null,
    error:null,
    kpisInfo:[],
    kpisLoader: false,
    memberData: [],
    memberLoader: false,
    statusLookupData:[],
}
export const referralReducer = (state, action) => {
    state = state || referralState;
    switch (action.type) {
        case "setIsOpen": return { ...state, isOpen: action.payload };
        case "setLoader": return { ...state, loader: action.payload };
        case "setBtnLoader": return { ...state, btnLoader: action.payload };
        case "setFormData": return { ...state, formData: action.payload };
        case "setFormLoader": return { ...state, formLoader: action.payload };
        case "setSelectedRecord": return { ...state, selectedRecord: action.payload };
        case "setFormErrorMsg": return { ...state, formErrorMsg: action.payload };
        case "setData": return { ...state, data: action.payload };
        case "setError": return { ...state, error: action.payload };
        case "setKpisInfo": return { ...state, kpisInfo: action.payload };
        case "setKpisLoader": return { ...state, kpisLoader: action.payload };
        case "setMemberData": return { ...state, memberData: action.payload };
        case "setMemberLoader": return { ...state, memberLoader: action.payload };
        case "setStatusLookupData": return { ...state, statusLookupData: action.payload };
        default: return { ...state }
    }
};