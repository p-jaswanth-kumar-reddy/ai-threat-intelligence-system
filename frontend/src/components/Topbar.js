import React, { useState, useEffect } from "react";
import axios from "axios";

function Topbar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const email = localStorage.getItem("email");

    axios.get(`http://localhost:8000/profile/${email}`)
      .then(res => setUser(res.data))
      .catch(() => { });
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <div className="flex justify-between items-center bg-black border-b border-green-900 p-4 relative z-40">

      {/* LEFT */}
      <h1 className="text-[#00ff41] tracking-widest">
        🧠 Threat Intelligence Dashboard
      </h1>

      {/* RIGHT */}
      <div className="flex items-center gap-6 relative">

        {/* ONLINE */}
        <div className="text-gray-400 text-sm">
          🟢 Online
        </div>

        {/* PROFILE */}
        <div
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-[#00ff41] cursor-pointer hover:scale-105 transition-all"
        >
          👤
          <span className="text-sm">
            {user?.name || "User"}
          </span>
        </div>

        {/* 🔥 DROPDOWN */}
        {open && (
          <div className="absolute right-0 top-12 w-56 bg-[#020202] border border-green-900 rounded-xl shadow-[0_0_15px_#00ff41] p-4 space-y-3 z-50">

            <div className="text-sm text-gray-300">
              <p className="text-[#00ff41] font-semibold">{user?.name}</p>
              <p>{user?.email}</p>
            </div>

            <hr className="border-green-900" />

            <button
              onClick={() => (window.location.href = "/settings")}
              className="w-full text-left text-gray-300 hover:text-[#00ff41]"
            >
              ⚙ Settings
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-left text-red-500 hover:text-red-300"
            >
              🚪 Logout
            </button>

          </div>
        )}

      </div>

    </div>
  );
}

export default Topbar;