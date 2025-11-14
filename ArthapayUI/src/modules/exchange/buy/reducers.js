export const buyCoinState = {
    fiatWallets: null,
    fiatAmount: '',
    cryptoAmount: '',
    error: { message: '', type: 'error' },
    loading: '',
    isSaving: false,
    modal: '',
}

export const buyCoinReducer = (state, action) => {
    state = state || buyCoinState;
    switch (action.type) {
        case 'setFiatWallets':
            return { ...state, fiatWallets: action.payload }
        case 'setFiatAmount':
            return { ...state, fiatAmount: action.payload }
        case 'setIsSaving':
            return { ...state, isSaving: action.payload }
        case 'setCryptoAmount':
            return { ...state, cryptoAmount: action.payload }
        case 'setError':
            return { ...state, error: { ...buyCoinState.error, ...action.payload } }
        case 'setLoading':
            return { ...state, loading: action.payload }
        case 'setModal':
            return { ...state, modal: action.payload }
        case 'setStates':
            return { ...state, ...action.payload }
        default:
            return { ...state }
    }
}


