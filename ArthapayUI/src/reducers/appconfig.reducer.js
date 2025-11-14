import { createSlice } from '@reduxjs/toolkit';



const appConfig = createSlice({
    name: 'appConfig',
    initialState: {
        loading: true,
        logos: null,
        currentLogo: null,
        breadcrumb:[],
    },
    reducers: {
        setCurrentLogo: (state, action) => {
            state.currentLogo = action.payload
        },
        setLogos: (state, action) => {
            state.logos = action.payload
        },
        setBreadCrumb:(state,action)=>{
            if(Array.isArray(action.payload)){
                state.breadcrumb=action.payload
            }else if(action.payload.addToCurrent===true && Array.isArray(action.payload.list)){
                state.breadcrumb=[...state.breadcrumb,...action.payload.list]
            }else if(action.payload.addToCurrent===true && isObject(action.payload)){
                state.breadcrumb=[...state.breadcrumb,action.payload]
            }else if (!action.payload.addToCurrent && isObject(action.payload)){
                state.breadcrumb=[action.payload]
            }
        }
    },
});

export const { setCurrentLogo, setLogos,setBreadCrumb } = appConfig.actions;
export default appConfig.reducer;
