import {createSlice} from "@reduxjs/toolkit";

const initialState = {
  isAuthenticated: false,
  isActive: false,
  email: null,
  username: null,
  accessToken: null,
  role: null,
};

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.isAuthenticated = true;
      state.isActive = action.payload.isActive;
      state.email = action.payload.email;
      state.username = action.payload.username || null;
      state.accessToken = action.payload.accessToken;
      state.role = action.payload.role;
    },
    setAccessToken: (state, action) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
    },
    logout: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isActive = false;
      state.email = null;
      state.username = null;
      state.role = null;
    },
  },
});

export const {setUser, setAccessToken, logout} = userAuthSlice.actions;

export default userAuthSlice.reducer;
