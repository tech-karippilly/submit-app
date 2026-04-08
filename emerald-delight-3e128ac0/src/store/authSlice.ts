import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { authApi, LoginRequest, LoginResponse } from "@/services/auth.services";

interface AuthState {
  user: null | { email: string; role: string };
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER: "user",
};

// Helper functions for localStorage
const getStoredAuth = (): Partial<AuthState> => {
  try {
    const accessToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    const user = userStr ? JSON.parse(userStr) : null;

    return {
      accessToken,
      refreshToken,
      user,
      isAuthenticated: !!accessToken,
    };
  } catch {
    return {
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    };
  }
};

const storeAuth = (data: LoginResponse) => {
  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
  const user = { email: "admin", role: "admin" };
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  return user;
};

const clearAuth = () => {
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

// Login async thunk
export const login = createAsyncThunk<
  { user: { email: string; role: string }; tokens: LoginResponse },
  LoginRequest,
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await authApi.login(credentials);
    const user = storeAuth(response);
    return { user, tokens: response };
  } catch (error: unknown) {
    const message = error instanceof Error 
      ? error.message 
      : (error as { response?: { data?: { message?: string } } })?.response?.data?.message || "Login failed";
    return rejectWithValue(message);
  }
});

// Logout async thunk
export const logout = createAsyncThunk("auth/logout", async () => {
  clearAuth();
});

const storedAuth = getStoredAuth();

const initialState: AuthState = {
  user: storedAuth.user || null,
  accessToken: storedAuth.accessToken || null,
  refreshToken: storedAuth.refreshToken || null,
  isAuthenticated: storedAuth.isAuthenticated || false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      clearAuth();
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<{ user: { email: string; role: string }; tokens: LoginResponse }>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.tokens.accessToken;
        state.refreshToken = action.payload.tokens.refreshToken;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload || "Login failed";
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;
