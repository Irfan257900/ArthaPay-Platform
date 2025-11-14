export const formState={
    lookups:null,
    loading:'',
    errorMessage:'',
    isAddressVerified:false,
}

export const formReducer=({state,action})=>{
    state=state|| formState
    switch(action.type){
        case 'setErrorMessage':return {...state,errorMessage:action.payload}
        case 'setFilters':return {...state,filters:action.payload}
        case 'setLookups':return {...state,lookups:action.payload}
        case 'setLoading':return {...state,loading:action.payload}
        case 'setIsAddressVerified':return {...state,isAddressVerified:action.payload}
        default: return {...state}
    }
}
