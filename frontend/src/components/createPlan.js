// ✅ CreatePlan.js (แก้ไขให้รับ selectedPlaces แบบ array จาก query string)
import React, { useState, useMemo } from 'react';
// import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PlannerForm from './PlannerForm';
import './CreatePlan.css';

const CreatePlan = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const selectedPlacesParam = queryParams.get("selectedPlaces");
  const selectedFromQuery = selectedPlacesParam ? JSON.parse(decodeURIComponent(selectedPlacesParam)) : [];

  const [selectedPlaces, setSelectedPlaces] = useState(selectedFromQuery);

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
