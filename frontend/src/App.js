import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Homepage from "./components/Homepage";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import Planer from "./components/Planer";
import Listtogo from "./components/Listtogo";
import Searchresult from "./components/Searchresult";
import Aboutme from "./components/Aboutme";
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
  const showNavbar = ["/profile", "/listtogo", "/searchresult", "/planer", "/aboutme"].includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Homepage /> } />
        <Route path="/login" element={<Login />} />
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