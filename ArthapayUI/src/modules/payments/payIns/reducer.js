export const payInsState={
    error:'',
    filters:{vault:'All',searchInput:null,dates:['','']},
    shouldExportToExcel:false,
    searchInput:null,
    lookups:{},
    selectedPayin:null,
    loading:'',
    openModal:'',
    showForm:false,
    mode:'view',
    leftPanelData:[],
    page:1
}

export const payInsReducer=(state,action)=>{
    state=state|| payInsState
    switch(action.type){
        case 'setError':return {...state,error:action.payload}
        case 'setFilters':return {...state,filters:action.payload}
        case 'setLookups':return {...state,lookups:action.payload}
        case 'setSearchInput':return {...state,searchInput:action.payload}
        case 'setSelectedPayin':return {...state,selectedPayin:action.payload}
        case 'setLoading':return {...state,loading:action.payload}
        case 'setOpenModal':return {...state,openModal:action.payload}
        case 'closeStateChangeModal':return {...state,openModal:'',selectedPayin:null}
        case 'setShouldExportToExcel':return {...state,shouldExportToExcel:action.payload}
        case 'setShowForm':return{...state,showForm:action.payload}
        case 'setMode':return{...state,mode:action.payload}
        case 'setLeftpanelData':return{...state,leftPanelData:action.payload}
        case 'setPage':return{...state,page:action.payload}
        default: return {...state}
    }
}