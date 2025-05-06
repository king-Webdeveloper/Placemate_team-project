// App.js [frontend]
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
import EditPlan from "./components/EditPlan";
import DeletedPlans from './components/DeletedPlans';
import PlanDetails from './components/PlanDetails';
import CreatePlan from './components/createPlan';
import Listtogo from "./components/Listtogo";
import Searchresult from "./components/Searchresult";
import Placereview from "./components/Placereview";
import SearchPlace from "./components/SearchPlace";
import Aboutme from "./components/Aboutme";
import SelectListToGo from "./components/SelectListToGo";
import { getUserLocation } from "./components/getGeo";
import ProtectedLogin from "./components/ProtectedLogin";
import { AuthProvider } from "./context/Pathmanagement"; 
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
  const showNavbar = [
    "/profile",
    "/searchresult",
    "/listtogo",
    "/planner",
    "/create-plan",
    "/plan-details/",
    "/search-place",
    "/deleted-plans",
    "/select-listtogo",
    "/edit-plan"
  ].includes(location.pathname) || location.pathname.startsWith("/placereview/");

  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });

  useEffect(() => {
    // เรียกใช้ getUserLocation เพื่อเริ่มการดึงข้อมูลและอัปเดตทุกๆ 5 วินาที
    const stopUpdatingLocation = getUserLocation(setUserLocation);

    // ทำความสะอาดเมื่อ component ถูกลบออกจากหน้าจอ
    return () => {
      stopUpdatingLocation(); // หยุดการอัปเดตเมื่อ component หายไป
    };
  }, []);

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
        <Route path="/placereview/:place_id" element={<Placereview />} />
        <Route path="/planner" element={<Planner />} />
        <Route path="/deleted-plans" element={<DeletedPlans />} />
        <Route path="/plan-details/:planId" element={<PlanDetails />} />
        <Route path="/create-plan" element={<CreatePlan />} />
        <Route path="/search-place" element={<SearchPlace />} />
        <Route path="/aboutme" element={<Aboutme />} />
        <Route path="/select-listtogo" element={<SelectListToGo />} />
        <Route path="/edit-plan/:planId" element={<EditPlan />} />
      </Routes>
    </>
  );
}

export default App;
