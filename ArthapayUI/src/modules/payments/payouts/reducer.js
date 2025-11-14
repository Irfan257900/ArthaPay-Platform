
export const gridState={
    error:'',
    filters:{vault:'All',searchInput:null,dates:['','']},
    shouldExportToExcel:false,
    searchInput:null,
    lookups:{},
}

export const gridReducer=(state,action)=>{
    state=state|| gridState
    switch(action.type){
        case 'setError':return {...state,error:action.payload}
        case 'setFilters':return {...state,filters:action.payload}
        case 'setLookups':return {...state,lookups:action.payload}
        case 'setSearchInput':return {...state,searchInput:action.payload}
        case 'setShouldExportToExcel':return {...state,shouldExportToExcel:action.payload}
        default: return {...state}
    }
}
export const processorState={
    error:'',
    lookups:{},
    loading:'',
    selectedType:'',
    modal:'',
    expiresIn:'',
    currencies:[],
    selectedMerchant:{},
    selctedCoin:{},
    fiatCurrency:[],
    payees:[],
    filteredPayees:[],
    feeInfo:null,
    minMaxfiat:{},
    minMaxCrypto:{},
    networksLu:[],
    resetTimer:false,
    responseFile:{}
}
export const processorReducer=(state,action)=>{
    state=state|| gridState
    switch(action.type){
        case 'setLoading':return {...state,loading:action.payload}
        case 'setSelectedType':return {...state,selectedType:action.payload,lookups:{}}
        case 'setError':return {...state,error:action.payload}
        case 'setModal':return {...state,modal:action.payload}
        case 'setLookups':return {...state,lookups:{...state.lookups,...action.payload}}
        case 'clearLookups':return {...state,lookups:{}}
        case 'setStates':return {...state,...action.payload}
        case 'setCurrencys':return {...state,...action.payload}
        case 'setResetTimer':return {...state,resetTimer:action.payload}
        case 'setSelectedMerchant':return{...state,selectedMerchant:action.payload}
        case 'setSelectedCoin':return{...state,selctedCoin:action.payload}
        case 'setFiatCurrency':return{...state,fiatCurrency:action.payload}
        case 'setPayess':return{...state,payees:action.payload}
        case 'setFilteredPayee':return{...state,filteredPayees:action.payload}
        case 'setMinMaxFiat':return{...state,minMaxfiat:action.payload}
        case 'setMinMaxCrypto':return{...state,minMaxCrypto:action.payload}
        case 'setNetworksLu':return{...state,networksLu:action.payload}
        case 'setResponseFile':return{...state,responseFile:action.payload}
        case 'resetState': return { ...processorState };
        default: return {...state}
    }
}
