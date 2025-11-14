export const gridState = {
    selection: null,
    loading: '',
    error: { message: '', type: 'error', errorOf: '' },
    modal: '',
    shouldDownload: false,
    searchInput: '',
    filters: { searchParam: null },
    currentTab: '',
    invite:false,
    selectedTeam:'All',
    isRefresh:false,
    lookups: {transactionTypes: [] },
    kpiLoading: false,
    KpiData: null,
}
 
export const gridReducer = (state, action) => {
    state = state || gridState
    switch (action.type) {
        case 'setLoading': return { ...state, loading: action.payload }
        case 'setModal': return { ...state, modal: action.payload }
        case 'setError': return { ...state, error: { ...state.error, ...action.payload } }
        case 'setSelection': return { ...state, selection: action.payload }
        case 'setSearchInput': return { ...state, searchInput: action.payload }
        case 'setFilters': return { ...state, filters: { ...state.filters, ...action.payload } }
        case 'setStates': return { ...state, ...action.payload }
        case 'setShouldDownload': return { ...state, shouldDownload: action.payload }
        case 'setCurrentTab': return { ...state, currentTab: action.payload }
        case 'setSelectedTeam': return { ...state, selectedTeam: action.payload }
        case 'setInvite': return { ...state, invite: action.payload }
        case 'setRefresh': return { ...state, isRefresh: action.payload }
        case 'setLookups': return { ...state, lookups: { ...state.lookups, ...action.payload } }
        case 'setKpiLoading': return { ...state, kpiLoading: action.payload }
        case 'setKpiData': return { ...state, KpiData: action.payload }
        default: return state
    }
}
 
export const inviteMemState = {
    loading: '',
    error: { message: '', type: 'error' },
    toaster: { message: '', type: '' },
    lookups: {},
    showSuccess: false,
    countryLookUp: [],
    phoneCodeLookup: [],
}
 
export const inviteMemReducer = (state, action) => {
    state = state || inviteMemState
    switch (action.type) {
        case 'setShowSuccess': return { ...state, showSuccess: action.payload }
        case 'setLoading': return { ...state, loading: action.payload }
        case 'setError': return { ...state, error: { ...state.error, ...action.payload } }
        case 'setToaster': return { ...state, toaster: { ...state.toaster, ...action.payload } }
        case 'setLookups': return { ...state, lookups: { ...state.lookups, ...action.payload } }
        case 'setStates': return { ...state, ...action.payload }
        case 'setCountryLookUp': return { ...state, countryLookUp: action.payload }
        case 'setPhoneCodeLookup': return { ...state, phoneCodeLookup: action.payload }
        default: return state
    }
}
 
 
export const memberCardsState = {
    selection: null,
    loading: '',
    error: { message: '', type: 'error', errorOf: '' },
    popup: '',
    searchInput: '',
    filters: { searchParam: null }
}
 
export const memberCardsReducer = (state, action) => {
    state = state || memberCardsState
    switch (action.type) {
        case 'setLoading': return { ...state, loading: action.payload }
        case 'setPopup': return { ...state, popup: action.payload }
        case 'setError': return { ...state, error: { ...state.error, ...action.payload } }
        case 'setSelection': return { ...state, selection: action.payload }
        case 'setSearchInput': return { ...state, searchInput: action.payload }
        case 'setFilters': return { ...state, filters: { ...state.filters, ...action.payload } }
        case 'setStates': return { ...state, ...action.payload }
        default: return state
    }
}
 
 
// ------------------------------- Member/Add Card -------------------------------------------
 
export const addCardState = {
    loading: '',
    error: { message: '', type: 'error' },
    toaster: { message: '', type: '' },
    lookups: {},
}
 
export const addCardReducer = (state, action) => {
    state = state || addCardState
    switch (action.type) {
        case 'setLoading': return { ...state, loading: action.payload }
        case 'setError': return { ...state, error: { ...state.error, ...action.payload } }
        case 'setToaster': return { ...state, toaster: { ...state.toaster, ...action.payload } }
        case 'setLookups': return { ...state, lookups: { ...state.lookups, ...action.payload } }
        case 'setStates': return { ...state, ...action.payload }
        default: return state
    }
}
 
// ------------------------------- Member/Transactions -------------------------------------------
 
export const memberTransactionsState = {
    lookups: {transactionTypes: [] },
    loading: 'data',
    error:{message:'',type:'error'},
    searchInput: "",
    showDetails: null,
    filters: {
        transactionType: "All",
        searchQuery: null,
        selectedDates: "/",
    },
};
 
 
export const memberTransactionsReducer = (state, action) => {
    state = state || memberTransactionsState
    switch (action.type) {
        case "setError":
            return { ...state, error: { ...state.error, ...action.payload } };
        case "setLoading":
            return { ...state, loading: action.payload };
        case "setLookups":
            return { ...state, lookups: { ...state.lookups, ...action.payload } };
        case "setFilters":
            return { ...state, filters: { ...state.filters, ...action.payload } };
        case "setSearchInput":
            return { ...state, searchInput: action.payload };
        case "setShowDetails":
            return { ...state, showDetails: action.payload };
        default:
            return { ...state }
    }
}