// handleAddPlace.jsx [frontend]
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
    //   console.log("Data received:", data);
    // Check if token is present
    if (!data.token) {
      console.error("No token found, redirecting...");
      navigate("/"); // Redirect to homepage
      return; // Stop further execution
    }

    const token = data.token; // Extract token from response
    const userId = data.user_id; // Extract user ID if present

    console.log(userId,place.name )
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
  } catch (error) {
    console.error("Error adding place:", error);
    navigate("/login"); // Redirect on error
  }
};

export default handleAddPlace;


  