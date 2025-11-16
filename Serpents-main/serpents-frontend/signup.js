// signup.js
const BACKEND = "http://127.0.0.1:8000";  // ✔ YOUR REAL BACKEND

document.getElementById("signupButton").addEventListener("click", async () => {
  const email = document.getElementById("emailField").value.trim();
  const password = document.getElementById("passField").value.trim();

  if (!email || !password) { 
    alert("Enter both email & password"); 
    return; 
  }

  const res = await fetch(`${BACKEND}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (res.ok) {
    alert("Account created. Please login.");
    window.location.href = "login.html";
  } else {
    alert(data.detail || data.error || "Signup failed");
  }
});
