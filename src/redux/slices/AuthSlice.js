import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  userInfo: localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo"))
    : null,
  loguser: "",
  data: "",
};

const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      const data = JSON.stringify(action.payload);
      localStorage.setItem("userInfo", data);
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("role", action.payload.role);
      localStorage.setItem("email", action.payload.email);
    },
    logout: (state, action) => {
      state.userInfo = null;
      localStorage.removeItem("userInfo");
    },
    currentuser: (state, action) => {
      console.log(action.payload.ourUsers);
      state.loguser = action.payload.ourUsers;
    },
    adddata: (state, action) => {
      state.data = action.payload;
    },
  },
});

export const { setCredentials, logout, currentuser } = AuthSlice.actions;

export default AuthSlice.reducer;
