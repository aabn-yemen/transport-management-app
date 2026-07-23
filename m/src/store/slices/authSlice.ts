import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/client';
import { storageKeys } from '../../constants/config';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  roleId: string;
  permissions: string[];
  avatar: string;
  language: string;
  theme: string;
  driverNumber?: string;
  studentNumber?: string;
  college?: string;
  department?: string;
  busId?: { busNumber: string; [key: string]: any } | string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialLoading: true,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.post('/auth/login', credentials);
      const { token, refreshToken, user } = data.data;
      await SecureStore.setItemAsync(storageKeys.token, token);
      await SecureStore.setItemAsync(storageKeys.refreshToken, refreshToken);
      return { user: { ...user, id: user.id || user._id }, token };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await apiClient.get('/auth/profile');
      const raw = data.data;
      return {
        id: raw.id || raw._id,
        fullName: raw.fullName,
        username: raw.username,
        email: raw.email,
        phone: raw.phone,
        role: raw.role,
        roleId: typeof raw.roleId === 'object' ? raw.roleId._id || raw.roleId.id : raw.roleId,
        permissions: raw.permissions || [],
        avatar: raw.avatar || '',
        language: raw.language || 'ar',
        theme: raw.theme || 'light',
        driverNumber: raw.driverNumber,
        studentNumber: raw.studentNumber,
        college: raw.college,
        department: raw.department,
        busId: raw.busId,
      } as any;
    } catch (error: any) {
      return rejectWithValue({ message: error.response?.data?.message || 'فشل تحميل الملف الشخصي', status: error.response?.status });
    }
  }
);

export const loadStoredAuth = createAsyncThunk(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await SecureStore.getItemAsync(storageKeys.token);
      if (!token) return rejectWithValue('no token');
      return { token };
    } catch (error: any) {
      return rejectWithValue(error.message || 'failed to load stored auth');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.initialLoading = false;
      SecureStore.deleteItemAsync(storageKeys.token);
      SecureStore.deleteItemAsync(storageKeys.refreshToken);
    },
    setCredentials(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    finishInitialLoading(state) {
      state.initialLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.initialLoading = false;
      })
      .addCase(getProfile.rejected, (state, action: any) => {
        state.loading = false;
        state.initialLoading = false;
        const status = action.payload?.status;
        if (status === 401) {
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
          SecureStore.deleteItemAsync(storageKeys.token);
          SecureStore.deleteItemAsync(storageKeys.refreshToken);
        }
      })
      .addCase(loadStoredAuth.pending, (state) => {
        state.initialLoading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.initialLoading = true;
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.initialLoading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, setCredentials, finishInitialLoading } = authSlice.actions;
export default authSlice.reducer;
