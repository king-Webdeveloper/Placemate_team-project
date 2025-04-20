import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from 'sweetalert2';
import "./PlanDetails.css";

const PlanDetails = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const [planDetails, setPlanDetails] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlanDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/planner/${planId}`, {
                    withCredentials: true,
                });
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
            const response = await axios.delete(`http://localhost:5000/api/planner/${planId}/remove-place`, {
                data: { place_id: placeId },
                withCredentials: true,
            });

            if (response.status === 200) {
                setPlanDetails((prevState) => ({
                    ...prevState,
                    place_list: prevState.place_list.filter((place) => place.place_id !== placeId),
                }));

                console.log("ลบสถานที่สำเร็จ:", placeId);
            } else {
                setError("ไม่สามารถลบสถานที่ได้");
            }
        } catch (error) {
            console.error("Error while deleting place:", error);
            setError("ไม่สามารถลบสถานที่ได้");
        }
    };

    const handleEndTrip = async () => {
        try {
            const response = await axios.delete(`http://localhost:5000/api/planner/remove`, {
                data: { plan_id: planId },
                withCredentials: true,
            });

            if (response.status === 200) {
                navigate("/planner");
            } else {
                setError("ไม่สามารถสิ้นสุดแผนการเดินทางได้");
            }
        } catch (error) {
            console.error("Error while ending trip:", error);
            setError("ไม่สามารถสิ้นสุดแผนการเดินทางได้");
        }
    };

    const handleSyncToCalendar = async () => {
        try {
            const response = await axios.post("http://localhost:5000/api/google/sync-plan", 
                { plan_id: planId },
                { withCredentials: true }
            );
    
            Swal.fire({
                icon: "success",
                title: "เชื่อม Google Calendar สำเร็จ!",
                html: `<a href="${response.data.eventLink}" target="_blank">ดูใน Google Calendar</a>`,
                confirmButtonText: "ตกลง"
            });
        } catch (error) {
            console.error("Error syncing plan:", error.response?.data || error);
            Swal.fire({
                icon: "error",
                title: "เกิดข้อผิดพลาด",
                text: error.response?.data?.error || "ไม่สามารถเชื่อมกับ Google Calendar ได้"
            });
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
                                <div key={place.place_id} className="place-item animate-fade-in">
                                    <img
                                        src={place.place?.photo || `/place_images/${place.place?.place_id}.jpg`}
                                        alt={place.place?.name || "ชื่อไม่ระบุ"}
                                        className="place-image"
                                    />
                                    <div className="place-info">
                                        <h4>{place.place?.name || "ชื่อสถานที่ไม่ระบุ"}</h4>
                                        <p>⭐ {place.place?.rating || "ไม่มีคะแนน"}</p>
                                        <div className="place-tags">
                                            {place.place?.tag?.map((tagObj, index) => (
                                                <span key={index} className="place-tag">
                                                    {tagObj.tag_name}
                                                </span>
                                            ))}
                                        </div>
                                        <p>⏰ เวลาทำการ: {place.place?.business_hour?.map(b => b.business_hour).join(", ") || "ไม่ระบุเวลาเปิด-ปิด"}</p>
                                    </div>
                                    <div className="place-actions">
                                        <a
                                            href={`https://www.google.com/maps/search/?q=${encodeURIComponent(place.place?.name || "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="show-route-button"
                                        >
                                            🚗 แสดงเส้นทาง
                                        </a>
                                        <button onClick={() => handleDeletePlace(place.place_id)} className="delete-place-button">
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-places">ไม่มีสถานที่ในแผนการเดินทาง</p>
                        )}
                    </div>

                    <button onClick={handleSyncToCalendar} className="sync-calendar-button">
                    📅 Sync ไปยัง Google Calendar
                    </button>
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
