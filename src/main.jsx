import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import "bootstrap/dist/css/bootstrap.min.css";
import '@fortawesome/fontawesome-free/css/all.min.css';

import "./index.css";
import store from "./redux/store";
import { AuthContextProvider } from "./context/AuthContext";

const App = React.lazy(() => import("./App"));

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </Provider>
);
