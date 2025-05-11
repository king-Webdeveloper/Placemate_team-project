// Aboutme.js [frontend]
import React from 'react';
import './Aboutme.css';

const Aboutme = () => {
  const profiles = [
    {
      name: "Atiwat Nakkum",
      email: "maxsy2018@gmail.com",
      university: "King Mongkut's University of Technology Thonburi",
      age: 22,
      image: "/Atiwat.png",
      role: "Full Stack Developer, UX/UI design, Github, Figma, and Webflow"
    },
    {
      name: "Pongsakorn Srimang",
      email: "thonkrath@gmail.com",
      university: "King Mongkut's University of Technology Thonburi",
      age: 23,
      image: "/Pongsakorn.png",
      role: "Full Stack Developer, Get data from Google map API, preprocess data, Tag classification with rulebased and Recommendation system"
    },
    {
      name: "Phranaikran Teeratummapanya",
      email: "newsweettime@gmail.com",
      university: "King Mongkut's University of Technology Thonburi",
      age: 23,
      image: "/Phranaikran.jpg",
      role: "Full Stack Developer, UX/UI design, Project Management"
    }
  ];

  return (
    <div className="aboutme-grid">
      {profiles.map((profile, index) => (
        <div className="aboutme-card" key={index}>
          <img src={profile.image} alt={profile.name} className="aboutme-img" />
          <h2 className="aboutme-name">{profile.name}</h2>
          <p className="aboutme-info"><strong>Email:</strong> {profile.email}</p>
          <p className="aboutme-info"><strong>University:</strong> {profile.university}</p>
          <p className="aboutme-info"><strong>Age:</strong> {profile.age}</p>
          <p className="aboutme-info"><strong>Role:</strong> {profile.role}</p>
        </div>
      ))}
    </div>
  );
};

export default Aboutme;
