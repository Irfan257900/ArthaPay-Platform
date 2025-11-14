export const gridState = {
    loading: '',
    error:{message:'',type:'error'},
    lookups: {},
    selectedModule:'All',
    selectedTransaction:null,
    shouldDownload: false,
    searchInput: '',
    filters: {
        module:"All",
        status: "All",
        searchQuery: null,
        startDate: "",
        endDate: "",
    },
    isRefresh: false
}

export const gridReducer = (state, action) => {
    state = state || gridState
    switch (action.type) {
        case 'setLoading': return { ...state, loading: action.payload }
        case 'setModal': return { ...state, modal: action.payload }
        case 'setError': return { ...state, error: { ...state.error, ...action.payload } }
        case 'setSelectedTransaction': return { ...state, selectedTransaction: action.payload }
        case 'setSearchInput': return { ...state, searchInput: action.payload }
        case 'setFilters': return { ...state, filters: { ...state.filters, ...action.payload } }
        case 'setLookups': return { ...state, lookups: { ...state.lookups, ...action.payload } }
        case 'setStates': return { ...state, ...action.payload }
        case 'setShouldDownload': return { ...state, shouldDownload: action.payload }
        case 'setSelectedModule': return { ...state, selectedModule: action.payload }
        case 'setRefresh': return { ...state, isRefresh: action.payload }
        default: return state
    }
}
