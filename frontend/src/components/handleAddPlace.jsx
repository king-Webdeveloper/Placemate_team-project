// handleAddPlace.jsx [frontend]
import Swal from 'sweetalert2';

const handleAddPlace = async (place, navigate, setPlaces) => {
  try {
    // Fetch user token from cookies
    const response = await fetch("http://localhost:5000/api/get-cookie", {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user token from cookies");
    }
    const data = await response.json();

    // Check if token is present
    if (!data.token) {
      console.error("No token found, redirecting...");
      navigate("/login"); // Redirect to login page
      return; // Stop further execution if no token is found
    }

    const token = data.token; // Extract token from response
    const userId = data.user_id; // Extract user ID if present

    // Show the confirmation dialog only if token exists
    Swal.fire({
      title: "ยืนยันการเพิ่มสถานที่ไปยัง list to go ของคุณหรือไม่?",
      text: "สิ่งที่คุณเลือกจะเพิ่มไปยัง List to Go ของคุณ",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ยืนยัน"
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Send request to add place
        const addPlaceResponse = await fetch("http://localhost:5000/api/list-to-go/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Include token in headers
          },
          body: JSON.stringify({
            user_id: userId, // Include user ID
            name: place.name, // Place name
          }),
        });

        if (!addPlaceResponse.ok) {
          throw new Error("Failed to add place");
        }

        const newPlace = await addPlaceResponse.json();
        // setPlaces((prevPlaces) => [...prevPlaces, newPlace]); // Update places list
        // Show success alert after adding place
        Swal.fire({
          title: "เพิ่มสถานที่ไปยัง List to go ของคุณสำเร็จ!",
          text: "สถานที่เพิ่มไปยัง List to go ของคุณแล้ว",
          icon: "success"
        });
      }
    });
  } catch (error) {
    console.error("Error adding place:", error);
    // Show error alert if something goes wrong
    Swal.fire({
      title: "Error!",
      text: "เกิดข้อผิดพลาดในการเพิ่มสถานที่",
      icon: "error"
    });
  }
};

export default handleAddPlace;


// import Swal from 'sweetalert2';

// const handleAddPlace = async (place, navigate, setPlaces) => {
//   Swal.fire({
//     title: "ยืนยันการเพิ่มสถานที่ไปยัง list to go ของคุณหรือไม่?",
//     text: "สิ่งที่คุณเลือกจะเพิ่มไปยัง List to Go ของคุณ",
//     icon: "info",
//     showCancelButton: true,
//     confirmButtonColor: "#3085d6",
//     cancelButtonColor: "#d33",
//     confirmButtonText: "ยืนยัน"
//   }).then(async (result) => {
//     if (result.isConfirmed) {
//     try {
//       // Fetch user token from cookies
//       const response = await fetch("http://localhost:5000/api/get-cookie", {
//         method: "GET",
//         credentials: "include",
//       });
//       if (!response.ok) {
//         throw new Error("Failed to fetch user token from cookies");
//       }
//       const data = await response.json(); 
//       //   console.log("Data received:", data);
//       // Check if token is present
//       if (!data.token) {
//         console.error("No token found, redirecting...");
//         navigate("/"); // Redirect to homepage
//         return; // Stop further execution
//       }
  
//       const token = data.token; // Extract token from response
//       const userId = data.user_id; // Extract user ID if present

//       console.log(userId,place.name )
//       // Send request to add place
//       const addPlaceResponse = await fetch("http://localhost:5000/api/list-to-go/add", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "Authorization": `Bearer ${token}`, // Include token in headers
//         },
//         body: JSON.stringify({
//           user_id: userId, // Include user ID
//           name: place.name, // Place name
//         }),
//       });
  
//       if (!addPlaceResponse.ok) {
//         throw new Error("Failed to add place");
//       }
  
//       const newPlace = await addPlaceResponse.json();
//     //   setPlaces((prevPlaces) => [...prevPlaces, newPlace]); // Update places list
//     // แสดงการแจ้งเตือนเมื่อการลบสำเร็จ
//           Swal.fire({
//             title: "เพิ่มสถานที่ไปยัง List to go ของคุณสำเร็จ!",
//             text: "สถานที่เพิ่มไปยัง List to go ของคุณแล้ว",
//             icon: "success"
//           });
//     } catch (error) {
//       console.error("Error adding place:", error);
//             // แสดงการแจ้งเตือนหากเกิดข้อผิดพลาด
//             Swal.fire({
//               title: "Error!",
//               text: "เกิดข้อผิดพลาดในการเพิ่มสถานที่",
//               icon: "error"
//             });
//           }
//         }
//       });
//       navigate("/login"); // Redirect on error
//     };
  
//   export default handleAddPlace;
  