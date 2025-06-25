import * as jwt_decode_module from "jwt-decode";
import store from "../redux/store";
import { logout } from "../redux/slices/AuthSlice";  // adjust your actual slice path

const jwt_decode = jwt_decode_module.default;
// Function to get access token from localStorage
const getAccessToken = () => {
  return localStorage.getItem("accessToken");
};

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

// Generic Fetch wrapper with auth handling
// export const fetchWithAuth = async (url, options = {}) => {
//   const token = getAccessToken();

//   // Pre-check expiration before sending request
//   if (isTokenExpired(token)) {
//     console.warn("Access token expired before request. Logging out.");
//     store.dispatch(logout());
//     return Promise.reject("Token expired");
//   }

//   const headers = {
//     ...options.headers,
//     Authorization: `Bearer ${token}`,
//     "Content-Type": "application/json",
//   };

//   try {
//     const response = await fetch(url, { ...options, headers });

//     if (response.status === 401) {
//       console.warn("Received 401 from backend. Logging out.");
//       store.dispatch(logout());
//       return Promise.reject("Unauthorized");
//     }

//     return response;
//   } catch (error) {
//     console.error("Fetch error:", error);
//     throw error;
//   }
// };


export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');  // or 'accessToken' based on your storage key

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