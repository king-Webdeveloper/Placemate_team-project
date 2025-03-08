import React, { createContext, useState, useContext } from "react";

// สร้าง Context
const AuthContext = createContext();

// สร้าง Provider สำหรับใช้ในแอป
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, username, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook สำหรับการเข้าถึงข้อมูลจาก Context
export const useAuth = () => {
  return useContext(AuthContext);
};
