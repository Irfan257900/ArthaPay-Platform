import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    selectedAddress: { loading: false, data: null },
}

const addressSlice = createSlice({
    name:'address',
    initialState,
    reducers:{
        getSelectedAddress:(state,action)=>{
            state.selectedAddress = {
                data:action.payload.data,
                loading:action.payload
            }
        }
    }
})

export const {getSelectedAddress} = addressSlice.actions;

export default addressSlice.reducer