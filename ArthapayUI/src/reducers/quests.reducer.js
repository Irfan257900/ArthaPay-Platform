import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { loyaltyAppClientMethods } from '../core/http.clients';

// Initial state
const initialState = {
  allQuests: { loading: false, data: null, error: null },
  inProgress: { loading: false, data: [], error: null },
  completed: { loading: false, data: [], error: null },
  startQuest: { loading: false, data: null, error: null },
  questListData: { loading: false, data: [], error: null },
};
// Thunks
export const fetchAvailable = createAsyncThunk(
  'questsReducer/fetchAvailable',
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await loyaltyAppClientMethods.get(`loyalty/quests/available/${id}`, '');
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchInProgress = createAsyncThunk(
  'questsReducer/fetchInProgress',
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await loyaltyAppClientMethods.get(`loyalty/quests/in-progress/${id}`, '');
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchCompleted = createAsyncThunk(
  'questsReducer/fetchCompleted',
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await loyaltyAppClientMethods.get(`loyalty/quests/completed/${id}`, '');
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const handleStartQuest = createAsyncThunk(
  'questsReducer/handleStartQuest',
  async ({ questsid, userId, onSuccess }, { rejectWithValue }) => {
    try {
      const response = await loyaltyAppClientMethods.post(`loyalty/quests/${questsid}/join/${userId}`, {}, '');
      onSuccess();
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ✅ New thunk for fetching quest detail
export const fetchQuestList = createAsyncThunk(
  'questsReducer/fetchQuestList',
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await loyaltyAppClientMethods.get(`loyalty/quests/${id}`,'');
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const questsSlice = createSlice({
  name: 'questsReducer',
  initialState,
  reducers: {
    clearErrorMessage: (state, action) => {
      if (Array.isArray(action.payload) && action.payload?.length > 0) {
        action.payload.forEach(key => {
          state[key].error = initialState[key].error;
        });
      } else {
        state.error = null;
      }
    },
    setErrorMessage: (state, action) => {
      if (Array.isArray(action.payload) && action.payload?.length > 0) {
        action.payload.forEach(({ key, message }) => {
          state[key].error = message;
        });
      } else {
        state.error = action.payload;
      }
    },
    resetState: (state, action) => {
      if (Array.isArray(action.payload) && action.payload?.length > 0) {
        action.payload.forEach(key => {
          state[key] = initialState[key];
        });
      } else {
        return initialState;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Available
      .addCase(fetchAvailable.pending, (state) => {
        state.allQuests.loading = true;
        state.allQuests.error = null;
      })
      .addCase(fetchAvailable.fulfilled, (state, action) => {
        state.allQuests.loading = false;
        state.allQuests.data = action.payload;
      })
      .addCase(fetchAvailable.rejected, (state, action) => {
        state.allQuests.loading = false;
        state.allQuests.error = action.payload;
      })

      // InProgress
      .addCase(fetchInProgress.pending, (state) => {
        state.inProgress.loading = true;
        state.inProgress.error = null;
      })
      .addCase(fetchInProgress.fulfilled, (state, action) => {
        state.inProgress.loading = false;
        state.inProgress.data = action.payload;
      })
      .addCase(fetchInProgress.rejected, (state, action) => {
        state.inProgress.loading = false;
        state.inProgress.error = action.payload;
      })

      // Completed
      .addCase(fetchCompleted.pending, (state) => {
        state.completed.loading = true;
        state.completed.error = null;
      })
      .addCase(fetchCompleted.fulfilled, (state, action) => {
        state.completed.loading = false;
        state.completed.data = action.payload;
      })
      .addCase(fetchCompleted.rejected, (state, action) => {
        state.completed.loading = false;
        state.completed.error = action.payload;
      })

      // Start Quest
      .addCase(handleStartQuest.pending, (state) => {
        state.startQuest.loading = true;
        state.startQuest.error = null;
      })
      .addCase(handleStartQuest.fulfilled, (state, action) => {
        state.startQuest.loading = false;
        state.startQuest.data = action.payload;
      })
      .addCase(handleStartQuest.rejected, (state, action) => {
        state.startQuest.loading = false;
        state.startQuest.error = action.payload;
      })

      // ✅ Quest Detail
      .addCase(fetchQuestList.pending, (state) => {
        state.questListData.loading = true;
        state.questListData.error = null;
      })
      .addCase(fetchQuestList.fulfilled, (state, action) => {
        state.questListData.loading = false;
        state.questListData.data = action.payload;
      })
      .addCase(fetchQuestList.rejected, (state, action) => {
        state.questListData.loading = false;
        state.questListData.error = action.payload;
      });
  },
});

// Exports
export const {
  clearErrorMessage,
  setErrorMessage,
  resetState
} = questsSlice.actions;

export default questsSlice.reducer;
