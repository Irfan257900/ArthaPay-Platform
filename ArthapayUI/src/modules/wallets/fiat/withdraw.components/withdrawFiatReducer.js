import { ApiControllers } from "../../../../api/config";
import { deriveErrorMessage } from "../../../../core/shared/deriveErrorMessage";
import { appClientMethods } from "../../../../core/http.clients";
const { wallets } = ApiControllers
const SET_FIAT_COINS = 'setFiatCoins'
const SET_SELECTED_COIN = "setSelectedCoin"
const SET_WITHDRAW_SAVE = "setWithdrawFiatSaveObj"
const SET_PAYEE_FIAT = "setPayeeFiat"
const SET_WITHDRAW_OBJ = "setWithdrawObject"
const SET_REFRESH_TRANSACTION = "setRefreshTransactionGrid"
const SET_REFRESH_LEFT_PANEL = "setRefreshLeftPanel"
const SET_TOTAL_AMOUNT="setTotalAmounts"
const SET_FAIT_VALUTS="setFiatvaluts"

const setSelectedCoin = (payload = null) => {
    return { type: SET_SELECTED_COIN, payload };
};
const setTotalAmounts = (payload = null) => {
    return { type: SET_TOTAL_AMOUNT, payload };
};
const setFiatvaluts = (payload = { loader: false, data: null, error: "" }) => {
    return { type: SET_FAIT_VALUTS, payload };
};
const setFiatCoins = (payload = { loader: false, data: null, error: "" }) => {
    return { type: SET_FIAT_COINS, payload };
};
const setWithdrawFiatSaveObj = (payload = null) => {
    return { type: SET_WITHDRAW_SAVE, payload };
}
const setPayeeFiat = (payload = null) => {
    return { type: SET_PAYEE_FIAT, payload };
}
const setWithdrawObject = (payload = null) => {
    return { type: SET_WITHDRAW_OBJ, payload };
}
const setRefreshTransactionGrid = (payload) => {
    return { type: SET_REFRESH_TRANSACTION, payload }
}
const setRefreshLeftPanel = (payload) => {
    return { type: SET_REFRESH_LEFT_PANEL, payload }
}
const initialState = {
    fiatCoins: { loader: true, data: null, error: "" },
    faitvaluts: { loader: true, data: null, error: "" },
    TotalAmount:0,
    selectedCoin: null,
    withdrawSaveObj: null,
    selectedPayee: null,
    withdrawObj: null,
    isRefreshTransactionGrid: false,
    isRefreshLeftPanel: false,
    
};


const fetchVaultsdetails = (isloading, id) => {
    return async (dispatch) => {
        dispatch(setFiatvaluts({
            loader: isloading,
            data: null,
            error: "",
        }));

        try {
            const response = await appClientMethods.get(`withdraw/wallets/${id}/fiat`);

            if (response) {
                dispatch(setFiatvaluts({
                    loader: false,
                    data: response,
                    error: "",
                }));
                dispatch(setTotalAmounts(response));
            } else {
                dispatch(setFiatvaluts({
                    loader: false,
                    data: null,
                    error: deriveErrorMessage(response),
                }));
            }
        } catch (error) {
            dispatch(setFiatvaluts({
                loader: false,
                data: null,
                error: error?.message,
            }));
        }
    };
};

const fetchFiatCoins = (isloading, screenType) => {
    return async (dispatch) => {
        dispatch(
            setFiatCoins({
                loader: isloading,
                data: null,
                error: "",
            })
        );
        try {
            const response = await appClientMethods.get(`${wallets}${screenType}`);
            if (response) {
                dispatch(
                    setFiatCoins({
                        loader: false,
                        data: response.assets,
                        error: "",
                    })
                );
                dispatch(
                    setTotalAmounts({
                         response,
                    })
                );
                
            } else {
                dispatch(
                    setFiatCoins({
                        loader: false,
                        data: null,
                        error: deriveErrorMessage(response),
                    })
                );
            }
        } catch (error) {
            dispatch(
                setFiatCoins({
                    loader: false,
                    data: null,
                    error: error?.message,
                })
            );
        }
    };
}


const WithdrawFaitReducer = (state, action) => {
    state = state || initialState;
    switch (action.type) {
        case SET_FIAT_COINS: return { ...state, fiatCoins: { ...action.payload }, }
        case SET_FAIT_VALUTS: return { ...state, faitvaluts: { ...action.payload }, }
        case SET_TOTAL_AMOUNT: return { ...state, TotalAmount: { ...action.payload }, }
        case SET_SELECTED_COIN: return { ...state, selectedCoin: action.payload }
        case SET_WITHDRAW_SAVE: return { ...state, withdrawSaveObj: action.payload }
        case SET_PAYEE_FIAT: return { ...state, selectedPayee: action.payload }
        case SET_WITHDRAW_OBJ: return { ...state, withdrawObj: action.payload }
        case SET_REFRESH_TRANSACTION: return { ...state, isRefreshTransactionGrid: action.payload }
        case SET_REFRESH_LEFT_PANEL: return { ...state, isRefreshLeftPanel: action.payload }
        default:
            return state;
    }
};
export { setFiatCoins, fetchFiatCoins, setSelectedCoin, setWithdrawFiatSaveObj, setPayeeFiat, setWithdrawObject, setRefreshTransactionGrid, setRefreshLeftPanel,setTotalAmounts,setFiatvaluts,fetchVaultsdetails };
export default WithdrawFaitReducer;
