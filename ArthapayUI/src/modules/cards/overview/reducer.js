
export const initialState = {
    cardsData: [],
    newCardsData: [],
    cardsLoader: false,
    newCardsDataLodaer: true,
    activeTab: 'myCards',
    advertisementData: [],
}
export const reducer = (state, action) => {
    state = state || initialState;
    switch (action.type) {
        case "setCardsData": return { ...state, cardsData: action.payload };
        case "setNewCardsData": return { ...state, newCardsData: action.payload };
        case "setCardsLoader": return { ...state, cardsLoader: action.payload };
        case "setNewCardsDataLodaer": return { ...state, newCardsDataLodaer: action.payload };
        case "setActiveTab": return { ...state, activeTab: action.payload };
        case "setAdvertisementData": return { ...state, advertisementData: action.payload };
        default: return { ...state }
    }
};