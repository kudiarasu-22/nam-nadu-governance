/**
 * Nam Nadu — Auth Context
 * Global authentication state management with JWT tokens
 */
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '@/services/auth.service';
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '@/constants';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // true on mount until we check stored token
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
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return { ...state, isLoading: true, error: null };
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false, error: null };
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: action.payload };
    case AUTH_ACTIONS.LOGOUT:
      return { ...state, user: null, isAuthenticated: false, isLoading: false, error: null };
    case AUTH_ACTIONS.SET_USER:
      return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
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
      const token = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);

      if (token && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.role === 'mla') {
            // Wait, we need an endpoint for MLA me, or just trust it for now
            // I'll call leadership/profile
            const { leadershipService } = await import('@/services/leadership.service');
            const profile = await leadershipService.getProfile();
            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: { ...parsedUser, ...profile } });
          } else if (parsedUser.role === 'cm_admin') {
            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: parsedUser });
          } else {
            // Verify token by fetching current user
            const user = await authService.getMe();
            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
          }
        } catch {
          // Token invalid — clear storage
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initAuth();
  }, []);

  // Login
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

  // CM Admin Login
  const cmAdminLogin = useCallback(async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const { leadershipService } = await import('@/services/leadership.service');
      const data = await leadershipService.cmLogin(email, password);
      localStorage.setItem(TOKEN_KEY, data.access_token);
      if (data.refresh_token) {
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
      }
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: data.user });
      return data;
    } catch (error) {
      const message = error.response?.data?.detail || 'CM Admin login failed. Please check credentials.';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: message });
      throw error;
    }
  }, []);

  // Register — always redirects to login after success (backend returns no tokens)
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

  // MLA Login
  const mlaLogin = useCallback(async (mla_id, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    try {
      const { leadershipService } = await import('@/services/leadership.service');
      const data = await leadershipService.mlaLogin(mla_id, password);
      
      localStorage.setItem(TOKEN_KEY, data.access_token);
      
      const userData = {
        id: data.mla_id,
        name: data.name,
        email: `${data.mla_id}@namnadu.gov.in`, // mock email
        role: 'mla',
        is_active: true,
        ward_id: data.ward_id,
        district_id: data.district_id,
      };
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: userData });
      return data;
    } catch (error) {
      const message = error.response?.data?.detail || 'MLA login failed. Please check credentials.';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: message });
      throw error;
    }
  }, []);

  // Logout
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

  // MLA Logout (Alias for logout, to fulfill dedicated method requirement)
  const mlaLogout = logout;

  // Get Current MLA
  const getCurrentMLA = useCallback(() => {
    if (state.user?.role === 'mla') return state.user;
    return null;
  }, [state.user]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  const value = {
    ...state,
    login,
    cmAdminLogin,
    mlaLogin,
    register,
    logout,
    mlaLogout,
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
