// handleAddPlace.jsx [frontend]
import Swal from "sweetalert2";

const handleAddPlace = async (place, navigate, setPlaces) => {
  try {
    // 🔐 ตรวจสอบว่าเข้าสู่ระบบแล้วหรือยัง โดยเช็ค token
    const response = await fetch("http://localhost:5000/api/get-cookie", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      navigate("/login");
      return;
    }

    const data = await response.json();

    if (!data.token) {
      navigate("/login");
      return;
    }

    const token = data.token;
    const userId = data.user_id;

    // ✅ แสดงกล่องยืนยันหลัง login แล้วเท่านั้น
    const result = await Swal.fire({
      title: "คุณต้องการเพิ่มสถานที่นี้หรือไม่?",
      text: `${place.name} จะถูกเพิ่มใน List to go ของคุณ`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "เพิ่มเลย!",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    // 🚀 ส่งคำขอเพิ่ม
    const addPlaceResponse = await fetch("http://localhost:5000/api/list-to-go/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        name: place.name,
      }),
    });

    // ⚠️ ตรวจสอบกรณีซ้ำ
    if (addPlaceResponse.status === 409) {
      await Swal.fire({
        title: "มีอยู่แล้ว!",
        text: `${place.name} มีอยู่ใน List to go ของคุณแล้ว`,
        icon: "info",
      });
      return;
    }

    // ❌ กรณีอื่นที่ไม่สำเร็จ
    if (!addPlaceResponse.ok) {
      throw new Error("Failed to add place");
    }

    const newPlace = await addPlaceResponse.json();

    // ✅ แจ้งผลลัพธ์หลังเพิ่มเสร็จ
    await Swal.fire({
      title: "เพิ่มเรียบร้อย!",
      text: `${place.name} ถูกเพิ่มใน List to go ของคุณแล้ว`,
      icon: "success",
    });

    // อัปเดต state ถ้าจำเป็น
    // setPlaces?.((prev) => [...prev, newPlace]);

  } catch (error) {
    console.error("Error adding place:", error);
    // ❗ แสดง error ถ้า token ใช้ไม่ได้หรือ fetch fail
    await Swal.fire({
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถเพิ่มสถานที่ได้ กรุณาลองใหม่หรือล็อกอินอีกครั้ง",
      icon: "error",
    });

    navigate("/login");
  }
};

export default handleAddPlace;



  