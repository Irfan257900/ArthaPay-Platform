
export const initialState = {
    cardsData: [],
    errorMsg: null,
    loader: false,
}
export const reducer = (state, action) => {
    state = state || initialState;
    switch (action.type) {
        case "setCardsData": return { ...state, cardsData: action.payload };
        case "setErrorMsg": return { ...state, errorMsg: action.payload };
        case "setLoader": return { ...state, loader: action.payload };
        default: return { ...state }
    }
};