import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appConfig } from "../../config";

const token = localStorage.getItem("token");
//create action
export const createUser = createAsyncThunk(
  "createUser",
  async (data, { rejectWithValue }) => {
    console.log("data", data);

    try {
      const response = await fetch(`${appConfig.ip}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        return rejectWithValue(response.status);
      }

      const result = await response.json();

      return result;
    } catch (error) {
      console.log(error.response.data);
      return rejectWithValue(error);
    }
  }
);

//read action
export const showUser = createAsyncThunk(
  "showUser",
  async (data, { rejectWithValue }) => {
    console.log(data.keyword);
    let response;
    data.role !== ""
      ? (response = await fetch(
          `${appConfig.ip}/admin/get-all-users?keyword=${data.keyword}&role=${data.role}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ))
      : (response = await fetch(
          `${appConfig.ip}/admin/get-all-users?keyword=&role=`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ));

    try {
      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);
//delete action
export const deleteUser = createAsyncThunk(
  "deleteUser",
  async (id, { rejectWithValue }) => {
    const response = await fetch(`${appConfig.ip}/admin/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    try {
      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

//update action
export const updateUser = createAsyncThunk(
  "updateUser",
  async (data, { rejectWithValue }) => {
    console.log("updated data", data);
    const response = await fetch(`${appConfig.ip}/admin/update/${data.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    try {
      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

//update action
export const fetchUserById = createAsyncThunk(
  "fetchUserById",
  async (id, { rejectWithValue }) => {
    const response = await fetch(`${appConfig.ip}/admin/get-users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    try {
      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const getProf = createAsyncThunk(
  "getProf",
  async (arg, { rejectWithValue }) => {
    const response = await fetch(`${appConfig.ip}/adminuser/get-profile`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    try {
      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

//verify OTP action
export const verifyOTP = createAsyncThunk(
  "verifyOTP",
  async (data, { rejectWithValue }) => {
    console.log("otp data", data);
    const response = await fetch(
      `${appConfig.ip}/auth/verify-account?email=${data.email}&otp=${data.otp}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    try {
      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

//regenerate OTP action
export const regenerateOTP = createAsyncThunk(
  "regenerateOTP",
  async (data, { rejectWithValue }) => {
    console.log("updated data", data);
    const response = await fetch(
      `${appConfig.ip}/auth/regenerate-otp?email=${data.email}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    try {
      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

//forgot-password action
export const forgotPassword = createAsyncThunk(
  "forgotPassword",
  async (data, { rejectWithValue }) => {
    try {
      console.log("forgot-password data", data);
      const response = await fetch(
        `${appConfig.ip}/auth/forgot-password?email=${data.email}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

//set-password action
export const resetPassword = createAsyncThunk(
  "resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      console.log("set-password data", data);
      const response = await fetch(
        `${appConfig.ip}/auth/set-password?email=${data.email}&newPassword=${data.newPassword}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const userDetail = createSlice({
  name: "app",
  initialState: {
    users: [],
    loading: false,
    error: null,
    user: "",
    searchData: [],
    message: null,
    currentUser: null,
  },

  reducers: {
    searchUser: (state, action) => {
      console.log(action.payload);
      state.searchData = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload.ourUsers);
        state.user = action.payload.ourUsers;
        state.message = action.payload.message;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        console.log(action.payload);
        state.error = action.payload;
      })
      .addCase(showUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(showUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.ourUsersList;
      })
      .addCase(showUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map((ele) =>
          ele.id === action.payload.id ? action.payload : ele
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(getProf.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProf.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload.ourUsers;
        if(action.payload.ourUsers){
        localStorage.setItem("id", action.payload.ourUsers?.id);
        }
      })
      .addCase(getProf.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })
      .addCase(regenerateOTP.pending, (state) => {
        state.loading = true;
      })
      .addCase(regenerateOTP.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(regenerateOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })

      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })

      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
  },
});

export default userDetail.reducer;

export const { searchUser } = userDetail.actions;
