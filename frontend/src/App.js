import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Homepage from "./components/Homepage";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Listtogo from "./components/Listtogo";
import Searchresult from "./components/Searchresult";
import Placereview from "./components/Placereview";
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
  
  // ตรวจสอบเส้นทางว่าเป็น /placereview/ กับ place_id หรือไม่
  const showNavbar = [
    "/profile", 
    "/searchresult", 
    "/listtogo", 
    "/placereview", // แก้ไขเป็นเพียง /placereview
  ].some(path => location.pathname.startsWith(path));  // ใช้ startsWith เพื่อจับเส้นทาง dynamic
  // const [userLocation, setUserLocation] = useState({ lat: null, lng: null });

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<ProtectedLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/listtogo" element={<Listtogo />} />
        <Route path="/searchresult" element={<Searchresult />} />
        <Route path="/placereview/:place_id" element={<Placereview />} />
      </Routes>
    </>
  );
}

export default App;
