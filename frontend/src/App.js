import React, { useEffect, useState } from "react";
// import React, { useEffect } from "react";
// import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Homepage from "./components/Homepage";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Planer from "./components/Planer";
import Listtogo from "./components/Listtogo";
import Searchresult from "./components/Searchresult";
import Aboutme from "./components/Aboutme";
import { getUserLocation } from "./components/getGeo";
import ProtectedLogin from "./components/ProtectedLogin";
import { AuthProvider } from "./context/Pathmanagement"; // นำเข้า AuthProvider
import "./App.css";

function App() {
  return (
    <AuthProvider> 
      <Router>
        <Content />
      </Router>
    </AuthProvider>
  );
}

function Content() {
  const location = useLocation();
  const showNavbar = ["/profile", "/searchresult", "/listtogo", "/planer"].includes(location.pathname);
  // const [userLocation, setUserLocation] = useState({ lat: null, lng: null });


 // เช็คว่ามี `auth_token` ใน LocalStorage หรือไม่
  // useEffect(() => {
  //   const token = localStorage.getItem("auth_token");
  //   console.log("🔍 Checking auth_token in LocalStorage:", token);

  //   if (!token) {
  //     console.warn("⚠ ไม่มี Token ใน LocalStorage, กรุณาล็อกอินใหม่");
  //   }
  // }, []);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* <Route path="/" element={<Homepage userLocation={userLocation} />} /> */}
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<ProtectedLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/listtogo" element={<Listtogo />} />
        <Route path="/searchresult" element={<Searchresult />} />
        <Route path="/planer" element={<Planer />} />
        <Route path="/aboutme" element={<Aboutme />} />
      </Routes>
    </>
  );
}

export default App;
