import React, { useState } from "react";
import axios from "axios";

function ResetPassword() {

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const email = localStorage.getItem("resetEmail");

  const reset = async () => {

    if (!otp || !password) {
      return alert("Enter OTP and new password ❌");
    }

    if (!email) {
      return alert("Session expired, try again ❌");
    }

    if (loading) return;

    try {
      setLoading(true);

      await axios.post("http://localhost:8000/reset-password", {
        email,
        otp,
        new_password: password
      });

      alert("Password reset successful ✅");

      // 🔥 clear reset email
      localStorage.removeItem("resetEmail");

      window.location.href = "/login";

    } catch (err) {
      alert(err.response?.data?.detail || "Reset failed ❌");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">

      <div className="p-6 border border-green-900 rounded-xl shadow-[0_0_20px_#00ff41] w-[350px] space-y-5 bg-[#0d1117]/80 backdrop-blur-md">

        <h2 className="text-[#00ff41] text-xl text-center font-bold tracking-widest">
          🔐 Reset Password
        </h2>

        {/* OTP */}
        <input
          placeholder="🔢 Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full p-2 bg-black border border-green-500 text-[#00ff41] rounded outline-none focus:shadow-[0_0_10px_#00ff41]"
        />

        {/* NEW PASSWORD */}
        <input
          type="password"
          placeholder="🔒 New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 bg-black border border-green-500 text-[#00ff41] rounded outline-none focus:shadow-[0_0_10px_#00ff41]"
        />

        {/* BUTTON */}
        <button
          onClick={reset}
          disabled={loading}
          className="w-full bg-[#00ff41] text-black py-2 rounded font-bold hover:bg-green-400 shadow-[0_0_10px_#00ff41] disabled:opacity-50"
        >
          {loading ? "Updating..." : "🔄 Reset Password"}
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

export default ResetPassword;