import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./components/Homepage";
import Login from "./components/Login";
import Register from "./components/Register";
import Profile from "./components/Profile";
import ListToGo from "./components/Listtogo";
import "./App.css";

function App() {
  return (
    <Router> {/* Wrap everything inside <Router> */}
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/listtogo" element={<ListToGo />} />
      </Routes>
    </Router>
  );
}

export default App;
