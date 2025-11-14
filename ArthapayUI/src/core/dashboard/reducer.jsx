export const initialState = {
    data: null,
    error: null,
    loader: false,
    activeTab: "About",
    marketData : [],
    marketDataLoader:false,
    cardsLoader: false,
    cardsData: []
}
export const reducer = (state, action) => {
    state = state || initialState;
    switch (action.type) {
        case "setData": return { ...state, data: action.payload };
        case "setLoader": return { ...state, loader: action.payload };
        case "setError": return { ...state, error: action.payload };
        case "setActiveTab": return { ...state, activeTab: action.payload };
        case "setMarketData": return { ...state, marketData: action.payload };
        case "setMarketDataLoader": return { ...state, marketDataLoader: action.payload };
        case "setCardsLoader": return { ...state, cardsLoader: action.payload };
        case "setCardsData": return { ...state, cardsData: action.payload };
        default: return { ...state }
    }
};