import React, { useState } from "react";
import axios from "axios";

function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {

    if (!email || !password) {
      return alert("Please enter email & password ❌");
    }

    if (loading) return;

    try {
      setLoading(true);

      const res = await axios.post("http://localhost:8000/login", {
        email,
        password
      });

      console.log("LOGIN RESPONSE:", res.data);

      // ✅ ONLY SHOW MESSAGE (NO OTP)
      alert(res.data?.message || "OTP sent to your email ✅");

      // ✅ STORE ONLY EMAIL (NOT PASSWORD ❌)
      localStorage.setItem("email", email);

      // ❌ REMOVE THIS LINE COMPLETELY
      // localStorage.setItem("password", password);

      window.location.href = "/verify-otp";

    } catch (err) {
      console.log("LOGIN ERROR:", err.response?.data);

      alert(
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Login failed ❌"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white">

      <div className="w-[350px] p-6 rounded-2xl border border-green-900 bg-[#0d1117]/80 backdrop-blur-md shadow-[0_0_20px_#00ff41] space-y-5">

        <h2 className="text-[#00ff41] text-2xl font-bold text-center tracking-widest">
          🔐 LOGIN
        </h2>

        {/* EMAIL */}
        <input
          placeholder="📧 Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 bg-black border border-green-500 text-[#00ff41] rounded outline-none focus:shadow-[0_0_10px_#00ff41]"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="🔒 Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 bg-black border border-green-500 text-[#00ff41] rounded outline-none focus:shadow-[0_0_10px_#00ff41]"
        />

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#00ff41] text-black py-2 rounded font-bold hover:bg-green-400 shadow-[0_0_10px_#00ff41] disabled:opacity-50"
        >
          {loading ? "Sending..." : "⚡ Send OTP"}
        </button>

        {/* FORGOT PASSWORD */}
        <p
          onClick={() => (window.location.href = "/forgot")}
          className="text-[#00ff41] text-center cursor-pointer mt-3 hover:underline"
        >
          Forgot Password?
        </p>

        {/* REGISTER */}
        <p className="text-center text-gray-400 text-sm">
          New user?{" "}
          <span
            onClick={() => (window.location.href = "/register")}
            className="text-[#00ff41] cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>

      </div>

    </div>
  );
}

export default Login;