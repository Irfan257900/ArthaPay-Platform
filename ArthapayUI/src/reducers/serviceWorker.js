import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isUpdateAvailable: false,
};


const serviceWorkerSlice = createSlice({
  name: "serviceWorker",
  initialState,
  reducers: {
    updateWorker: (state) => {
      state.isUpdateAvailable = true;
    },
  },
});

export const { updateWorker } = serviceWorkerSlice.actions;

export default serviceWorkerSlice.reducer;
