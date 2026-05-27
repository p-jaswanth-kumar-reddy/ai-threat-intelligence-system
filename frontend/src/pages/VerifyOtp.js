import React, { useState, useRef, useEffect } from "react";
import axios from "axios";

function VerifyOtp() {

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const inputs = useRef([]);
    const [timer, setTimer] = useState(30);

    const email = localStorage.getItem("email");
    const password = localStorage.getItem("password");

    // 🔥 INPUT HANDLING
    const handleChange = (value, index) => {
        if (!/^[0-9]?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }
    };

    // 🔥 BACKSPACE
    const handleKeyDown = (e, index) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    // 🔥 VERIFY OTP
    const verify = async () => {

        const finalOtp = otp.join("");

        if (!email) {
            return alert("Session expired. Login again ❌");
        }

        if (finalOtp.length !== 6) {
            return alert("Enter complete OTP ❌");
        }

        if (loading) return;

        try {
            setLoading(true);

            const res = await axios.post("http://localhost:8000/verify-otp", {
                email,
                otp: finalOtp
            });

            console.log("VERIFY RESPONSE:", res.data);

            alert(res.data?.message || "Login success ✅");

            localStorage.setItem("isLoggedIn", "true");

            window.location.replace("/");

        } catch (err) {
            console.log("VERIFY ERROR:", err.response?.data);

            alert(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Invalid OTP ❌"
            );
        } finally {
            setLoading(false);
        }
    };

    // 🔥 TIMER
    useEffect(() => {
        if (timer === 0) return;

        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer]);

    // 🔥 RESEND OTP
    const resendOtp = async () => {

        if (!email || !password) {
            return alert("Session expired. Please login again ❌");
        }

        try {
            const res = await axios.post("http://localhost:8000/login", {
                email,
                password
            });

            console.log("RESEND RESPONSE:", res.data);

            alert(res.data?.message || "OTP resent ✅");

            setTimer(30);

        } catch (err) {
            console.log("RESEND ERROR:", err.response?.data);

            alert(
                err.response?.data?.detail ||
                err.response?.data?.message ||
                "Failed to resend ❌"
            );
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-black text-white">

            <div className="w-[380px] p-6 rounded-2xl border border-green-900 bg-[#0d1117]/80 backdrop-blur-md shadow-[0_0_25px_#00ff41] space-y-6">

                <h2 className="text-[#00ff41] text-2xl font-bold text-center tracking-widest">
                    🔐 VERIFY OTP
                </h2>

                <p className="text-gray-400 text-sm text-center">
                    Enter 6-digit code sent to your email
                </p>

                {/* OTP BOXES */}
                <div className="flex justify-between gap-2">
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => (inputs.current[i] = el)}
                            value={digit}
                            onChange={(e) => handleChange(e.target.value, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            maxLength={1}
                            className="w-12 h-12 text-center text-xl bg-black border border-green-500 text-[#00ff41] rounded focus:shadow-[0_0_10px_#00ff41] outline-none"
                        />
                    ))}
                </div>

                {/* VERIFY BUTTON */}
                <button
                    onClick={verify}
                    disabled={loading}
                    className="w-full bg-[#00ff41] text-black py-2 rounded font-bold hover:bg-green-400 shadow-[0_0_10px_#00ff41] disabled:opacity-50"
                >
                    {loading ? "Verifying..." : "⚡ Verify & Login"}
                </button>

                {/* RESEND */}
                <div className="text-center text-sm text-gray-400">
                    {timer > 0 ? (
                        <p>Resend OTP in {timer}s</p>
                    ) : (
                        <button
                            onClick={resendOtp}
                            className="text-[#00ff41] hover:underline"
                        >
                            Resend OTP
                        </button>
                    )}
                </div>

            </div>

        </div>
    );
}

export default VerifyOtp;