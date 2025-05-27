import { ApiSlice } from "./ApiSlice";

export const UsersApiSlice = ApiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (data) => ({
        url: "/auth/login",
        method: "POST",
        body: data,
      }),
    }),
    getprof: builder.mutation({
      query: (token) => ({
        url: "/adminuser/get-profile",
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      }),
    }),
    // register: builder.mutation({
    //   query: (data) => ({
    //     url: `${USERS_URL}`,
    //     method: 'POST',
    //     body: data,
    //   }),
    // }),
    // updateUser: builder.mutation({
    //   query: (data) => ({
    //     url: `${USERS_URL}/profile`,
    //     method: 'PUT',
    //     body: data,
    //   }),
    // }),
  }),
});

export const {
  useLoginMutation,
  useGetprofMutation,
  // useLogoutMutation,
  // useRegisterMutation,
  // useUpdateUserMutation,
} = UsersApiSlice;
