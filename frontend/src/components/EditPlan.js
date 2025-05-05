import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import './EditPlan.css';

const EditPlan = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState({
    title: "",
    start_time: "",
    end_time: "",
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/planner/${planId}`);
        const { start_time, end_time } = response.data;

        // ตรวจสอบว่า start_time และ end_time สามารถแปลงเป็นวันที่ได้หรือไม่
        if (start_time && end_time) {
          // แปลง start_time และ end_time เป็นรูปแบบที่ datetime-local รองรับ (YYYY-MM-DDTHH:mm)
          const startTime = new Date(start_time).toISOString().slice(0, 16);
          const endTime = new Date(end_time).toISOString().slice(0, 16);
          setPlan({
            title: response.data.title,
            start_time: startTime,
            end_time: endTime,
          });
        } else {
          setError("ข้อมูลเวลาไม่ถูกต้อง");
        }
      } catch (error) {
        console.error("Error fetching plan:", error);
        setError("ไม่สามารถโหลดข้อมูลแผนการเดินทาง");
      }
    };

    fetchPlan();
  }, [planId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // ตรวจสอบว่า start_time และ end_time เป็นวันที่ที่ถูกต้อง
    const now = new Date();
    const startTime = new Date(plan.start_time);
    const endTime = new Date(plan.end_time);

    if (!plan.title.trim()) {
      setError("กรุณากรอกชื่อแผนการเดินทาง");
      return;
    }

    // if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    //   setError("เวลาที่กรอกไม่ถูกต้อง");
    //   return;
    // }
  
    if (startTime < now) {
      setError("เวลาเริ่มต้นต้องอยู่หลังเวลาปัจจุบัน");
      return;
    }
  
    if (endTime <= startTime) {
      setError("เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มต้น");
      return;
    }

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      setError("เวลาที่กรอกไม่ถูกต้อง");
      return;
    }

    // ใช้ SweetAlert ถามผู้ใช้ก่อนจะทำการบันทึก
    Swal.fire({
        title: "คุณแน่ใจหรือไม่?",
        text: "คุณต้องการบันทึกการเปลี่ยนแปลงแผนการเดินทางนี้หรือไม่?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ใช่, บันทึก",
        cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
        if (result.isConfirmed) {
        // ถ้าผู้ใช้กดยืนยัน (คลิก "ใช่, บันทึก")
        try {
          await axios.put(
            `http://localhost:5000/api/planner/${planId}/edit`,
            {
            title: plan.title,
            start_time: startTime.toISOString(), // ส่งเวลาในรูปแบบ ISO 8601
            end_time: endTime.toISOString(), // ส่งเวลาในรูปแบบ ISO 8601
            },
            { withCredentials: true }
        );

        // หลังจากอัปเดตแผนการเดินทางแล้ว, ให้ sync ไปยัง Google Calendar
        // const syncResponse = await axios.post(
        //   `http://localhost:5000/api/google/sync-plan`,
        //   {
        //     plan_id: planId,
        //   },
        //   { withCredentials: true }
        // );

        Swal.fire("Success", "แผนการเดินทางถูกอัปเดตสำเร็จ", "success");
        navigate(`/plan-details/${planId}`);
        } catch (error) {
        console.error("Error updating plan:", error);
        setError("ไม่สามารถอัปเดตแผนการเดินทาง");
        }
       }
     });
   };

  return (
    <div className="edit-plan-container">
      <h1>Edit Plan</h1>
      {error && <p className="error-message-edit">{error}</p>}
      <form onSubmit={handleSubmit} className="edit-plan-form">
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={plan.title}
            onChange={(e) => setPlan({ ...plan, title: e.target.value })}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <label>Start Time</label>
          <input
            type="datetime-local"
            value={plan.start_time}
            onChange={(e) => setPlan({ ...plan, start_time: e.target.value })}
            className="form-input"
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>
        <div className="form-group">
          <label>End Time</label>
          <input
            type="datetime-local"
            value={plan.end_time}
            onChange={(e) => setPlan({ ...plan, end_time: e.target.value })}
            className="form-input"
            min={plan.start_time}
          />
        </div>
        <button type="submit" className="submit-button">Save Changes</button>
      </form>
      <button onClick={() => navigate(`/plan-details/${planId}`)} className="cancel-button">Cancel</button>
    </div>
  );
};

export default EditPlan;
