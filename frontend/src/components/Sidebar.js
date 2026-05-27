import React from "react";
import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-black h-screen p-5 border-r border-green-900 shadow-[0_0_20px_#00ff41]">

      <h2 className="text-[#00ff41] text-2xl font-bold mb-10 animate-pulse">
        ⚡ RedTeam
      </h2>

      <ul className="space-y-4 text-gray-400">

        <li>
          <Link
            to="/"
            className="block hover:text-[#00ff41] hover:translate-x-1 transition-all cursor-pointer"
          >
            🏠 Dashboard
          </Link>
        </li>

        <li>
          <Link
            to="/history"
            className="block hover:text-[#00ff41] hover:translate-x-1 transition-all cursor-pointer"
          >
            📜 History
          </Link>
        </li>

        {/* ✅ NEW */}
        <li>
          <Link
            to="/analytics"
            className="block hover:text-[#00ff41] hover:translate-x-1 transition-all cursor-pointer"
          >
            📊 Analytics
          </Link>
        </li>

        {/* ✅ NEW */}
        <li>
          <Link
            to="/settings"
            className="block hover:text-[#00ff41] hover:translate-x-1 transition-all cursor-pointer"
          >
            ⚙ Settings
          </Link>
        </li>

      </ul>

    </div>
  );
}

export default Sidebar;