/**
 * Nam Nadu — Auth Context
 * Global authentication state management with JWT tokens
 */
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { 
  TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY,
  MLA_TOKEN_KEY, MLA_USER_KEY,
  CM_TOKEN_KEY, CM_USER_KEY
} from '@/constants';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  mlaUser: null,
  isMlaAuthenticated: false,
  cmUser: null,
  isCmAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR',

  // MLA specific actions
  MLA_LOGIN_SUCCESS: 'MLA_LOGIN_SUCCESS',
  LOGOUT_MLA: 'LOGOUT_MLA',
  SET_MLA_USER: 'SET_MLA_USER',

  // CM specific actions
  CM_LOGIN_SUCCESS: 'CM_LOGIN_SUCCESS',
  LOGOUT_CM: 'LOGOUT_CM',
  SET_CM_USER: 'SET_CM_USER',
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return { ...state, isLoading: true, error: null };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false, error: null };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return { ...state, isLoading: false, error: action.payload };
    case AUTH_ACTIONS.LOGOUT:
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: null };
    case AUTH_ACTIONS.SET_USER:
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };

    case AUTH_ACTIONS.MLA_LOGIN_SUCCESS:
      return { ...state, mlaUser: action.payload, isMlaAuthenticated: true, isLoading: false, error: null };
    case AUTH_ACTIONS.SET_MLA_USER:
      return { ...state, mlaUser: action.payload, isMlaAuthenticated: true, isLoading: false };
    case AUTH_ACTIONS.LOGOUT_MLA:
      return { ...state, mlaUser: null, isMlaAuthenticated: false, isLoading: false, error: null };

    case AUTH_ACTIONS.CM_LOGIN_SUCCESS:
      return { ...state, cmUser: action.payload, isCmAuthenticated: true, isLoading: false, error: null };
    case AUTH_ACTIONS.SET_CM_USER:
      return { ...state, cmUser: action.payload, isCmAuthenticated: true, isLoading: false };
    case AUTH_ACTIONS.LOGOUT_CM:
      return { ...state, cmUser: null, isCmAuthenticated: false, isLoading: false, error: null };

    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
}

// Create context
const AuthContext = createContext(null);

/**
 * AuthProvider — wraps app with auth state
 */
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for stored token on mount
  useEffect(() => {
    const initAuth = async () => {
      let isAnyAuthLoading = false;
      
      // 1. Regular User Auth
      const token = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      if (token && storedUser) {
        isAnyAuthLoading = true;
        try {
          const parsedUser = JSON.parse(storedUser);
          const user = await authService.getMe();
          dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
        } catch {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      }

      // 2. MLA Auth
      const mlaToken = localStorage.getItem(MLA_TOKEN_KEY);
      const storedMlaUser = localStorage.getItem(MLA_USER_KEY);
      if (mlaToken && storedMlaUser) {
        isAnyAuthLoading = true;
        try {
          const parsedMlaUser = JSON.parse(storedMlaUser);
          const { leadershipService } = await import('@/services/leadership.service');
          const profile = await leadershipService.getProfile(); // Assuming this reads MLA token (we need to ensure API interceptor sends the right token, but for mock it's fine)
          dispatch({ type: AUTH_ACTIONS.SET_MLA_USER, payload: { ...parsedMlaUser, ...profile } });
        } catch {
          localStorage.removeItem(MLA_TOKEN_KEY);
          localStorage.removeItem(MLA_USER_KEY);
        }
      }

      // 3. CM Auth
      const cmToken = localStorage.getItem(CM_TOKEN_KEY);
      const storedCmUser = localStorage.getItem(CM_USER_KEY);
      if (cmToken && storedCmUser) {
        isAnyAuthLoading = true;
        try {
          const parsedCmUser = JSON.parse(storedCmUser);
          dispatch({ type: AUTH_ACTIONS.SET_CM_USER, payload: parsedCmUser });
        } catch {
          localStorage.removeItem(CM_TOKEN_KEY);
          localStorage.removeItem(CM_USER_KEY);
        }
      }

      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    };

    initAuth();
  }, []);

  // Login (Citizen / Officer / Volunteer)
  const login = useCallback(async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const data = await authService.login(email, password);
      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: data.user });
      return data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Login failed. Please try again.';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: message });
      throw error;
    }
  }, []);

  // Register — always redirects to login after success
  const register = useCallback(async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const data = await authService.register(userData);
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      return data;
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed.';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: message });
      throw error;
    }
  }, []);

  // Logout (Citizen / Officer / Volunteer)
  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
    }
  }, []);

  // MLA Login
  const mlaLogin = useCallback(async (mla_id, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const { leadershipService } = await import('@/services/leadership.service');
      const data = await leadershipService.mlaLogin(mla_id, password);
      
      localStorage.setItem(MLA_TOKEN_KEY, data.access_token);
      
      const userData = {
        id: data.mla_id,
        name: data.name,
        email: `${data.mla_id}@namnadu.gov.in`,
        role: 'mla',
        is_active: true,
        ward_id: data.ward_id,
        district_id: data.district_id,
      };
      localStorage.setItem(MLA_USER_KEY, JSON.stringify(userData));
      
      dispatch({ type: AUTH_ACTIONS.MLA_LOGIN_SUCCESS, payload: userData });
      return data;
    } catch (error) {
      const message = error.response?.data?.detail || 'MLA login failed. Please check credentials.';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: message });
      throw error;
    }
  }, []);

  // MLA Logout
  const mlaLogout = useCallback(async () => {
    localStorage.removeItem(MLA_TOKEN_KEY);
    localStorage.removeItem(MLA_USER_KEY);
    dispatch({ type: AUTH_ACTIONS.LOGOUT_MLA });
  }, []);

  // CM Admin Login
  const cmAdminLogin = useCallback(async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const { leadershipService } = await import('@/services/leadership.service');
      const data = await leadershipService.cmLogin(email, password);
      
      localStorage.setItem(CM_TOKEN_KEY, data.access_token);
      
      const userData = data.user || {
        id: 'CM-001',
        email: email,
        role: 'cm_admin'
      };
      localStorage.setItem(CM_USER_KEY, JSON.stringify(userData));
      
      dispatch({ type: AUTH_ACTIONS.CM_LOGIN_SUCCESS, payload: userData });
      return data;
    } catch (error) {
      const message = error.response?.data?.detail || 'CM Admin login failed. Please check credentials.';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: message });
      throw error;
    }
  }, []);

  // CM Logout
  const cmLogout = useCallback(async () => {
    localStorage.removeItem(CM_TOKEN_KEY);
    localStorage.removeItem(CM_USER_KEY);
    dispatch({ type: AUTH_ACTIONS.LOGOUT_CM });
  }, []);

  // Get Current MLA (Legacy fallback for other parts of the app)
  const getCurrentMLA = useCallback(() => {
    return state.mlaUser;
  }, [state.mlaUser]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    mlaLogin,
    mlaLogout,
    cmAdminLogin,
    cmLogout,
    getCurrentMLA,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth hook — access auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
