import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { appConfig } from "../../config";

import { logout } from "./AuthSlice";

const baseQuery = fetchBaseQuery({ baseUrl: appConfig.ip,
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');  // or 'accessToken' if you update it
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
 });

 const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);
  if (result?.error?.status === 401) {
    api.dispatch(logout());
  }
  return result;
};

export const ApiSlice = createApi({
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User", "Post"],
  endpoints: (builder) => ({
    
  }),
});

