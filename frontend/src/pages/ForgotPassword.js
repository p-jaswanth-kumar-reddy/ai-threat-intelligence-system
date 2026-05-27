import React, { useState } from "react";
import axios from "axios";

function ForgotPassword() {

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async () => {

    // ✅ VALIDATION
    if (!email) {
      return alert("Please enter email ❌");
    }

    if (loading) return;

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:8000/forgot-password", {
        email
      });

      console.log("FORGOT RESPONSE:", res.data); // 🔍 debug

      // 🔥 SHOW OTP (since email may fail)
      if (res.data?.otp) {
        alert("Your OTP: " + res.data.otp);
      } else {
        alert(res.data?.message || "OTP sent ✅");
      }

      // ✅ STORE EMAIL FOR RESET
      localStorage.setItem("resetEmail", email);

      // ✅ REDIRECT
      window.location.href = "/reset-password";

    } catch (err) {
      console.log("FORGOT ERROR:", err.response?.data); // 🔍 debug

      alert(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Error ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">

      <div className="p-6 border border-green-900 rounded-xl shadow-[0_0_20px_#00ff41] w-[350px] space-y-5 bg-[#0d1117]/80 backdrop-blur-md">

        <h2 className="text-[#00ff41] text-xl text-center font-bold tracking-widest">
          🔑 Forgot Password
        </h2>

        {/* EMAIL */}
        <input
          placeholder="📧 Enter Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 bg-black border border-green-500 text-[#00ff41] rounded outline-none focus:shadow-[0_0_10px_#00ff41]"
        />

        {/* BUTTON */}
        <button
          onClick={sendOtp}
          disabled={loading}
          className="w-full bg-[#00ff41] text-black py-2 rounded font-bold hover:bg-green-400 shadow-[0_0_10px_#00ff41] disabled:opacity-50"
        >
          {loading ? "Sending..." : "📨 Send OTP"}
        </button>

        {/* BACK */}
        <p
          onClick={() => (window.location.href = "/login")}
          className="text-center text-sm text-gray-400 cursor-pointer hover:text-[#00ff41]"
        >
          ← Back to Login
        </p>

      </div>

    </div>
  );
}

export default ForgotPassword;