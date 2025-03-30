import React, { useEffect, useState } from "react";
// import React, { useEffect } from "react";
// import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Homepage from "./components/Homepage";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Planner from "./components/Planner";
import DeletedPlans from './components/DeletedPlans';
import PlanDetails from './components/PlanDetails';
import CreatePlan from './components/CreatePlan';
import Listtogo from "./components/Listtogo";
import Searchresult from "./components/Searchresult";
import SearchPlace from "./components/SearchPlace";
import Aboutme from "./components/Aboutme";
import SelectListToGo from "./components/SelectListToGo";
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
  // const showNavbar = ["/profile", "/searchresult", "/listtogo", "/planner", "/create-plan", "/plan-details/", "/search-place"].includes(location.pathname);
  // const showNavbar = location.pathname.includes("/plan-details");
  // const [userLocation, setUserLocation] = useState({ lat: null, lng: null });
  const showNavbar = ["/profile", "/searchresult", "/listtogo", "/planner", "/create-plan", "/plan-details/", "/search-place", "/deleted-plans", "/select-listtogo"].includes(location.pathname);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });

  console.log("Current Path:", location.pathname);  // ตรวจสอบเส้นทางที่กำลังใช้อยู่

  useEffect(() => {
    // เรียกใช้ getUserLocation เพื่อเริ่มการดึงข้อมูลและอัปเดตทุกๆ 5 วินาที
    const stopUpdatingLocation = getUserLocation(setUserLocation);

    // ทำความสะอาดเมื่อ component ถูกลบออกจากหน้าจอ
    return () => {
      stopUpdatingLocation(); // หยุดการอัปเดตเมื่อ component หายไป
    };
  }, []);


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
        <Route path="/planner" element={<Planner />} />
        <Route path="/deleted-plans" element={<DeletedPlans />} />
        <Route path="/plan-details/:planId" element={<PlanDetails />} />
        <Route path="/create-plan" element={<CreatePlan />} />
        <Route path="/search-place" element={<SearchPlace />} />
        <Route path="/aboutme" element={<Aboutme />} />
        <Route path="/select-listtogo" element={<SelectListToGo />} />
      </Routes>
    </>
  );
}

export default App;
