import * as jwt_decode_module from "jwt-decode";
import store from "../redux/store";
import { logout } from "../redux/slices/AuthSlice";  // adjust your actual slice path

const jwt_decode = jwt_decode_module.default;


// Check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const decoded = jwt_decode(token);
    const now = Date.now() / 1000;
    return decoded.exp < now;
  } catch (e) {
    console.error("Error decoding token:", e);
    return true;
  }
};


export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');  

  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    console.warn("401 Unauthorized — You may want to handle logout here.");
    // Optionally dispatch logout here if you want centralized handling.
     store.dispatch(logout());
  }

  return response;
};