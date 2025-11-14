export const businessLogoState = {
    file: null,
    modal: '',
    error: "",
    loading: "",
};

export const businessLogoReducer = (state, action) => {
    switch (action.type) {
        case "SET_FILE":
            return { ...state, file: action.payload };
        case "SET_MODAL":
            return { ...state, modal: action.payload };
        case "SET_ERROR":
            return { ...state, error: action.payload };
        case "SET_LOADING":
            return { ...state, loading: action.payload };
        case "SET_STATES":
            return { ...state, ...action.payload };
        case "RESET":
            return businessLogoState;
        default:
            return state
    }
};
