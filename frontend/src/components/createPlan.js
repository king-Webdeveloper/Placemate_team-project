import React, { useState, useEffect, useMemo} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PlannerForm from './PlannerForm';
import './CreatePlan.css';

const CreatePlan = () => {
  const navigate = useNavigate();
  const location = useLocation();
  

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const selectedPlace = queryParams.get("selectedPlace")
    ? JSON.parse(decodeURIComponent(queryParams.get("selectedPlace")))
    : null;

  const [selectedPlaces, setSelectedPlaces] = useState([]);

  useEffect(() => {
    if (selectedPlace) {
        setSelectedPlaces(prevPlaces => {
            // ตรวจสอบว่ามีสถานที่นี้ในรายการแล้วหรือไม่
            const exists = prevPlaces.some(p => p.place_id === selectedPlace.place_id);
            return exists ? prevPlaces : [...prevPlaces, selectedPlace]; // เพิ่มสถานที่ใหม่ถ้ายังไม่มี
        });

        // ล้าง query params หลังจากเพิ่มสถานที่แล้ว
        queryParams.delete("selectedPlace");
        navigate({ search: queryParams.toString() }, { replace: true });
    }
  }, [selectedPlace, navigate, queryParams]);


  return (
    <div className="create-plan-page">
      <h2>Create New Travel Plan</h2>
      <button onClick={() => navigate('/search-place')} className="search-place-btn">
        🔍 ค้นหาสถานที่
      </button>
      <PlannerForm selectedPlaces={selectedPlaces} setSelectedPlaces={setSelectedPlaces} />
    </div>
  );
};

export default CreatePlan;
