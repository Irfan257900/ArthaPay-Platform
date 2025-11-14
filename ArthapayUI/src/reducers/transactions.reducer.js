import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { appClientMethods } from "../core/http.clients";
const initialState = {
  kpis: {loading:true,data:null,error:''},
  selectedKpi: null,
};
export const fetchKpis = createAsyncThunk(
  'userProfile/fetchKpis',
  async (_, { rejectWithValue }) => {
    try {
      return await appClientMethods.get(`transactions/kpis`)
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
)
const transactionsSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setErrorMessages: (state, action) => {
      if (Array.isArray(action.payload) && action.payload?.length > 0) {
        action.payload.forEach(({ key, message }) => {
          state[key].error = message
        });
      }
    },
    resetState: (state, action) => {
      if (Array.isArray(action.payload) && action.payload?.length > 0) {
        action.payload.forEach(key => {
          state[key] = initialState[key]
        });
      } else {
        return initialState;
      }
    },
    setSelectedKpi:(state,action)=>{
      state.selectedKpi=action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchKpis.pending, (state) => {
        state.kpis.loading = true;
        state.kpis.data = null;
        state.kpis.error = '';
      })
      .addCase(fetchKpis.fulfilled, (state, action) => {
        state.kpis.loading = false;
        state.kpis.error = '';
        state.kpis.data = action.payload;
      })
      .addCase(fetchKpis.rejected, (state, action) => {
        state.kpis.loading = false;
        state.kpis.error = action.payload;
        state.kpis.data = null;
      })
  }
  });

export const { setErrorMessages,resetState,setSelectedKpi } = transactionsSlice.actions;

export default transactionsSlice.reducer;
