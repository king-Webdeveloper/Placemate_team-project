import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './DeletedPlans.css';

const DeletedPlans = () => {
  const [deletedPlans, setDeletedPlans] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDeletedPlans = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/planner/deleted', {
          withCredentials: true
        });
        setDeletedPlans(res.data);
      } catch (err) {
        console.error('Error fetching deleted plans:', err);
        setError('เกิดข้อผิดพลาดในการโหลดข้อมูลประวัติแผนที่ถูกลบ');
      }
    };

    fetchDeletedPlans();
  }, []);

  return (
    <div className="deleted-plans-page">
      <div className="deleted-plans-container">
        <h2>ประวัติแผนการเดินทางที่ถูกลบ</h2>
        {error && <p className="error-message">{error}</p>}
        {deletedPlans.length === 0 ? (
          <p className="no-data">ยังไม่มีแผนที่ถูกลบ</p>
        ) : (
          <div className="deleted-plans-list">
            {deletedPlans.map(plan => (
              <div className="deleted-plan-card" key={plan.deleted_plan_id}>
                <div className="plan-title">{plan.title || '(ไม่มีชื่อ)'}</div>
                <div className="plan-info">
                  เริ่ม: {new Date(plan.start_time).toLocaleString()}<br />
                  จบ: {new Date(plan.end_time).toLocaleString()}<br />
                  ลบเมื่อ: {new Date(plan.deleted_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
        <button className="back-button" onClick={() => navigate(-1)}>ย้อนกลับ</button>
      </div>
    </div>
  );
};

export default DeletedPlans;
