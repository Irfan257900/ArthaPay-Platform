export const payeeState = {
    data: null,
    error: { message: '', type: '' },
    showDisableModal: false,
    isLoading: false,
}

export const payeeReducer = (state, action) => {
    state = state || payeeState;
    switch (action.type) {
        case 'setData':
            state = { ...state, data: action.payload }
            return state
        case 'setError':
            state = { ...state, error: action.payload }
            return state
        case 'setShowDisableModal':
            state = { ...state, showDisableModal: action.payload }
            return state
        case 'setIsLoading':
            state = { ...state, isLoading: action.payload }
            return state
        default:
            return state
    }
}

export const fiatLookups = {
    fiatCurrencies: [],
    countries: [],
    states: [],
}
export const fiatFormState = {
    error: { message: '', type: '' },
    loading: '',
    lookups: {},
    paymentFields: [],
    initialData:null,
    isBaas:false,
    bankDetailsLoader:false,
    bankDetails:null,
    isLoading: '',
}

export const fiatFormReducer = (state, action) => {
    state = state || fiatFormState;
    switch (action.type) {
        case 'setInitialData':
            state = { ...state, initialData: action.payload }
            return state
        case 'setError':
            state = { ...state, error: action.payload }
            return state
        case 'setLoading':
            state = { ...state, loading: action.payload }
            return state
        case 'setLookups':
            state = { ...state, lookups: { ...state.lookups, ...action.payload } }
            return state
        case 'setPaymentFields': state = { ...state, paymentFields: action.payload }
            return state
        case 'setIsBaas':
            state = { ...state, isBaas: action.payload }
            return state
        case 'setBankDetailsLoader':
            state = { ...state, bankDetailsLoader: action.payload }
            return state
        case 'setBankDetails':
            state = { ...state, bankDetails: action.payload }
            return state
            case 'setIsLoading':
            state = { ...state, isLoading: action.payload }
            return state
        default:
            return state
    }
}


export const cryptoFormState = {
    lookups: {},
    loading: '',
    error: '',
    lookupsData: {},
    showProofType:false,
}

export const cryptoFormReducer = (state, action) => {
    state = state || cryptoFormState
    switch (action.type) {
        case 'setError': return { ...state, error: action.payload }
        case 'setLookups': return { ...state, lookups: { ...state.lookups, ...action.payload } }
        case 'setLoading': return { ...state, loading: action.payload }
        case 'setLookupsData': return { ...state, lookupsData: action.payload }
        case 'setShowProofType': return { ...state, showProofType: action.payload }
        default: return { ...state }
    }
}
