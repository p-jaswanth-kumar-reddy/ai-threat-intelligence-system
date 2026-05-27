import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart,
  Pie,
  Cell
} from "recharts";


function Analytics() {

  const [history, setHistory] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/history")
      .then(res => setHistory(res.data.history))
      .catch(() => alert("Failed to load analytics"));
  }, []);

  // ================= 🔥 CORE ANALYSIS =================

  let totalVulns = 0;
  let critical = 0;
  let medium = 0;
  let low = 0;

  const targetRisk = {};

  history.forEach(scan => {
    scan.results.forEach(t => {

      let count = t.vulnerabilities?.length || 0;

      targetRisk[t.target] = (targetRisk[t.target] || 0) + count;

      t.vulnerabilities?.forEach(v => {
        totalVulns++;

        if (v.risk === "Critical") critical++;
        else if (v.risk === "Medium") medium++;
        else low++;
      });
    });
  });

  // ================= 📉 TREND =================
  let cumulative = 0;

  const trendData = history.map((scan, i) => {
    let count = 0;

    scan.results.forEach(t => {
      count += t.vulnerabilities?.length || 0;
    });

    cumulative += count;

    return {
      name: `Scan ${i + 1}`,
      issues: cumulative
    };
  });

  // ================= 🧠 AI INSIGHTS =================
  const getInsights = () => {
    let insights = [];

    if (critical > totalVulns * 0.4) {
      insights.push("🚨 High critical vulnerability exposure detected");
    }

    if (trendData.length > 2) {
      const last = trendData[trendData.length - 1]?.issues;
      const prev = trendData[trendData.length - 2]?.issues;

      if (last > prev) {
        insights.push("📈 Vulnerabilities are increasing over time");
      } else {
        insights.push("📉 Security posture is improving");
      }
    }

    if (Object.keys(targetRisk).length > 0) {
      const worst = Object.entries(targetRisk)
        .sort((a, b) => b[1] - a[1])[0];

      insights.push(`🎯 Most vulnerable target: ${worst[0]}`);
    }

    if (low > medium && low > critical) {
      insights.push("🟢 Majority issues are low risk (good sign)");
    }

    if (totalVulns === 0) {
      insights.push("✅ No vulnerabilities detected");
    }

    return insights;
  };

  const getPerScanData = () => {
    return history.map((scan, i) => {

      let count = 0;
      let riskScore = 0;

      scan.results.forEach(t => {
        t.vulnerabilities?.forEach(v => {
          count++;

          // 🎯 weight by severity
          if (v.risk === "Critical") riskScore += 3;
          else if (v.risk === "Medium") riskScore += 2;
          else riskScore += 1;
        });
      });

      return {
        name: `Scan ${i + 1}`,
        issues: count,
        risk: riskScore
      };
    });
  };

  const getRiskDistribution = () => {
    let counts = { Critical: 0, Medium: 0, Low: 0 };

    history.forEach(scan => {
      scan.results.forEach(t => {
        t.vulnerabilities?.forEach(v => {
          counts[v.risk] = (counts[v.risk] || 0) + 1;
        });
      });
    });

    return {
      data: [
        { name: "Critical", value: counts.Critical },
        { name: "Medium", value: counts.Medium },
        { name: "Low", value: counts.Low }
      ],
      total: counts.Critical + counts.Medium + counts.Low,
      counts
    };
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];

      const color =
        item.name === "Critical"
          ? "#ff1a1a"
          : item.name === "Medium"
            ? "#ffaa00"
            : "#00ff41";

      return (
        <div
          className="px-3 py-2 rounded-lg border text-sm"
          style={{
            backgroundColor: "#020202",
            borderColor: color,
            color: color,
            boxShadow: `0 0 10px ${color}`
          }}
        >
          <p className="font-bold">{item.name}</p>
          <p>{item.value} issues</p>
        </div>
      );
    }

    return null;
  };

  const riskData = getRiskDistribution();

  // ================= 🛡 RISK % =================
  const riskPercent = totalVulns === 0
    ? 0
    : Math.floor((critical / totalVulns) * 100);

  return (
    <div className="flex text-white min-h-screen">

      <Sidebar />

      <div className="flex-1">

        <Topbar />

        <div className="p-6 max-w-6xl mx-auto space-y-6">

          <h1 className="text-2xl font-bold text-[#00ff41]">
            📊 Intelligence Analytics Dashboard
          </h1>

          {/* ================= SUMMARY ================= */}
          {/* ================= SUMMARY ================= */}
          <div className="grid md:grid-cols-5 gap-4">

            {/* TOTAL SCANS */}
            <div className="bg-[#0d1117] p-4 rounded-xl border border-green-900 shadow-md">
              <p className="text-gray-400 text-sm">Total Scans</p>
              <h2 className="text-xl text-[#00ff41] font-bold">
                {history.length}
              </h2>
            </div>

            {/* TOTAL VULNS */}
            <div className="bg-[#0d1117] p-4 rounded-xl border border-red-900 shadow-md">
              <p className="text-gray-400 text-sm">Total Issues</p>
              <h2 className="text-xl text-red-400 font-bold">
                {totalVulns}
              </h2>
            </div>

            {/* CRITICAL */}
            <div className="bg-[#0d1117] p-4 rounded-xl border border-red-500 shadow-md">
              <p className="text-gray-400 text-sm">Critical</p>
              <h2 className="text-xl text-red-500 font-bold">
                {critical}
              </h2>
            </div>

            {/* MEDIUM */}
            <div className="bg-[#0d1117] p-4 rounded-xl border border-yellow-500 shadow-md">
              <p className="text-gray-400 text-sm">Medium</p>
              <h2 className="text-xl text-yellow-400 font-bold">
                {medium}
              </h2>
            </div>

            {/* LOW */}
            <div className="bg-[#0d1117] p-4 rounded-xl border border-green-500 shadow-md">
              <p className="text-gray-400 text-sm">Low</p>
              <h2 className="text-xl text-green-400 font-bold">
                {low}
              </h2>
            </div>

          </div>

          <div className="grid md:grid-cols-2 gap-6">

            {/* 🎯 DONUT CHART */}
            <div className="bg-[#020202] border border-green-900 p-5 rounded-xl shadow-md h-[260px] flex flex-col items-center justify-center">

              <h2 className="text-green-400 text-sm mb-3">
                🎯 Risk Distribution
              </h2>

              <div className="relative w-[200px] h-[200px]">

                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskData.data}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {riskData.data.map((entry, index) => (
                        <Cell
                          key={index}
                          fill={
                            entry.name === "Critical"
                              ? "#ff1a1a"
                              : entry.name === "Medium"
                                ? "#ffaa00"
                                : "#00ff41"
                          }
                        />
                      ))}
                    </Pie>

                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* CENTER */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-white">
                    {riskData.total}
                  </span>
                  <span className="text-xs text-gray-400">
                    Total Issues
                  </span>
                </div>

              </div>

            </div>

            {/* 🛡 SYSTEM RISK */}
            <div className="bg-[#020202] border border-green-900 p-5 rounded-xl flex flex-col items-center justify-center shadow-md h-[260px]">

              <h2 className="text-green-400 text-sm mb-3">
                🛡 System Risk Level
              </h2>

              <div className="relative w-36 h-36">

                <svg className="w-full h-full -rotate-90">

                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke="#1f2937"
                    strokeWidth="8"
                    fill="none"
                  />

                  <circle
                    cx="72"
                    cy="72"
                    r="60"
                    stroke={riskPercent > 60 ? "#ff1a1a" : "#00ff41"}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="377"
                    strokeDashoffset={377 - (377 * riskPercent) / 100}
                    strokeLinecap="round"
                  />

                </svg>

                <div className="absolute inset-0 flex items-center justify-center text-green-400 font-bold text-lg">
                  {riskPercent}%
                </div>

              </div>

            </div>

          </div>
          <div className="bg-[#020202] border border-green-900 p-5 rounded-xl shadow-md">

            <h2 className="text-green-400 text-sm mb-3 tracking-wide">
              📊 Scan Risk vs Issues Analysis
            </h2>

            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={getPerScanData()}>

                <XAxis
                  dataKey="name"
                  stroke="#00ff41"
                  tick={{ fill: "#00ff41", fontSize: 12 }}
                />

                <YAxis
                  stroke="#00ff41"
                  tick={{ fill: "#00ff41", fontSize: 12 }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020202",
                    border: "1px solid #00ff41",
                    color: "#00ff41"
                  }}
                />

                {/* 🟢 Issues Line */}
                <Line
                  type="monotone"
                  dataKey="issues"
                  stroke="#00ff41"
                  strokeWidth={2}
                  dot={false}
                />

                {/* 🔴 Risk Line */}
                <Line
                  type="monotone"
                  dataKey="risk"
                  stroke="#ff1a1a"
                  strokeWidth={2}
                  dot={false}
                />

              </LineChart>
            </ResponsiveContainer>

            {/* 🔥 LEGEND */}
            <div className="flex justify-center gap-6 mt-4 text-sm">

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#00ff41] rounded-full"></div>
                <span className="text-gray-300">Total Issues</span>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#ff1a1a] rounded-full"></div>
                <span className="text-gray-300">Risk Impact</span>
              </div>

            </div>

          </div>

          {/* ================= INSIGHTS ================= */}
          <div className="bg-[#020202] border border-green-900 p-5 rounded-xl">

            <h2 className="text-green-400 text-sm mb-3">
              🧠 AI Security Insights
            </h2>

            {getInsights().map((insight, i) => (
              <p key={i} className="text-gray-300 mb-2">
                {insight}
              </p>
            ))}

          </div>

        </div>
      </div>
    </div >
  );
}

export default Analytics;