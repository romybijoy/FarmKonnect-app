import React from "react";
import { toast } from "react-toastify";
import { useContext, createContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  FacebookAuthProvider,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { useSelector, useDispatch } from "react-redux";
import { useSocialLoginMutation } from "../redux/slices/UsersApiSlice"; // adjust path
import { setCredentials } from "../redux/slices/AuthSlice";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [pending, setPending] = useState(false);
  const [socialLogin, { isLoading: socialLoading }] = useSocialLoginMutation();
  const dbUser = useSelector((state) => state.auth.userInfo);
  // const [dbUser, setDbUser] = useState("user");
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

 const googleSignIn = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    if (!firebaseUser) {
      return { success: false, error: "Google login failed. Try again." };
    }

    const backendUser = await socialLogin({
      provider: "GOOGLE",
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      avatar: firebaseUser.photoURL,
      providerUserId: firebaseUser.uid,
    }).unwrap();

    dispatch(setCredentials(backendUser));
    return { success: true };
  } catch (err) {
    // 1️⃣ Popup errors
    if (err?.code === "auth/popup-closed-by-user") {
      return { success: false, error: "You closed the popup." };
    }
    if (err?.code === "auth/popup-blocked") {
      return { success: false, error: "Popup was blocked by browser." };
    }

    // 2️⃣ Backend errors (important!)
    if (err?.status === 403) {
      return { success: false, error: err.data?.blockReason || "Account blocked" };
    }

    return { success: false, error: err.data?.message || "Google sign-in failed" };
  }
};

const facebookSignIn = async () => {
  if (pending) return { success: false };
  setPending(true);

  const provider = new FacebookAuthProvider();
  provider.addScope("email");

  try {
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    if (!firebaseUser) {
      return { success: false, error: "Facebook login failed. Try again." };
    }

    const backendUser = await socialLogin({
      provider: "FACEBOOK",
      email: firebaseUser.email,
      name: firebaseUser.displayName,
      avatar: firebaseUser.photoURL,
      providerUserId: firebaseUser.uid,
    }).unwrap();

    dispatch(setCredentials(backendUser));
    return { success: true };
  } catch (err) {
    if (err?.code === "auth/popup-closed-by-user") {
      return { success: false, error: "You closed the popup." };
    }
    if (err?.code === "auth/popup-blocked") {
      return { success: false, error: "Popup blocked by browser." };
    }

    if (err?.status === 403) {
      return { success: false, error: err.data?.blockReason || "Account blocked" };
    }

    return { success: false, error: err.data?.message || "Facebook login failed" };
  } finally {
    setPending(false);
  }
};




  const logOut = () => {
    signOut(auth);
  };

  useEffect(() => {
    // if (dbUser != null) {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => {
      unsubscribe();
    };
    // }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        googleSignIn,
        logOut,
        user,
        // dbUserSignIn,
        dbUser,
        facebookSignIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
