// login.js
const BACKEND = "http://127.0.0.1:8000";  // ✔ YOUR REAL BACKEND

const emailField = document.getElementById("emailField");
const passwordField = document.getElementById("passField");
const loginButton = document.getElementById("loginButton");

loginButton.addEventListener("click", async (e) => {
  e.preventDefault();

  const email = emailField.value.trim();
  const password = passwordField.value.trim();

  if (!email || !password) { 
    alert("Enter email & password"); 
    return; 
  }

  try {
    const res = await fetch(`${BACKEND}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok) {
      localStorage.setItem("user_email", email);
      alert("Login successful!");
      window.location.href = "home.html";
    } else {
      alert(data.detail || data.error || "Login failed");
    }

  } catch (err) {
    alert("Server error: " + err.message);
  }
});
