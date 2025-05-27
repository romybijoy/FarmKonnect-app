import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { appConfig } from "../../config";

const baseQuery = fetchBaseQuery({ baseUrl: appConfig.ip });

export const ApiSlice = createApi({
  baseQuery,
  tagTypes: ["User", "Product", "Cart", "Order", "Review"],
  endpoints: (builder) => ({
    
  }),
});
