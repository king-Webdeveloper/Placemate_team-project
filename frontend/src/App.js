import React, { useEffect, useState } from "react";
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
import "./App.css";

function App() {
  return (
    <Router>
      <Content />
    </Router>
  );
}

function Content() {
  const location = useLocation();
  // const showNavbar = ["/profile", "/listtogo", "/searchresult", "/planer", "/aboutme"].includes(location.pathname);
  const showNavbar = ["/profile", "/searchresult", "/listtogo", "/planer", "/aboutme"].includes(location.pathname);
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
        <Route path="/planer" element={<Planer />} />
        <Route path="/aboutme" element={<Aboutme />} />
      </Routes>
    </>
  );

  function ProtectedLogin() {
    const token = localStorage.getItem("token");
    return token ? <Navigate to="/" replace /> : <Login />;
  }
}

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> b918d72d863dadaacff7576365a73ad5102e98aa
