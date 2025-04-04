import React, { createContext, useState } from "react";
import api from "./api";

export const authService = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const registerUser = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.error || "Error en el registro");
    }
  };

  const loginUser = async (email, password) => {
    try {
      const response = await api.post("/auth/login", { email, password });

      if (response.data.mfaRequired) {
        // Guardar el token temporal para la verificación MFA
        return {
          mfaRequired: true,
          tempToken: response.data.tempToken,
          email: email, // Guardar email para mostrar en el paso MFA
        };
      }

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
      return { token, user };
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Error en el inicio de sesión"
      );
    }
  };

  const verifyMFA = async (tempToken, mfaToken) => {
    try {
      const response = await api.post("/auth/verify-mfa", {
        tempToken,
        mfaToken,
      });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setUser(user);
      return { token, user };
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Error verificando código MFA"
      );
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    setUser(null);
    setSelectedTask(null);
  };

  const forgotPassword = async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Error al solicitar restablecimiento"
      );
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await api.post("/auth/reset-password", {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.error || "Error al restablecer contraseña"
      );
    }
  };

  return (
    <authService.Provider
      value={{
        user,
        registerUser,
        loginUser,
        logoutUser,
        verifyMFA,
        forgotPassword,
        resetPassword,
        selectedTask,
        setSelectedTask,
      }}
    >
      {children}
    </authService.Provider>
  );
};
