// ฟังก์ชันที่ดึงข้อมูล userLocation จาก localStorage และ return เป็น object
export const getUserLocation = () => {
    // ดึงข้อมูลจาก localStorage
    const storedLocation = localStorage.getItem('userLocation');
    if (storedLocation) {
      // แปลงข้อมูลที่เก็บใน localStorage ให้เป็น JSON object
      return JSON.parse(storedLocation);
    }
    // หากไม่มีข้อมูลใน localStorage ให้ return null หรือค่าเริ่มต้น
    return null;
  };
  