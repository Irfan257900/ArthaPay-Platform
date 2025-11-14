export const initialState = {
    loading: '',
    error: '',
    lookups: {},
    selectedType: '',
    formStep:'',
    modalOpen:'',
    formLu:[],
    templateData:'',
    selectedVault:null
}

export const formReducer = (state, action) => {
    state = state || initialState
    switch (action.type) {
        case 'setLoading': return { ...state, loading: action.payload }
        case 'setError': return { ...state, error: action.payload }
        case 'setLookups': return { ...state, lookups: action.payload }
        case 'setSelectedType': return { ...state, selectedType: action.payload }
        case 'setFormStep': return { ...state, formStep: action.payload }
        case 'setModalOpen':return {...state,modalOpen:action.payload}
        case 'setFormLu' : return {...state,formLu:action.payload}
        case 'setTemplateData':return {...state , templateData:action.payload}
        case 'setSelectedVault':return {...state,selectedVault:action.payload}
        default: return { ...state }
    }
}