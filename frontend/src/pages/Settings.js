import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

function Settings() {

  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);

  const email = localStorage.getItem("email");

  // 🔥 LOAD PROFILE
  useEffect(() => {
    axios.get(`http://localhost:8000/profile/${email}`)
      .then(res => {
        setForm(res.data);
        setLoading(false);
      })
      .catch(() => {
        alert("Failed to load profile ❌");
        setLoading(false);
      });
  }, [email]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const updateProfile = async () => {
    try {
      await axios.put("http://localhost:8000/update-profile", form);
      alert("Profile updated ✅");
      setShowModal(false);
    } catch {
      alert("Update failed ❌");
    }
  };

  useEffect(() => {
    if (otpMode) {
      setOtp("");
      setNewPassword("");
    }
  }, [otpMode]);


  if (loading) return <div className="text-white p-10">Loading...</div>;

  return (
    <div className="flex text-white min-h-screen">

      <Sidebar />

      <div className="flex-1">

        <Topbar />

        <div className="p-6 max-w-4xl mx-auto space-y-6">

          <h1 className="text-2xl font-bold text-[#00ff41]">
            ⚙ Account Settings
          </h1>

          {/* ================= PROFILE VIEW ================= */}
          <div className="bg-[#0d1117]/80 border border-green-900 p-6 rounded-xl shadow-[0_0_20px_#00ff41] space-y-4">

            <h2 className="text-[#00ff41] font-semibold text-lg">
              👤 Profile Overview
            </h2>

            <div className="grid md:grid-cols-2 gap-4 text-sm">

              <p>
                <span className="text-gray-100">Name:</span>{" "}
                <span className="text-[#00ff41] font-semibold">{form.name}</span>
              </p>

              <p>
                <span className="text-gray-100">Email:</span>{" "}
                <span className="text-[#00ff41]">{form.email}</span>
              </p>

              <p>
                <span className="text-gray-100">Phone:</span>{" "}
                <span className="text-[#00ff41]">{form.phone}</span>
              </p>

              <p>
                <span className="text-gray-100">DOB:</span>{" "}
                <span className="text-[#00ff41]">{form.dob}</span>
              </p>

              <p>
                <span className="text-gray-100">Organization:</span>{" "}
                <span className="text-[#00ff41]">{form.organization}</span>
              </p>

              <p>
                <span className="text-gray-100">Country:</span>{" "}
                <span className="text-[#00ff41]">{form.country}</span>
              </p>

            </div>

            <p className="text-sm">
              <span className="text-gray-100">Address:</span>{" "}
              <span className="text-[#00ff41]">{form.address}</span>
            </p>

            <p className="text-sm">
              <span className="text-gray-100">Bio:</span>{" "}
              <span className="text-[#00ff41]">{form.bio}</span>
            </p>

            {/* 🔥 BUTTON */}
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-[#00ff41] text-black py-2 rounded font-bold hover:bg-green-400 shadow-[0_0_10px_#00ff41]"
            >
              ✏ Update Details
            </button>

          </div>

          <div className="bg-[#0d1117]/80 border border-yellow-600 p-6 rounded-xl shadow-[0_0_15px_yellow] space-y-4">

            <h2 className="text-yellow-400 font-semibold">
              🔐 Change Password
            </h2>

            {/* 🔥 OTP BUTTON */}
            <button
              onClick={async () => {
                if (otpTimer > 0 || sendingOtp) return;

                try {
                  setSendingOtp(true);

                  await axios.post("http://localhost:8000/forgot-password", {
                    email: form.email
                  });

                  alert("OTP sent to your email ✅");

                  setOtpMode(true);
                  setOtpTimer(30); // ⏳ cooldown

                } catch (err) {
                  alert(err.response?.data?.detail || "Failed ❌");
                } finally {
                  setSendingOtp(false);
                }
              }}
              disabled={otpTimer > 0 || sendingOtp}
              className="w-full bg-blue-500 text-black py-2 rounded font-bold disabled:opacity-50"
            >
              {otpTimer > 0
                ? `Resend in ${otpTimer}s`
                : sendingOtp
                  ? "Sending..."
                  : "🔐 Verify via OTP"}
            </button>

            {/* 🔥 OTP FLOW */}
            {otpMode && (
              <div className="space-y-3 mt-3 border border-green-900 p-4 rounded-lg bg-black/40">

                <input
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full p-2 bg-black border border-green-500 rounded text-[#00ff41]"
                />

                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 bg-black border border-yellow-500 rounded text-yellow-300"
                />

                {/* ✅ CORRECT BUTTON (RESET PASSWORD) */}
                <button
                  onClick={async () => {
                    try {
                      await axios.post("http://localhost:8000/reset-password", {
                        email: form.email,
                        otp: otp,
                        new_password: newPassword
                      });

                      alert("Password updated via OTP ✅");

                      setOtp("");
                      setNewPassword("");
                      setOtpMode(false);
                      setOtpTimer(0);

                    } catch (err) {
                      alert(err.response?.data?.detail || "Invalid OTP ❌");
                    }
                  }}
                  className="w-full bg-green-400 text-black py-2 rounded font-bold"
                >
                  Update Password
                </button>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

          <div className="bg-[#020202] border border-green-500 p-6 rounded-xl w-[520px] shadow-[0_0_25px_#00ff41] space-y-4 max-h-[80vh] overflow-y-auto">

            <h2 className="text-[#00ff41] text-lg font-bold">
              ✏ Edit Profile
            </h2>

            {/* NAME */}
            <input
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              placeholder="Full Name"
              className="w-full p-2 bg-black border border-green-500 rounded text-[#00ff41]"
            />

            {/* PHONE */}
            <input
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              placeholder="Phone"
              className="w-full p-2 bg-black border border-green-500 rounded text-[#00ff41]"
            />

            {/* DOB */}
            <input
              type="date"
              name="dob"
              value={form.dob || ""}
              onChange={handleChange}
              className="w-full p-2 bg-black border border-green-500 rounded text-[#00ff41]"
            />

            {/* ORGANIZATION */}
            <input
              name="organization"
              value={form.organization || ""}
              onChange={handleChange}
              placeholder="Organization"
              className="w-full p-2 bg-black border border-green-500 rounded text-[#00ff41]"
            />

            {/* ADDRESS */}
            <input
              name="address"
              value={form.address || ""}
              onChange={handleChange}
              placeholder="Address"
              className="w-full p-2 bg-black border border-green-500 rounded text-[#00ff41]"
            />

            {/* COUNTRY */}
            <input
              name="country"
              value={form.country || ""}
              onChange={handleChange}
              placeholder="Country"
              className="w-full p-2 bg-black border border-green-500 rounded text-[#00ff41]"
            />

            {/* BIO */}
            <textarea
              name="bio"
              value={form.bio || ""}
              onChange={handleChange}
              placeholder="About you..."
              className="w-full p-2 bg-black border border-green-500 rounded text-[#00ff41]"
            />

            {/* REPORT EMAIL */}
            <input
              name="reportEmail"
              value={form.reportEmail || ""}
              onChange={handleChange}
              placeholder="Report Email"
              className="w-full p-2 bg-black border border-green-500 rounded text-[#00ff41]"
            />

            {/* NOTIFICATIONS */}
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                name="notifications"
                checked={form.notifications || false}
                onChange={handleChange}
              />
              Enable Notifications
            </label>

            {/* BUTTONS */}
            <div className="flex gap-3 mt-4">

              <button
                onClick={updateProfile}
                className="flex-1 bg-[#00ff41] text-black py-2 rounded font-bold"
              >
                Save Changes
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="flex-1 bg-red-600 py-2 rounded"
              >
                Cancel
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}

export default Settings;