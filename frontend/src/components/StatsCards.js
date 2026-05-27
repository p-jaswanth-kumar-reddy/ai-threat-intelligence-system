import React from "react";

function StatsCards({ data }) {
  if (!data) return null;

  let total = 0, critical = 0, medium = 0, low = 0;

  data.results.forEach((t) => {
    t.vulnerabilities?.forEach((v) => {
      total++;

      if (v.risk === "Critical") critical++;
      else if (v.risk === "Medium") medium++;
      else if (v.risk === "Low") low++;
    });
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">

      {/* TOTAL */}
      <div className="bg-[#0d1117]/90 p-5 rounded-xl border border-green-700 shadow-md hover:border-[#00ff41] transition">
        <p className="text-green-400 text-sm tracking-wide">
          TOTAL ISSUES
        </p>
        <h2 className="text-3xl font-bold text-[#00ff41] mt-2">
          {total}
        </h2>
      </div>

      {/* CRITICAL */}
      <div className="bg-[#1a0000]/80 p-5 rounded-xl border border-red-700 shadow-md hover:border-red-500 transition">
        <p className="text-red-400 text-sm tracking-wide">
          CRITICAL
        </p>
        <h2 className="text-3xl font-bold text-red-500 mt-2">
          {critical}
        </h2>
      </div>

      {/* MEDIUM */}
      <div className="bg-[#1a1400]/80 p-5 rounded-xl border border-yellow-600 shadow-md hover:border-yellow-400 transition">
        <p className="text-yellow-300 text-sm tracking-wide">
          MEDIUM
        </p>
        <h2 className="text-3xl font-bold text-yellow-400 mt-2">
          {medium}
        </h2>
      </div>

      {/* LOW */}
      <div className="bg-[#001a0f]/80 p-5 rounded-xl border border-green-700 shadow-md hover:border-green-400 transition">
        <p className="text-green-300 text-sm tracking-wide">
          LOW
        </p>
        <h2 className="text-3xl font-bold text-green-400 mt-2">
          {low}
        </h2>
      </div>

    </div>
  );
}

export default StatsCards;