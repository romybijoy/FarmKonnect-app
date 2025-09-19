import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { appConfig } from "../../config";
import { fetchWithAuth } from "../../service/FetchService";

const token = localStorage.getItem("token");

const ip = `${appConfig.ip}/api`;

const userData = JSON.parse(localStorage.getItem("myInfo"));

export const createPost = createAsyncThunk(
  "createPost",
  async (data, { rejectWithValue, fulfillWithValue }) => {
    const input = {
      content: data.content,
      postImage: data.image, // this should be a Firebase URL string
      email: userData?.email,
    };

    try {
      const response = await fetchWithAuth(`${ip}/post/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        return rejectWithValue(response.status);
      }

      const result = await response.json();
      return fulfillWithValue(result);
    } catch (error) {
      console.error(error);
      return rejectWithValue(error);
    }
  }
);

//read action
export const showPost = createAsyncThunk(
  "showPost",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${ip}/post/get`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const showFeed = createAsyncThunk(
  "showFeed",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchWithAuth(`${ip}/feed/${userData?.id}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData);
      }

      const result = await response.json();
      console.log(result);
      return result;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const likePost = createAsyncThunk(
  "posts/likePost",
  async ({ postId }, { getState }) => {
    const userId = JSON.parse(localStorage.getItem("myInfo")).id;
    const state = getState().post;
    const isLiked = state.likesByPostId[postId]?.liked || false;

    if (isLiked) {
      await fetchWithAuth(`${ip}/post/${postId}/like?userId=${userId}`, {
        method: "DELETE",
      });
    } else {
      await fetchWithAuth(`${ip}/post/${postId}/like?userId=${userId}`, {
        method: "POST",
      });
    }

    const likeCountRes = await fetchWithAuth(`${ip}/post/${postId}/like-count`);
    const likeCount = await likeCountRes.json();

    const statusRes = await fetchWithAuth(
      `${ip}/post/${postId}/like-status?userId=${userId}`
    );
    const liked = await statusRes.json();

    return { postId, liked, likeCount };
  }
);

export const unlikePost = createAsyncThunk(
  "posts/likePost",
  async (postId, thunkAPI) => {
    try {
      const response = await fetchWithAuth(
        `${ip}/${postId}/like?userId=${userData.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to unlike post");
      const data = await response.json(); // { liked, likeCount }

      return { postId, ...data };
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// ✅ Fetch like count for a post
export const fetchLikeCount = createAsyncThunk(
  "posts/fetchLikeCount",
  async (postId, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/post/${postId}/like-count`);
      if (!res.ok) {
        throw new Error("Failed to fetch like count");
      }
      const data = await res.json(); // { count: 42 }
      return { postId, likeCount: data.count };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// ✅ Fetch like status for a user + post
export const fetchLikeStatus = createAsyncThunk(
  "posts/fetchLikeStatus",
  async ({ postId, userId }, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(
        `${ip}/post/${postId}/like-status?userId=${userId}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch like status");
      }
      const data = await res.json(); // { liked: true }
      return { postId, liked: data.liked };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// export const toggleSavePost = createAsyncThunk(
//   "posts/savePost",
//   async ({ postId, userId }, { rejectWithValue }) => {
//     try {
//       const res = await fetchWithAuth(`${ip}/feed/save/${postId}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//           userId: userId,
//         },
//       });

//       if (!res.ok) {
//         const errorText = await res.text();
//         return rejectWithValue(errorText || "Failed to save post");
//       }

//       const data = await res.json();
//       return { postId, saved: data.saved };
//     } catch (error) {
//       return rejectWithValue(error.message || "Save post failed");
//     }
//   }
// );

export const toggleSavePost = createAsyncThunk(
  "posts/toggleSavePost",
  async ({ postId, userId }, { getState }) => {
    const state = getState().post;
    const isSaved = state.savedByPostId[postId].saved || false;

    if (isSaved) {
      await fetchWithAuth(`${ip}/post/${postId}/save?userId=${userId}`, {
        method: "DELETE",
      });
    } else {
      await fetchWithAuth(`${ip}/post/${postId}/save?userId=${userId}`, {
        method: "POST",
      });
    }

    const saveCountRes = await fetchWithAuth(`${ip}/post/${postId}/save-count`);
    const saveCount = await saveCountRes.json();

    const statusRes = await fetchWithAuth(
      `${ip}/post/${postId}/save-status?userId=${userId}`
    );
    const saved = await statusRes.json();

    return { postId, saved, count };
  }
);

export const getSavedPosts = createAsyncThunk(
  "posts/getSavedPosts",
  async ({ userId }, { rejectWithValue }) => {
    try {
      const res = await fetchWithAuth(`${ip}/post/saved/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const error = await res.text();
        return rejectWithValue(error || "Failed to fetch saved posts");
      }

      const posts = await res.json();
      return posts; // this will be a list of Post objects
    } catch (error) {
      return rejectWithValue(error.message || "Fetch failed");
    }
  }
);

// fetch save status
export const fetchSaveStatus = createAsyncThunk(
  "posts/fetchSaveStatus",
  async ({ postId, userId }) => {
    const res = await fetchWithAuth(
      `${ip}/post/${postId}/save-status?userId=${userId}`
    );
    const saved = await res.json();
    return { postId, saved };
  }
);

// fetch save count
export const fetchSaveCount = createAsyncThunk(
  "posts/fetchSaveCount",
  async (postId) => {
    const res = await fetchWithAuth(`${ip}/post/${postId}/save-count`);
    const count = await res.json();
    return { postId, count };
  }
);

export const repostPost = createAsyncThunk(
  "posts/repostPost",
  async ({ originalPostId, userId }) => {
    const res = await fetchWithAuth(`${ip}/feed/repost/${originalPostId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        userId, // Assuming you're sending this in header
      },
      body: JSON.stringify({ originalPostId }),
    });
    if (!res.ok) throw new Error("Failed to repost");
    const data = await res.json(); // { newPostId: "..."}
    return data;
  }
);
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

//update action
export const fetchPostById = createAsyncThunk(
  "fetchPostById",
  async (id, { rejectWithValue }) => {
    const response = await fetch(`${appConfig.ip}/post/${id}`, {
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
    count: 0,
    likesByPostId: {}, // postId: { liked: boolean, likeCount: number }
    savedByPostId: {},
    saveCountsByPostId: {},
    savedPosts: [],
    savedPostsLoading: false,
    savedPostsError: null,
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
      .addCase(showPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(showPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(showPost.rejected, (state, action) => {
        state.loading = false;
        state.posts = [];
        state.error = action.payload.message;
      })
      .addCase(showFeed.pending, (state) => {
        state.loading = true;
      })
      .addCase(showFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(showFeed.rejected, (state, action) => {
        state.loading = false;
        state.posts = [];
        state.error = action.payload.message;
      })

      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, liked, likeCount } = action.payload;
        state.likesByPostId[postId] = {
          liked: liked.liked,
          likeCount: likeCount.count,
        };
      })

      .addCase(likePost.rejected, (state, action) => {
        console.error("Failed to like post:", action.error);
      })
      .addCase(fetchLikeCount.fulfilled, (state, action) => {
        const { postId, likeCount } = action.payload;
        state.likesByPostId[postId] = {
          ...(state.likesByPostId[postId] || {}),
          likeCount,
        };
      })
      .addCase(fetchLikeStatus.fulfilled, (state, action) => {
        const { postId, liked } = action.payload;
        state.likesByPostId[postId] = {
          ...(state.likesByPostId[postId] || {}),
          liked: liked,
        };
      })
      // SAVE
      .addCase(toggleSavePost.fulfilled, (state, action) => {
        const { postId, saved, saveCount } = action.payload;
        
         state.savedByPostId[postId] = {
          saved,
          count,
        };
        
      })
      .addCase(getSavedPosts.pending, (state) => {
        state.savedPostsLoading = true;
        state.savedPostsError = null;
      })
      .addCase(getSavedPosts.fulfilled, (state, action) => {
        console.log(action.payload);
        state.savedPosts = action.payload;
        state.savedPostsLoading = false;
      })
      .addCase(getSavedPosts.rejected, (state, action) => {
        state.savedPostsError = action.payload;
        state.savedPostsLoading = false;
      })
      .addCase(fetchSaveStatus.fulfilled, (state, action) => {
        const { postId, saved } = action.payload;
        state.savedByPostId[postId] = saved;
         state.savedByPostId[postId] = {
          ...(state.savedByPostId[postId] || {}),
          saved,
        };
      })
      .addCase(fetchSaveCount.fulfilled, (state, action) => {
        const { postId, count } = action.payload;
         state.savedByPostId[postId] = {
          ...(state.savedByPostId[postId] || {}),
          count,
        };
      })
      .addCase(repostPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(repostPost.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally show a message or refetch posts
      })
      .addCase(repostPost.rejected, (state, action) => {
        state.loading = false;
        console.error("Repost error:", action.error.message);
      })

      .addCase(fetchPostById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.loading = false;
        state.post = action.payload.post;
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      });
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

export const {} = postDetail.actions;
