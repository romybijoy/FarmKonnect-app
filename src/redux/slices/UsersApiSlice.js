import { ApiSlice } from "./ApiSlice";

export const UsersApiSlice = ApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: "/user/auth/login",
        method: "POST",
        body: data,
      }),
    }),
    getprof: builder.mutation({
      query: (token) => ({
        url: "/user/auth/get-profile",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
    }),

      socialLogin: builder.mutation({
      query: (data) => ({
        url: "/user/auth/social-login",
        method: "POST",
        body: data,
      }),
    }),
    
  }),
});

export const {
  useLoginMutation,
  useGetprofMutation,
   useSocialLoginMutation,
} = UsersApiSlice;
