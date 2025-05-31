import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appConfig } from "../../config";

const token = localStorage.getItem("token");

export const createPost = createAsyncThunk(
  "createPost",
  async (data, { rejectWithValue, fulfillWithValue, dispatch }) => {
    console.log("data", data);

    try {
      const response = await fetch(`${appConfig.ip}/post`, {
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
      dispatch(showPost({ page: 0, pageSize: 5 }));
      return fulfillWithValue(result);
    } catch (error) {
      console.log(error);
      return rejectWithValue(error);
    }
  }
);


//read action
// export const showPost = createAsyncThunk(
//   "showPost",
//   async (data, { rejectWithValue }) => {
//     console.log(data);
//     let response;
//     try{
//       response = await fetch(
//           `${appConfig.ip}/post?pageNumber=${data.page}&pageSize=${data.pageSize}`,
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${token}`,
//             },
//           }
//         )
//         if (response.status !== 302) {
//           return rejectWithValue(response.json());
//         }
  
    
//       const result = await response.json();
//       // console.log(result);
//       return result;
//     } catch (error) {
//       return rejectWithValue(error);
//     }
//   }
// );

// export const showPostByKeyword = createAsyncThunk('showPostByKeyword', async (data, { rejectWithValue }) => {
//   console.log(data.page)
//   try{
//   let response
//  response = await fetch(
//         `${appConfig.ip}/post/keyword/${data.keyword}?pageNumber=${data.page}&pageSize=5`,
//         {
//           method: 'GET',
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         },
//       )

//       if ( response.status !== 302) {
//         return rejectWithValue(response.json());
//       }
//     const result = await response.json()
//     console.log(result)
//     return result
//   } catch (error) {
//     return rejectWithValue(error)
//   }
// })


// //update action
// export const fetchPostById = createAsyncThunk(
//   "fetchPostById",
//   async (id, { rejectWithValue }) => {
//     const response = await fetch(`${appConfig.ip}/post/${id}`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     try {
//       const result = await response.json();
//       console.log(result);
//       return result;
//     } catch (error) {
//       return rejectWithValue(error);
//     }
//   }
// );

// //delete action
// export const deletePost = createAsyncThunk(
//   "deletePost",
//   async (id, { rejectWithValue, dispatch }) => {
//     const response = await fetch(`${appConfig.ip}/post/${id}`, {
//       method: "DELETE",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//     });

//     try {
//       const result = await response.json();
//       console.log(result);
//       dispatch(showPost({ page: 0, pageSize: 5 }));
//       dispatch(showPostByKeyword());
//       return result;
//     } catch (error) {
//       return rejectWithValue(error);
//     }
//   }
// );

// //update action
// export const updatePost = createAsyncThunk(
//   "updatePost",
//   async (data, { rejectWithValue, dispatch }) => {
//     console.log("updated data", data);
//     const response = await fetch(`${appConfig.ip}/post/${data.postId}`, {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(data),
//     });

//     try {
//       const result = await response.json();
//       dispatch(showPost());
//       return result;
//     } catch (error) {
//       return rejectWithValue(error);
//     }
//   }
// );

export const postDetail = createSlice({
  name: "post",
  initialState: {
    posts: [],
    loading: false,
    error: null,
    searchData: [],
    count:0
  },

  reducers: {
    searchUser: (state, action) => {
      console.log(action.payload);
      state.searchData = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      
    .addCase(createPost.pending, (state) => {
      state.loading = true;
    })
    .addCase(createPost.fulfilled, (state, action) => {
      state.loading = false;
      // state.categories.push(action.payload);
    })
    .addCase(createPost.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    })
    //   .addCase(showPost.pending, (state) => {
    //     state.loading = true;
    //   })
    //   .addCase(showPost.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.categories = action.payload.content;
    //     state.count = action.payload.totalElements;
    //   })
    //   .addCase(showPost.rejected, (state, action) => {
    //     state.loading = false;
    //     state.categories = [];
    //     state.error = action.payload.message;
    //   })
    //   .addCase(showPostByKeyword.pending, (state) => {
    //     state.loading = true;
    //   })
    //   .addCase(showPostByKeyword.fulfilled, (state, action) => {
    //     state.loading = false;
    //     state.categories = action.payload.content;
    //     state.count = action.payload.totalElements;
    //   })
    //   .addCase(showPostByKeyword.rejected, (state, action) => {
    //     state.loading = false;
    //     state.categories = [];
    //     state.error = action.payload;
    //   })
    // .addCase(fetchPostById.pending, (state) => {
    //   state.loading = true;
    // })
    // .addCase(fetchPostById.fulfilled, (state, action) => {
    //   state.loading = false;
    //   state.post = action.payload.post;
    // })
    // .addCase(fetchPostById.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload.message;
    // })
    // .addCase(deletePost.pending, (state) => {
    //   state.loading = true;
    // })
    // .addCase(deletePost.fulfilled, (state, action) => {
    //   state.loading = false;
    // })
    // .addCase(deletePost.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload;
    // })

    // .addCase(updatePost.pending, (state) => {
    //   state.loading = true;
    // })
    // .addCase(updatePost.fulfilled, (state, action) => {
    //   state.loading = false;
    //   state.message = action.payload.message;
    //   // state.categories = state.categories.map((ele) =>
    //   //   ele.id == action.payload.id ? action.payload : ele
    //   // );
    // })
    // .addCase(updatePost.rejected, (state, action) => {
    //   state.loading = false;
    //   state.error = action.payload.message;
    // })
  },
});

export default postDetail.reducer;

export const {  } = postDetail.actions;
