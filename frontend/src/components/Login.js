import React, { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login Attempt:", { email, password });
    // คุณสามารถส่งข้อมูลไปยัง backend ด้วย fetch หรือ axios ได้ที่นี่
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="email">Email:</label>
          <br />
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
            required
          />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="password">Password:</label>
          <br />
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              marginTop: "5px",
              borderRadius: "5px",
              border: "1px solid #ccc",
            }}
            required
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            backgroundColor: "#007BFF",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
