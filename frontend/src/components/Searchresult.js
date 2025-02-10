import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Searchresult.css";

const Searchresult = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [places, setPlaces] = useState([]); // รายการที่บันทึกไว้
  const [searchResults, setSearchResults] = useState([]); // ผลลัพธ์การค้นหา
  const [searched, setSearched] = useState(false); // เช็คว่ามีการกดค้นหาหรือยัง
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const handleSearch = async () => {
    if (searchTerm.trim() === "") return;
    setSearched(true); // ระบุว่ามีการค้นหาแล้ว

    try {
      const response = await fetch(`http://localhost:5000/api/search/places?query=${encodeURIComponent(searchTerm)}`, { 
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to search places");

      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching places:", error);
    }
  };

  const handleAddPlace = async (place) => {
    try {
      const response = await fetch("http://localhost:5000/api/search/addtolisttogo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: place.name }),
      });

      if (!response.ok) throw new Error("Failed to add place");

      const newPlace = await response.json();
      setPlaces([...places, newPlace]); // อัปเดตรายการสถานที่ที่บันทึกไว้
    } catch (error) {
      console.error("Error adding place:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="container mx-auto px-4 py-8 w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">ผลการค้นหา</h1>

        {/* Search Bar */}
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

        {/* Search Results */}
        {searched && searchResults.length === 0 && (
          <p className="text-center text-gray-500 mt-4">ไม่พบผลลัพธ์ที่ตรงกัน</p>
        )}

        {searchResults.length > 0 && (
          <div className="mt-4 w-full">
            <h2 className="text-lg font-semibold">ผลลัพธ์การค้นหา</h2>
            <ul className="listtogo-resultbox">
              {searchResults.map((place) => (
                <li key={place.id} className="result-listtogo">
                  <span>{place.name}</span>
                  <button 
                    onClick={() => handleAddPlace(place)} 
                    className="bg-blue-500 text-white px-2 py-1 rounded-lg"
                  >
                    ➕ เพิ่มไปยัง List to go
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Searchresult;


