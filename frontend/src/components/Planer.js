import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PlannerForm from './PlannerForm';
import './Planner.css';

const Planner = () => {
    const [plans, setPlans] = useState([]);
    const [message, setMessage] = useState('');

    // ฟังก์ชันดึงข้อมูล Token (ต้องเป็น async)
    const fetchToken = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/get-cookie", {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Failed to fetch user token from cookies");
            }

            const data = await response.json();
            if (!data.token) {
                console.error("No token found, redirecting...");
                return;
            }

            console.log("User ID:", data.user_id, "Token:", data.token);
        } catch (error) {
            console.error("Error fetching token:", error);
        }
    };

    // เรียกใช้ฟังก์ชัน fetchToken เมื่อ component โหลด
    useEffect(() => {
        fetchToken();
    }, []);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/planner/user', {
                    withCredentials: true,
                });
                setPlans(response.data);
            } catch (err) {
                console.error("Error fetching plans:", err.response ? err.response.data : err);
                setMessage('เกิดข้อผิดพลาดในการดึงข้อมูลแผน');
            }
        };
        fetchPlans();
    }, []);

    const handleDelete = async (planId) => {
        try {
            await axios.delete('http://localhost:5000/api/planner/remove', {
                withCredentials: true,
                data: { plan_id: planId }
            });
            setPlans(plans.filter(plan => plan.plan_id !== planId));
        } catch (err) {
            console.error("Error deleting plan:", err.response ? err.response.data : err);
        }
    };

    return (
        <div className="planner-page">
            <div className="planner-container">
                <h2>Your Travel Plans</h2>
                {message && <p className="message">{message}</p>}

                <PlannerForm setPlans={setPlans} />

                <div className="plans-list">
                    {plans.map((plan) => (
                        <div key={plan.plan_id} className="plan-card">
                            <div className="plan-header">
                                <span className="plan-title">{plan.title}</span>
                                <button className="start-trip-button">เริ่มต้นการเดินทาง</button>
                            </div>
                            <p className="plan-info">เริ่มเดินทาง: {new Date(plan.created_at).toLocaleDateString()}</p>

                            <div className="plan-actions">
                                <span className="action-button" onClick={() => handleDelete(plan.plan_id)}>
                                    <i className="fas fa-trash"></i> ลบแผนการเดินทาง
                                </span>
                                <span className="action-button">
                                    <i className="fas fa-link"></i> แชร์การเดินทาง
                                </span>
                            </div>
                        </div>
                    ))}

                    <div className="add-plan-button">+</div>
                </div>
            </div>
        </div>
    );
};

export default Planner;
