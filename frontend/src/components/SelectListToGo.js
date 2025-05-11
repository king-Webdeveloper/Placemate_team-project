// SelectListToGo.js [frontend]
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './SelectListToGo.css';

const SelectListToGo = () => {
  const [listToGo, setListToGo] = useState([]);
  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const response = await fetch("http://localhost:5000/api/cookies-check", {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        navigate("/login");
      } else {
        const data = await response.json();
        setUserId(data.user_id);
      }
    };
    checkLoginStatus();
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      fetchListToGo(userId);
    }
  }, [userId]);

  const fetchListToGo = async (userId) => {
    const response = await fetch(`http://localhost:5000/api/list-to-go/user/${userId}`);
    const data = await response.json();

    if (Array.isArray(data)) {
      setListToGo(data);
    } else {
      console.error("Error: Data is not an array", data);
    }
  };

  const handleSelectPlace = (place) => {
    setSelectedPlaces((prevState) => {
      if (prevState.some(item => item.list_to_go_id === place.list_to_go_id)) {
        return prevState.filter(item => item.list_to_go_id !== place.list_to_go_id);
      }
      return [...prevState, place];
    });
  };

  const handleSubmit = () => {
    if (selectedPlaces.length > 0) {
      // ดึงของเก่าจาก localStorage
      const existingPlaces = JSON.parse(localStorage.getItem('selectedPlaces')) || [];

      // รวมกับใหม่และไม่ให้ซ้ำ (ตรวจจาก place_id)
      const merged = [
        ...existingPlaces,
        ...selectedPlaces.filter(newPlace =>
          !existingPlaces.some(old => old.place_id === newPlace.place_id)
        )
      ];

      localStorage.setItem('selectedPlaces', JSON.stringify(merged));
      navigate('/create-plan');
    } else {
      Swal.fire("กรุณาเลือกสถานที่ก่อนค่ะ", "", "warning");
    }
  };

  // const handleSubmit = () => {
  //   if (selectedPlaces.length > 0) {
  //     const selectedPlacesString = encodeURIComponent(JSON.stringify(selectedPlaces));
  //     navigate(`/create-plan?selectedPlaces=${selectedPlacesString}`);
  //   } else {
  //     Swal.fire("กรุณาเลือกสถานที่ก่อนค่ะ", "", "warning");
  //   }
  // };

  return (
    <div className="select-listtogo-container">
      <h2 className="select-listtogo-text">เลือกสถานที่จาก ListToGo</h2>

      <h2 className="select-listtogo-title">รายการใน List to Go ของคุณ</h2>

      {/* รายการสถานที่ */}
      <div className="select-listtogo-places-list">
        {listToGo.length > 0 ? (
          listToGo.map((place) => (
            <div key={place.list_to_go_id} className="select-listtogo-place-item">
              <input
                type="checkbox"
                checked={selectedPlaces.some(item => item.list_to_go_id === place.list_to_go_id)}
                onChange={() => handleSelectPlace(place)}
              />
              <div className="select-listtogo-place-image-container">
                <img 
                  src={`/place_images/${place.place_id}.jpg`} 
                  alt={place.place_name} 
                  className="select-listtogo-place-image" 
                />
                <span className="select-listtogo-place-name">{place.place_name}</span>
              </div>
            </div>
          ))
        ) : (
          <p>ไม่มีสถานที่ใน List to Go</p>
        )}
      </div>

      <button onClick={handleSubmit} className="select-listtogo-confirm-button">
        ยืนยันการเลือก
      </button>
    </div>
  );
};

export default SelectListToGo;