import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatsCards from "../components/StatsCards";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer
} from "recharts";

function Dashboard() {

  const [ip, setIp] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const logRef = useRef(null);
  const [selectedCVE, setSelectedCVE] = useState(null);
  const [reportId, setReportId] = useState(null);
  const eventRef = useRef(null);


  // ✅ FIXED AUTH CHECK
  useEffect(() => {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      window.location.replace("/login");
    }
  }, []);

  const playBeep = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    for (let i = 0; i < 3; i++) {
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(600 + i * 100, ctx.currentTime);

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(ctx.currentTime + i * 0.1);
      oscillator.stop(ctx.currentTime + i * 0.15);
    }
  };

  const handleScan = () => {
    if (!ip) return alert("Enter target");

    if (eventRef.current) {
      eventRef.current.close();
    }

    playBeep();

    setLoading(true);
    setLogs([]);
    setData(null);
    setProgress(0);

    const eventSource = new EventSource(
      `http://localhost:8000/scan-stream/${ip}`
    );

    eventRef.current = eventSource;

    eventSource.onmessage = (event) => {
      const parsed = JSON.parse(event.data);

      if (parsed.log) {
        setLogs((prev) => [
          ...prev,
          { text: parsed.log, type: parsed.type || "normal" }
        ]);
      }

      if (parsed.progress !== undefined) {
        setProgress(parsed.progress);
      }

      if (parsed.done) {

        // ✅ SCAN COMPLETE MESSAGE
        setLogs((prev) => [
          ...prev,
          { text: "[+] Scan complete ✅", type: "normal" }
        ]);

        setData({ results: parsed.results });
        setReportId(parsed.report_id);

        localStorage.setItem(
          "scanData",
          JSON.stringify({ results: parsed.results })
        );
        localStorage.setItem("reportId", parsed.report_id);

        setLoading(false);
        eventSource.close();
      }
    };

    eventSource.onerror = () => {
      setLoading(false);
      eventSource.close();
      alert("Scan failed");
    };
  };

  const getChartData = () => {
    if (!data) return [];

    const counts = { Critical: 0, Medium: 0, Low: 0 };

    data.results.forEach((t) => {
      t.vulnerabilities?.forEach((v) => {
        counts[v.risk] = (counts[v.risk] || 0) + 1;
      });
    });

    return Object.keys(counts).map((k) => ({
      name: k,
      value: counts[k],
    }));
  };

  useEffect(() => {

    if (eventRef.current) {
      eventRef.current.close();
    }

    setLogs([]);
    setProgress(0);
    setLoading(false);

    const savedData = localStorage.getItem("scanData");
    const savedReportId = localStorage.getItem("reportId");

    if (savedData) setData(JSON.parse(savedData));
    if (savedReportId) setReportId(savedReportId);

  }, []);

  const downloadReport = (id) => {
    if (!id) return alert("No report available");
    window.open(`http://localhost:8000/download-report/${id}`, "_blank");
  };

  useEffect(() => {
    return () => {
      if (eventRef.current) {
        eventRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const [pulseData, setPulseData] = useState([]);
  const [alert, setAlert] = useState(false);

  useEffect(() => {
    if (!data) return;

    let index = 0;

    const interval = setInterval(() => {

      const allVulns = data.results.flatMap(
        (t) => t.vulnerabilities || []
      );

      if (allVulns.length === 0) return;

      const base = allVulns[index % allVulns.length];

      // 🎯 REAL + SMALL VARIATION
      let baseValue = 10;

      if (base.risk === "Critical") {
        baseValue = 80;
        setAlert(true);

        setTimeout(() => setAlert(false), 1000);
      }
      else if (base.risk === "Medium") baseValue = 50;
      else baseValue = 25;

      const value = baseValue + Math.floor(Math.random() * 10 - 5);

      setPulseData((prev) => {
        const updated = [...prev, { value }];
        return updated.slice(-25); // keep last 25 points
      });

      index++;

    }, 700);

    return () => clearInterval(interval);

  }, [data]);

  const getRiskPercent = () => {
    if (!data) return 0;

    let total = 0;
    let critical = 0;

    data.results.forEach((t) => {
      t.vulnerabilities?.forEach((v) => {
        total++;
        if (v.risk === "Critical") critical++;
      });
    });

    if (total === 0) return 0;

    return Math.min(100, Math.floor((critical / total) * 100));
  };

  // 🔥 LINE GRAPH (SIMULATED TREND)
  const getTrendData = () => {
    if (!data) return [];

    return data.results.map((t, i) => ({
      name: t.target,   // ✅ actual target
      issues: t.vulnerabilities?.length || 0
    }));
  };

  // 🔥 RADAR GRAPH (REAL DISTRIBUTION)
  const getRadarData = () => {
    if (!data) return [];

    const counts = { Critical: 0, Medium: 0, Low: 0 };

    data.results.forEach((t) => {
      t.vulnerabilities?.forEach((v) => {
        counts[v.risk] = (counts[v.risk] || 0) + 1;
      });
    });

    return [
      { subject: "Critical", value: counts.Critical },
      { subject: "Medium", value: counts.Medium },
      { subject: "Low", value: counts.Low }
    ];
  };
  const getTargets = () => {
    if (!data) return [];

    return data.results.map((t) => t.target);
  };

  return (
    <div className="flex text-white min-h-screen relative">

      <div className="matrix-bg"></div>

      <Sidebar />

      <div className="flex-1">

        <Topbar />

        <div className="p-6 max-w-6xl mx-auto space-y-6">

          {/* 🔥 TITLE */}
          <h1 className="text-2xl font-bold text-[#00ff41] tracking-widest drop-shadow-[0_0_8px_#00ff41]">
            AI RED TEAM CONTROL PANEL
          </h1>

          {/* ⚠️ WARNING */}
          {loading && (
            <div className="bg-yellow-900/20 border border-yellow-500 text-yellow-300 p-3 rounded shadow-[0_0_15px_yellow] backdrop-blur-md">
              ⚠️ Scan in progress... Please stay on this page.
            </div>
          )}

          {/* 🔥 INPUT CARD */}
          <div className="bg-[#0d1117]/80 backdrop-blur-md p-4 rounded-xl border border-green-900 flex gap-3 shadow-[0_0_25px_#00ff41]">

            <input
              value={ip}
              onChange={(e) => setIp(e.target.value)}
              className="flex-1 p-2 bg-black border border-green-500 text-[#00ff41] rounded outline-none focus:shadow-[0_0_12px_#00ff41]"
              placeholder="Enter targets"
            />

            <button
              onClick={handleScan}
              disabled={loading}
              className="bg-[#00ff41] text-black px-5 py-2 rounded font-bold shadow-[0_0_15px_#00ff41] hover:scale-105 transition disabled:opacity-50"
            >
              {loading ? "Scanning..." : "⚡ Scan"}
            </button>

          </div>

          {/* 🔥 PROGRESS */}
          {loading && (
            <div className="bg-[#020202] p-3 rounded border border-green-900 shadow-[0_0_15px_#00ff41]">
              <div className="w-full bg-gray-800 h-3 rounded">
                <div
                  className="bg-[#00ff41] h-3 rounded shadow-[0_0_10px_#00ff41]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-green-400 mt-1">{progress}% completed</p>
            </div>
          )}

          {/* 🔥 TERMINAL */}
          {logs.length > 0 && (
            <div
              ref={logRef}
              className="bg-black border border-green-900 p-4 rounded-xl text-[#00ff41] text-sm font-mono h-44 overflow-y-auto shadow-[0_0_20px_#00ff41]"
            >
              {logs.map((log, i) => (
                <p key={i} className="animate-pulse">
                  {log.text}
                </p>
              ))}
            </div>
          )}

          {data && (
            <div className="bg-[#020202] border border-green-900 p-4 rounded-xl shadow-md">

              <h2 className="text-[#00ff41] text-sm mb-2 tracking-wide">
                🎯 Target(s)
              </h2>

              <div className="flex flex-wrap gap-2">

                {getTargets().map((t, i) => (
                  <div
                    key={i}
                    className="
            px-3 py-1
            bg-black
            border border-green-500
            text-[#00ff41]
            text-xs
            rounded-full
            shadow-sm
          "
                  >
                    {t}
                  </div>
                ))}

              </div>

            </div>
          )}

          {/* 🔥 STATS */}
          <StatsCards data={data} />

          {data && (
            <div className="grid md:grid-cols-2 gap-6">

              {/* 🔥 LIVE THREAT PULSE */}
              <div className="bg-[#020202] border border-green-900 p-5 rounded-xl shadow-[0_0_15px_#00ff41]">

                <h2 className="text-[#00ff41] text-sm mb-3 tracking-wide">
                  ⚡ LIVE THREAT SIGNAL
                </h2>

                <div className="h-[200px]">

                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={pulseData}>
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#00ff41"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                </div>

              </div>

              {/* 🔥 CYBER RISK RING */}
              <div className="bg-[#020202] border border-green-900 p-5 rounded-xl shadow-[0_0_15px_#00ff41]">

                <h2 className="text-green-400 mb-3 text-sm tracking-wide">
                  🛡 SYSTEM RISK LEVEL
                </h2>

                <div className="flex items-center justify-center w-full">

                  <div className="relative w-40 h-40 flex items-center justify-center">

                    <svg className="w-40 h-40 -rotate-90">

                      {/* 🔘 Background */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#1f2937"
                        strokeWidth="10"
                        fill="none"
                      />

                      {/* 🔥 Progress */}
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke={getRiskPercent() > 60 ? "#ff1a1a" : "#00ff41"}
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={440}
                        strokeDashoffset={440 - (440 * getRiskPercent()) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />

                    </svg>

                    {/* 🔢 CENTER VALUE */}
                    <div className="absolute flex flex-col items-center justify-center">

                      <span className="text-[#00ff41] text-2xl font-bold">
                        {getRiskPercent()}%
                      </span>

                      <span className="text-xs text-gray-400 mt-1">
                        Risk
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

          {data && (
            <div className="grid md:grid-cols-2 gap-6">

              {/* 🔥 TREND GRAPH */}
              <div className="bg-[#020202] border border-green-900 p-5 rounded-xl shadow-[0_0_15px_#00ff41]">

                <h2 className="text-green-400 text-sm mb-4 tracking-wide">
                  📈 Threat Activity Trend
                </h2>

                <div className="w-full h-[250px] flex justify-center items-center">

                  <div className="w-full max-w-[500px] h-full">

                    <ResponsiveContainer width="100%" height="100%">

                      <LineChart data={getTrendData()}>

                        <XAxis
                          dataKey="name"
                          stroke="#00ff41"
                          tick={{ fontSize: 11 }}
                        />

                        <YAxis
                          stroke="#00ff41"
                          tick={{ fontSize: 11 }}
                        />

                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#020202",
                            border: "1px solid #00ff41",
                            borderRadius: "8px"
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="issues"   // ✅ FIXED (you used wrong key before)
                          stroke={
                            pulseData[pulseData.length - 1]?.value > 70
                              ? "#ff1a1a"
                              : "#00ff41"
                          }
                          strokeWidth={2.5}
                          dot={false}
                          activeDot={{ r: 4 }}
                          isAnimationActive={true}
                        />

                      </LineChart>

                    </ResponsiveContainer>

                  </div>

                </div>

              </div>

              {/* 🔥 RADAR GRAPH */}
              <div className="bg-[#0d1117]/80 backdrop-blur-md p-5 rounded-2xl border border-green-900 shadow-[0_0_30px_#00ff41]">

                <h2 className="text-green-400 mb-3 text-sm tracking-wide">
                  🛡 Attack Surface Map
                </h2>

                <RadarChart outerRadius={90} width={400} height={250} data={getRadarData()}>

                  <PolarGrid stroke="#1f2937" />
                  <PolarAngleAxis dataKey="subject" stroke="#00ff41" />

                  <Radar
                    dataKey="value"
                    stroke="#00ff41"
                    fill="#00ff41"
                    fillOpacity={0.3}
                  />

                </RadarChart>

              </div>

            </div>
          )}

          {/* 🔥 RESULTS */}
          {data && (
            <div className="bg-[#0d1117]/80 backdrop-blur-md p-5 rounded-2xl border border-green-900 shadow-[0_0_30px_#00ff41]">

              {data.results.map((target, i) => (
                <div key={i} className="mb-6">

                  <h2 className="text-[#00ff41] text-lg font-semibold mb-2 tracking-wide drop-shadow-[0_0_6px_#00ff41]">
                    🎯 Target: {target.target}
                  </h2>

                  {/* PORTS */}
                  {target.scan?.map((item, j) => (
                    <div key={j} className="text-gray-300 text-sm">
                      Port {item.port} | {item.service} | {item.product}
                    </div>
                  ))}

                  {/* 🔥 VULNERABILITIES */}
                  {target.vulnerabilities?.map((v, k) => (
                    <div
                      key={k}
                      className="bg-[#1a0000]/80 border border-red-600 text-red-400 p-4 rounded-xl shadow-[0_0_15px_red] mt-3 backdrop-blur-md"
                    >
                      <p><b>Port:</b> {v.port}</p>
                      <p><b>Risk:</b> {v.risk}</p>
                      <p className="text-gray-300 mt-1">{v.issue}</p>

                      {/* 🔥 CVE TAGS */}
                      {Array.isArray(v.cves) && v.cves.length > 0 && (
                        <div className="mt-3">

                          <p className="text-yellow-300 text-sm font-bold mb-2">
                            ⚠ Known Vulnerabilities
                          </p>

                          <div className="flex flex-wrap gap-2">

                            {v.cves.map((c, i) => (
                              <div
                                key={i}
                                onClick={() => setSelectedCVE(c)}
                                className="px-3 py-1 bg-black border border-yellow-500 text-yellow-300 text-xs rounded-full cursor-pointer hover:bg-yellow-500 hover:text-black transition shadow-[0_0_10px_#ffaa00]"
                              >
                                🔍 {c.cve}
                              </div>
                            ))}

                          </div>

                        </div>
                      )}

                    </div>
                  ))}

                  {(!target.vulnerabilities || target.vulnerabilities.length === 0) && (
                    <div className="
                      bg-[#001a00]/80
                      border border-green-500
                      p-4 rounded-xl mt-3
                      shadow-[0_0_12px_#00ff41]
                    ">
                      <p className="text-green-400 font-bold">
                        🟢 SYSTEM SECURE
                      </p>

                      <p className="text-gray-400 text-sm mt-1">
                        No vulnerabilities detected on this target
                      </p>
                    </div>
                  )}

                </div>
              ))}

            </div>
          )}

          {/* 🔥 DOWNLOAD */}
          {data && (
            <div className="flex justify-center">
              <button
                onClick={() => downloadReport(reportId)}
                className="bg-[#00ff41] text-black px-6 py-2 rounded shadow-[0_0_15px_#00ff41] hover:scale-105 transition"
              >
                ⬇ Download Report
              </button>
            </div>
          )}

          {/* 🔥 CVE POPUP */}
          {selectedCVE && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

              <div className="bg-[#020202] border border-green-500 p-6 rounded-xl w-[520px] shadow-[0_0_30px_#00ff41]">

                <h2 className="text-[#00ff41] text-lg font-bold mb-3">
                  🧠 {selectedCVE.cve}
                </h2>

                <div className="mb-3">
                  <span className="px-3 py-1 bg-yellow-400 text-black rounded-full text-xs">
                    {selectedCVE.severity || "Unknown"}
                  </span>
                </div>

                <div className="bg-[#0d1117] p-4 rounded text-gray-300 shadow-[0_0_10px_#00ff41]">
                  {selectedCVE.description}
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setSelectedCVE(null)}
                    className="bg-red-600 px-4 py-2 rounded shadow-[0_0_10px_red]"
                  >
                    Close
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Dashboard;