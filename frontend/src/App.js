import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Homepage from "./components/Homepage";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Listtogo from "./components/Listtogo";
import Searchresult from "./components/Searchresult";
import { getUserLocation } from "./components/getGeo";
import "./App.css";
import ProtectedLogin from "./components/ProtectedLogin";

function App() {
  return (
    <Router>
      <Content />
    </Router>
  );
}

function Content() {
  const location = useLocation();
  const showNavbar = ["/profile", "/searchresult", "/listtogo"].includes(location.pathname);
  const [userLocation, setUserLocation] = useState({ lat: null, lng: null });

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Homepage userLocation={userLocation} />} />
        <Route path="/login" element={<ProtectedLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/listtogo" element={<Listtogo />} />
        <Route path="/searchresult" element={<Searchresult />} />
      </Routes>
    </>
  );

  
}

export default App;
