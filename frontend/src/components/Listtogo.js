import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Listtogo.css";

const ListToGo = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [places, setPlaces] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);

  const fetchData = async (url, method) => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error("Access denied");
      return await response.json();
    } catch (error) {
      console.error("Error:", error);
      return null;
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    setSearched(true);
    const data = await fetchData(`http://localhost:5000/api/list-to-go/places?query=${encodeURIComponent(searchTerm)}`, "GET");
    // const data = await fetchData(`${process.env.REACT_APP_API_URL}:5000/api/list-to-go/places?query=${encodeURIComponent(searchTerm)}`, "GET");
    if (data) setSearchResults(data);
  };

  const handleDelete = async (id) => {
    const success = await fetchData("http://localhost:5000/api/list-to-go/remove", "DELETE");
    // const success = await fetchData(`${process.env.REACT_APP_API_URL}:5000/api/list-to-go/remove`, "DELETE");
    if (success) setPlaces(places.filter((place) => place.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="container mx-auto px-4 py-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">LIST TO GO</h1>
        <div className="listtogo-search-bar">
          <input
            type="text"
            className="listtogo-search-input"
            placeholder="ค้นหา"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch} className="listtogo-search-button">
            ค้นหา
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListToGo;
