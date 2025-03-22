import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./PlanDetails.css"; // ใช้ CSS ปกติ

const PlanDetails = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [planDetails, setPlanDetails] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlanDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/planner/${planId}`);
                setPlanDetails(response.data);
            } catch (error) {
                console.error("Error fetching plan details:", error);
                setError("ไม่สามารถโหลดข้อมูลแผนการเดินทางได้");
            }
        };

        fetchPlanDetails();
    }, [planId]);

    const handleDeletePlace = async (placeId) => {
        try {
            await axios.delete(`http://localhost:5000/api/planner/${planId}/remove-place`, {
                data: { place_id: placeId },
                withCredentials: true,
            });

            setPlanDetails((prevState) => ({
                ...prevState,
                place_list: prevState.place_list.filter((place) => place.place_id !== placeId),
            }));

            console.log("ลบสถานที่สำเร็จ:", placeId);
        } catch (error) {
            console.error("Error while deleting place:", error);
        }
    };

    const handleEndTrip = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/planner/remove`, {
                data: { plan_id: planId },
                withCredentials: true,
            });

            navigate("/planner");
        } catch (error) {
            console.error("Error while ending trip:", error);
        }
    };

    return (
        <div className="plan-details-container">
            {error && <p className="error-message">{error}</p>}

            {planDetails ? (
                <>
                    <h2 className="plan-title">{planDetails.title}</h2>
                    <p className="trip-date">🚀 เริ่มเดินทาง: {new Date(planDetails.start_time).toLocaleString()}</p>
                    <p className="trip-date">🏁 สิ้นสุดเดินทาง: {new Date(planDetails.end_time).toLocaleString()}</p>

                    <div className="places-list">
                        <h3>📍 สถานที่ท่องเที่ยว</h3>
                        {planDetails.place_list.length > 0 ? (
                            planDetails.place_list.map((place) => (
                                <div key={place.place_id} className="place-item">
                                    {place.image_url && (
                                        <img src={place.image_url} alt={place.place_name} className="place-image" />
                                    )}
                                    <div className="place-info">
                                        <h4>{place.place_name}</h4>
                                        <p>⭐ {place.rating ? place.rating : "ไม่มีคะแนน"}</p>
                                        <p>{place.category ? place.category.join(", ") : "ไม่ระบุประเภท"}</p>
                                        <p>⏰ เวลาทำการ: {place.opening_hours || "ไม่ระบุเวลาเปิด-ปิด"}</p>
                                    </div>
                                    <div className="place-actions">
                                        <a
                                            href={`https://www.google.com/maps/search/?q=${place.place_name}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="show-route-button"
                                        >
                                            🚗 แสดงเส้นทาง
                                        </a>
                                        <button onClick={() => handleDeletePlace(place.place_id)} className="delete-place-button">
                                            🗑️ ลบสถานที่
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-places">ไม่มีสถานที่ในแผนการเดินทาง</p>
                        )}
                    </div>

                    <button onClick={handleEndTrip} className="end-trip-button">
                        ⛔ สิ้นสุดแผนการเดินทาง
                    </button>
                    <button onClick={() => navigate("/planner")} className="back-to-planner-button">
                        🔙 กลับไปที่หน้า Planner
                    </button>
                </>
            ) : (
                <p className="loading-message">⏳ กำลังโหลดข้อมูล...</p>
            )}
        </div>
    );
};

export default PlanDetails;
