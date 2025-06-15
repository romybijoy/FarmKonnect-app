import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appConfig } from "../../config";

const token = localStorage.getItem("token");

const ip = `${appConfig.ip}/user`;
//create action
export const createUser = createAsyncThunk(
  "createUser",
  async (data, { rejectWithValue }) => {
    console.log("data", data);

    try {
      const response = await fetch(`${ip}/register`, {
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
  "user/showUser",
  async (_, thunkAPI) => {
    try {
      const response = await fetch(
        `${ip}/get-all-users?enabled=true&role=USER&pageNumber=0&pageSize=30`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const errorData = await response.json();
        return thunkAPI.rejectWithValue(errorData);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: error.message || "Unexpected error" });
    }
  }
);

//delete action
export const deleteUser = createAsyncThunk(
  "deleteUser",
  async (id, { rejectWithValue }) => {
    const response = await fetch(`${ip}/delete/${id}`, {
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
// export const updateUser = createAsyncThunk(
//   "updateUser",
//   async (data, { rejectWithValue }) => {
//     console.log("updated data", data);
//     const response = await fetch(`${ip}/update/${data.id}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(data),
//     });

//     try {
//       const result = await response.json();
//       return result;
//     } catch (error) {
//       return rejectWithValue(error);
//     }
//   }
// );

export const updateUser = createAsyncThunk(
  "updateUser",
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/update/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      return rejectWithValue({ message: err.message });
    }
  }
);

//update action
export const fetchUserById = createAsyncThunk(
  "fetchUserById",
  async (id, { rejectWithValue }) => {
    const response = await fetch(`${ip}/get-users/${id}`, {
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
    const response = await fetch(`${ip}/get-profile/${arg.email}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
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
      `${ip}/auth/verify-account?email=${data.email}&otp=${data.otp}`,
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
      `${ip}/auth/regenerate-otp?email=${data.email}`,
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
export const forgotPassword = createAsyncThunk("forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${ip}/auth/forgot-password?email=${email}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        // If the response has a meaningful message, return that
        return rejectWithValue(result.message || "Failed to send reset link.");
      }

      return result;
    } catch (error) {
      return rejectWithValue(error.message || "Network error.");
    }
  }
);

//set-password action
export const resetPassword = createAsyncThunk(
  "resetPassword",
  async (data, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${ip}/auth/set-password?email=${data.email}&newPassword=${data.newPassword}`,
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

//block status
export const showBlockStatus = createAsyncThunk('showBlockStatus', async ( data, { rejectWithValue }) => {
  console.log(data)
  let response
  response = await fetch(`${ip}/auth/${data.email}/block-status`, {
    method: 'GET',
    // headers: {
    //   Authorization: `Bearer ${token}`,
    // },
  })

  try {
    const result = await response.json()
    console.log(result)
    return result
  } catch (error) {
    return rejectWithValue(error)
  }
})

export const userDetail = createSlice({
  name: "app",
  initialState: {
    users: [],
    loading: false,
    error: null,
    user: "",
    searchData: [],
    data:null,
    message: null,
    currentUser: null,
  },

  reducers: {
   
    setUsers: (state, action) => {
      state.users = action.payload.content;
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
        state.users = action.payload.content;
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
        state.error = null;
        state.success = false;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.success = true;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Something went wrong";
        state.success = false;
      })
      .addCase(getProf.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProf.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        if (action.payload) {
          console.log(action.payload)
          localStorage.setItem("myInfo", JSON.stringify(action.payload));
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
      })
      .addCase(showBlockStatus.pending, (state) => {
        state.loading = true
      })
      .addCase(showBlockStatus.fulfilled, (state, action) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(showBlockStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      });
  },
});

export default userDetail.reducer;

export const { setUsers } = userDetail.actions;
