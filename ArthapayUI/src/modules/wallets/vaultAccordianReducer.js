
import { deriveErrorMessage } from "../../core/shared/deriveErrorMessage";
import { getDepositWithdrawMerchants } from "./api";
import { appClientMethods } from "./httpClients";


const SET_VAULTS = "setVaults";
const SET_SELECTED_VAULT = "setSelectedVault"
const SET_SELECTED_COIN="setSelectedCoin"
const SET_CARDS = "setCards";
const SET_SELECTED_CARD = 'setSelectedCard'

const setSelectedCoin = (payload=null) => {
    return { type: SET_SELECTED_COIN, payload };
};

const setSelectedVault = (payload=null) => {
    return { type: SET_SELECTED_VAULT, payload };
};

const setVaults = (payload = { loader: true, data: null, error: "" }) => {
    return { type: SET_VAULTS, payload };
}
const setCards = (payload = { loader: false, data: null, error: "" }) => {
    return { type: SET_CARDS, payload };
}
const setSelectedCard = (payload=null) => {
    return { type: SET_SELECTED_CARD, payload };
};
const fetchVaults = (screenName,isloading) => {
    return async (dispatch) => {
        dispatch(
            setVaults({
                loader: isloading,
                data: null,
                error: "",
            })
        );
        try {
            const response = await getDepositWithdrawMerchants(screenName);
            if (response) {
                dispatch(
                    setVaults({
                        loader: false,
                        data: response,
                        error: "",
                    })
                );
            } else {
                dispatch(
                    setVaults({
                        loader: false,
                        data: null,
                        error: deriveErrorMessage(response),
                    })
                );
            }
        } catch (error) {
            dispatch(
                setVaults({
                    loader: false,
                    data: null,
                    error: error.message,
                })
            );
        }
    };
}
const fetchFaitCards = (urlParams) => {
    return async (dispatch) => {
        const { id, pageSize, pageNo ,action} = urlParams
        dispatch(
            setCards({
                loader: true,
                data: null,
                error: "",
            })
        );
        try {
            const response = await appClientMethods.get(`CardsWallet/Vaults/MyCards/${id}/${pageSize}/${pageNo}/${action}`);
            if (response) {
                dispatch(
                    setCards({
                        loader: false,
                        data: response,
                        error: "",
                    })
                );
            } else {
                dispatch(
                    setCards({
                        loader: false,
                        data: null,
                        error: deriveErrorMessage(response),
                    })
                );
            }
        } catch (error) {
            dispatch(
                setCards({
                    loader: false,
                    data: null,
                    error: error.message,
                })
            );
        }
    };
}

const initialState = {
    vaults: { loader: true, data: null, error: "" },
    selectedVault: null,
    selectedCoin:null,
    cardsLeftPannel: { loader: false, data: null, error: "" },
    selectedCard:null
};
const vaultsAccordionReducer = (state, action) => {
    state = state || initialState;
    switch (action.type) {
        case SET_VAULTS:
            return {
                ...state,
                vaults: {
                    ...action.payload,
                },
            }
        case SET_CARDS:
            return {
                ...state,
                cardsLeftPannel: {
                    ...action.payload,
                },
            }
        case SET_SELECTED_VAULT: return { ...state, selectedVault: action.payload }
        case SET_SELECTED_COIN:return { ...state, selectedCoin: action.payload }
        case SET_SELECTED_CARD:return { ...state, selectedCard: action.payload }
        default:
            return state;
    }
};
export { fetchVaults, setSelectedVault, setVaults,setSelectedCoin,fetchFaitCards,setCards,setSelectedCard };
export default vaultsAccordionReducer;
