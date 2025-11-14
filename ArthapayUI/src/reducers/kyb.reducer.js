import { createSlice,createAsyncThunk } from "@reduxjs/toolkit";
import {appClientMethods as coreClientMethods} from "../core/http.clients"
const initialState = {
  excemptionFields: null,
  lookups:{loading:true,data:{countries:[],kycDocTypes:[],kybDocTypes:[],states:[],KybDetailSections:[]},error:''},
};
export const fetchLookups= createAsyncThunk(
  'kyb/fetchLookups',
  async (_, { rejectWithValue }) => {
      try {
          const {countryWithTowns:countries,KybDocumentTypes:kybDocTypes,KycDocumentTypes:kycDocTypes,PhoneCodes:phoneCodes,countryWithStates:states,KybDetailSections:KybDetailSections} = await coreClientMethods.get(`kyc/lookup`)
          return  {countries,kybDocTypes,kycDocTypes,phoneCodes,states,KybDetailSections}
      } catch (error) {
          return rejectWithValue(error.message);
      }
  }
);
const KybReducer = createSlice({
  name: "kyb",
  initialState,
  reducers: {   
    setExcemptionFields: (state, action) => {
      state.excemptionFields = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
        .addCase(fetchLookups.pending, (state) => {
            state.lookups.loading = true;
            state.lookups.data=initialState.lookups.data
            state.lookups.error=initialState.lookups.error
        })
        .addCase(fetchLookups.fulfilled, (state, action) => {
          state.lookups.loading = false;
          state.lookups.data=action.payload
          state.lookups.error=initialState.lookups.error
        })
        .addCase(fetchLookups.rejected, (state,action) => {
          state.lookups.loading = false;
          state.lookups.data=initialState.lookups.data
          state.lookups.error=action.payload
        })
        
}
});

export const { setExcemptionFields } = KybReducer.actions;

export default KybReducer.reducer;