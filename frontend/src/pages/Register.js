import React, { useState } from "react";
import axios from "axios";

function Register() {

  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {

    if (!form.name || !form.email || !form.password) {
      return alert("Please fill required fields ❌");
    }

    if (loading) return;

    try {
      setLoading(true);

      await axios.post("http://localhost:8000/register", form);

      alert("Registered successfully ✅");

      localStorage.setItem("email", form.email);

      // 🔥 go to login instead of verify (correct flow)
      window.location.href = "/login";

    } catch (err) {
      alert(err.response?.data?.detail || "Registration failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">

      <div className="w-[380px] p-6 rounded-2xl border border-green-900 bg-[#0d1117]/80 backdrop-blur-md shadow-[0_0_20px_#00ff41] space-y-5">

        {/* TITLE */}
        <h2 className="text-[#00ff41] text-2xl font-bold text-center tracking-widest">
          ⚡ REGISTER
        </h2>

        {/* NAME */}
        <input
          name="name"
          placeholder="👤 Name"
          onChange={handleChange}
          className="w-full p-2 bg-black border border-green-500 text-[#00ff41] rounded outline-none focus:shadow-[0_0_10px_#00ff41]"
        />

        {/* EMAIL */}
        <input
          name="email"
          placeholder="📧 Email"
          onChange={handleChange}
          className="w-full p-2 bg-black border border-green-500 text-[#00ff41] rounded outline-none focus:shadow-[0_0_10px_#00ff41]"
        />

        {/* PASSWORD */}
        <input
          name="password"
          type="password"
          placeholder="🔒 Password"
          onChange={handleChange}
          className="w-full p-2 bg-black border border-green-500 text-[#00ff41] rounded outline-none focus:shadow-[0_0_10px_#00ff41]"
        />

        {/* DOB */}
        <input
          name="dob"
          type="date"
          onChange={handleChange}
          className="w-full p-2 bg-black border border-green-500 text-[#00ff41] rounded outline-none"
        />

        {/* PHONE */}
        <input
          name="phone"
          placeholder="📱 Phone"
          onChange={handleChange}
          className="w-full p-2 bg-black border border-green-500 text-[#00ff41] rounded outline-none focus:shadow-[0_0_10px_#00ff41]"
        />

        {/* ORGANIZATION */}
        <input
          name="organization"
          placeholder="🏢 Organization"
          onChange={handleChange}
          className="w-full p-2 bg-black border border-green-500 text-[#00ff41] rounded outline-none focus:shadow-[0_0_10px_#00ff41]"
        />

        {/* BUTTON */}
        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-[#00ff41] text-black py-2 rounded font-bold hover:bg-green-400 shadow-[0_0_10px_#00ff41] disabled:opacity-50"
        >
          {loading ? "Creating..." : "🚀 Create Account"}
        </button>

        {/* LOGIN LINK */}
        <p className="text-center text-gray-400 text-sm">
          Already have an account?{" "}
          <span
            onClick={() => (window.location.href = "/login")}
            className="text-[#00ff41] cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </div>

    </div>
  );
}

export default Register;