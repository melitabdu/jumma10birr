 import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

/*import {
  loginAPI,
  registerAPI,
} from "../services/authService";*/

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);

  const [token, setToken] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    loadUser();

  }, []);

  const loadUser = async () => {

    try {

      const savedUser = await AsyncStorage.getItem("user");

      const savedToken = await AsyncStorage.getItem("token");

      if (savedUser && savedToken) {

        setUser(JSON.parse(savedUser));

        setToken(savedToken);

      }

    } catch (error) {

      console.log(error);

    }

    setLoading(false);

  };

  const loginUser = async (phone, password) => {

    const data = await loginAPI(phone, password);

    await AsyncStorage.setItem(
      "user",
      JSON.stringify(data)
    );

    await AsyncStorage.setItem(
      "token",
      data.token
    );

    setUser(data);

    setToken(data.token);

    return data;

  };

  const registerUser = async (

    fullName,

    phone,

    password

  ) => {

    const data = await registerAPI(

      fullName,

      phone,

      password

    );

    await AsyncStorage.setItem(
      "user",
      JSON.stringify(data)
    );

    await AsyncStorage.setItem(
      "token",
      data.token
    );

    setUser(data);

    setToken(data.token);

    return data;

  };

  const logoutUser = async () => {

    await AsyncStorage.removeItem("user");

    await AsyncStorage.removeItem("token");

    setUser(null);

    setToken(null);

  };

  return (

    <AuthContext.Provider

      value={{

        user,

        token,

        loading,

        loginUser,

        registerUser,

        logoutUser,

        isAuthenticated: !!token,

      }}

    >

      {children}

    </AuthContext.Provider>

  );

};

export const useAuth = () => useContext(AuthContext);