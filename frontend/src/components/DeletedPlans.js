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
      <button className="deleted-plans-back-button" onClick={() => navigate(-1)}>ย้อนกลับ</button>
      <div className="deleted-plans-container">
        {/* <button className="deleted-plans-back-button" onClick={() => navigate(-1)}>ย้อนกลับ</button> */}
        <h2 className="deleted-plans-header">ประวัติแผนการเดินทางที่ถูกลบ</h2>
        {error && <p className="deleted-plans-error-message">{error}</p>}
        {deletedPlans.length === 0 ? (
          <p className="deleted-plans-no-data">ยังไม่มีแผนที่ถูกลบ</p>
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
                <div className="plan-places">
                  {plan.deleted_place_list.map((place, index) => (
                    <div key={index} className="place-item">
                      {place.photo ? (
                        <img src={place.photo}
                        alt={place.place_name}
                        className="place-photo" />
                      ) : (
                        <img
                          src={`/place_images/${place.place_id}.jpg`}  // เพิ่มเส้นทางที่คาดว่าจะเก็บภาพ
                          alt={place.place_name || 'สถานที่ไม่มีชื่อ'}
                          className="place-photo" 
                          />
                      )}
                      <div>{place.place_name}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {/* <button className="deleted-plans-back-button" onClick={() => navigate(-1)}>ย้อนกลับ</button> */}
      </div>
    </div>
  );
};

export default DeletedPlans;
