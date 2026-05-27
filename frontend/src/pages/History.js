import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import StatsCards from "../components/StatsCards";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    Radar
} from "recharts";

function History() {

    const [history, setHistory] = useState([]);
    const [selectedScan, setSelectedScan] = useState(null);
    const [selectedCVE, setSelectedCVE] = useState(null);
    const [search, setSearch] = useState("");
    const [showCriticalOnly, setShowCriticalOnly] = useState(false);
    const [pulseData, setPulseData] = useState([]);

    // 🔥 FETCH HISTORY
    const fetchHistory = async () => {
        try {
            const res = await axios.get("http://localhost:8000/history");
            setHistory(res.data.history);
        } catch {
            alert("Failed to load history ❌");
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    // 🔥 DELETE
    const deleteScan = async (id) => {
        if (!window.confirm("Delete this scan?")) return;
        await axios.delete(`http://localhost:8000/history/${id}`);
        fetchHistory();
    };

    // 🔥 DOWNLOAD
    const downloadReport = (id) => {
        if (!id) return alert("No report available");
        window.open(`http://localhost:8000/download-report/${id}`, "_blank");
    };

    // 🔥 RISK %
    const getRiskPercent = () => {
        if (!selectedScan) return 0;

        let total = 0;
        let critical = 0;

        selectedScan.results.forEach((t) => {
            t.vulnerabilities?.forEach((v) => {
                total++;
                if (v.risk === "Critical") critical++;
            });
        });

        if (total === 0) return 0;
        return Math.floor((critical / total) * 100);
    };

    // 🔥 RADAR DATA
    const getRadarData = () => {
        if (!selectedScan) return [];

        const counts = { Critical: 0, Medium: 0, Low: 0 };

        selectedScan.results.forEach((t) => {
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

    // 🔥 LIVE SIGNAL (SEMI REAL)
    useEffect(() => {
        if (!selectedScan) return;

        let index = 0;

        const interval = setInterval(() => {

            const allVulns = selectedScan.results.flatMap(
                (t) => t.vulnerabilities || []
            );

            if (allVulns.length === 0) return;

            const v = allVulns[index % allVulns.length];

            // 🔥 SMART BASE VALUE (REALISTIC)
            let base = 20;

            if (v.risk === "Critical") base = 85;
            else if (v.risk === "Medium") base = 55;
            else base = 30;

            // 🔥 ADD NATURAL VARIATION (SMOOTH SIGNAL)
            const variation = Math.sin(index / 2) * 5; // wave pattern
            const noise = Math.random() * 6 - 3;       // small randomness

            const value = Math.max(10, Math.min(100, base + variation + noise));

            setPulseData((prev) => {
                const updated = [...prev, { value: Math.floor(value) }];
                return updated.slice(-30); // keep last 30 points
            });

            index++;

        }, 600); // slightly faster = more "live"

        return () => clearInterval(interval);

    }, [selectedScan]);

    const getTrendData = () => {
        if (!selectedScan) return [];

        let cumulative = 0;

        return selectedScan.results.map((t, i) => {
            const count = t.vulnerabilities?.length || 0;
            cumulative += count;

            return {
                name: `T${i + 1}`,
                issues: cumulative
            };
        });
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
                        📁 SCAN HISTORY
                    </h1>

                    {/* 🔍 SEARCH */}
                    <input
                        type="text"
                        placeholder="🔍 Search targets..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full p-3 bg-black border border-green-500 text-[#00ff41] rounded-lg outline-none focus:shadow-[0_0_10px_#00ff41]"
                    />

                    {/* ================= LIST ================= */}
                    {!selectedScan && (
                        <div className="space-y-4">

                            {history.length === 0 ? (
                                <p className="text-gray-500">No scans available</p>
                            ) : (
                                history
                                    .filter((item) =>
                                        item.targets.toLowerCase().includes(search.toLowerCase())
                                    )
                                    .map((item, i) => (
                                        <div
                                            key={i}
                                            onClick={() => setSelectedScan(item)}
                                            className="
                                                bg-[#0d1117]/80 backdrop-blur-md
                                                border border-green-900
                                                p-4 rounded-xl
                                                cursor-pointer
                                                hover:shadow-[0_0_15px_#00ff41]
                                                hover:scale-[1.01]
                                                transition
                                            "
                                        >
                                            <p className="text-[#00ff41] font-semibold text-lg">
                                                🎯 {item.targets}
                                            </p>

                                            <p className="text-sm text-gray-400 mt-1">
                                                🕒 {new Date(item.timestamp).toLocaleString()}
                                            </p>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteScan(item._id);
                                                }}
                                                className="mt-3 text-red-500 text-sm hover:text-red-300"
                                            >
                                                🗑 Delete
                                            </button>
                                        </div>
                                    ))
                            )}

                        </div>
                    )}

                    {/* ================= DETAILS ================= */}
                    {selectedScan && (
                        <div className="bg-[#0d1117]/80 backdrop-blur-md p-6 rounded-2xl border border-green-900 shadow-[0_0_20px_#00ff41]">

                            {/* 🔙 BACK */}
                            <button
                                onClick={() => setSelectedScan(null)}
                                className="mb-4 bg-gray-700 px-4 py-1 rounded hover:bg-gray-600"
                            >
                                ← Back
                            </button>

                            {/* FILTER */}
                            <button
                                onClick={() => setShowCriticalOnly(!showCriticalOnly)}
                                className="mb-4 ml-2 bg-yellow-600 px-4 py-1 rounded hover:bg-yellow-500"
                            >
                                {showCriticalOnly ? "Show All" : "Show Critical Only"}
                            </button>

                            <h2 className="text-[#00ff41] text-xl font-semibold mb-4">
                                🎯 {selectedScan.targets}
                            </h2>

                            {/* 🔥 DASHBOARD STATS (SAME UI) */}
                            <StatsCards data={{ results: selectedScan.results }} />

                            {/* 🔥 GLOBAL GRAPHS */}
                            <div className="grid md:grid-cols-2 gap-6 mb-6">

                                {/* LIVE SIGNAL */}
                                <div className="bg-[#020202] border border-green-900 p-5 rounded-xl shadow-[0_0_15px_#00ff41]">
                                    <h2 className="text-green-400 text-sm mb-3">⚡ Live Threat Signal</h2>

                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={pulseData}>
                                            <Line type="monotone" dataKey="value" stroke="#00ff41" dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* RISK RING */}
                                <div className="bg-[#020202] border border-green-900 p-5 rounded-xl flex flex-col shadow-[0_0_10px_#00ff41]">

                                    <h2 className="text-green-400 text-sm mb-4 tracking-wide">
                                        🛡 SYSTEM RISK LEVEL
                                    </h2>

                                    {/* CENTER ONLY GRAPH */}
                                    <div className="w-full flex justify-center mt-2">

                                        <div className="relative w-40 h-40">

                                            <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90">

                                                <circle
                                                    cx="100"
                                                    cy="100"
                                                    r="70"
                                                    stroke="#1f2937"
                                                    strokeWidth="12"
                                                    fill="none"
                                                />

                                                <circle
                                                    cx="100"
                                                    cy="100"
                                                    r="70"
                                                    stroke={getRiskPercent() > 60 ? "#ff1a1a" : "#00ff41"}
                                                    strokeWidth="12"
                                                    fill="none"
                                                    strokeDasharray="440"
                                                    strokeDashoffset={440 - (440 * getRiskPercent()) / 100}
                                                    strokeLinecap="round"
                                                    className="transition-all duration-700"
                                                />

                                            </svg>

                                            <div className="absolute inset-0 flex flex-col items-center justify-center">

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

                                {/* 📈 THREAT ACTIVITY TREND */}
                                <div className="bg-[#020202] border border-green-900 p-5 rounded-xl shadow-[0_0_15px_#00ff41]">

                                    <h2 className="text-green-400 text-sm mb-3 tracking-wide">
                                        📈 Threat Activity Trend
                                    </h2>

                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={getTrendData()}>
                                            <XAxis dataKey="name" stroke="#00ff41" />
                                            <YAxis stroke="#00ff41" />

                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#020202",
                                                    border: "1px solid #00ff41"
                                                }}
                                            />

                                            <Line
                                                type="monotone"
                                                dataKey="issues"
                                                stroke="#00ff41"
                                                strokeWidth={2}
                                                dot={false}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>

                                </div>


                                {/* 🛡 ATTACK SURFACE MAP */}
                                <div className="bg-[#020202] border border-green-900 p-5 rounded-xl shadow-[0_0_15px_#00ff41]">

                                    <h2 className="text-green-400 text-sm mb-3">
                                        🛡 Attack Surface Map
                                    </h2>

                                    <ResponsiveContainer width="100%" height={250}>
                                        <RadarChart data={getRadarData()}>
                                            <PolarGrid stroke="#1f2937" />
                                            <PolarAngleAxis dataKey="subject" stroke="#00ff41" />

                                            <Radar
                                                dataKey="value"
                                                stroke="#00ff41"
                                                fill="#00ff41"
                                                fillOpacity={0.3}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>

                                </div>

                            </div>

                            {/* 🔥 RESULTS */}
                            {selectedScan.results.map((target, i) => (
                                <div key={i} className="mb-6">

                                    <p className="text-green-400 font-semibold mb-2">
                                        Target: {target.target}
                                    </p>

                                    {target.scan?.map((s, j) => (
                                        <p key={j} className="text-gray-300 text-sm">
                                            Port {s.port} | {s.service} | {s.product}
                                        </p>
                                    ))}

                                    {target.vulnerabilities
                                        ?.filter((v) =>
                                            showCriticalOnly ? v.risk === "Critical" : true
                                        )
                                        .map((v, k) => (
                                            <div
                                                key={k}
                                                className="bg-[#1a0000]/80 border border-red-600 p-4 rounded-xl mt-3 shadow-[0_0_12px_red]"
                                            >
                                                <p><b>Port:</b> {v.port}</p>
                                                <p><b>Risk:</b> {v.risk} ({v.score})</p>
                                                <p className="text-gray-300 mt-1">{v.issue}</p>

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
                                                                    className="px-3 py-1 bg-black border border-yellow-500 text-yellow-300 text-xs rounded-full cursor-pointer hover:bg-yellow-500 hover:text-black"
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

                            {/* DOWNLOAD */}
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={() => downloadReport(selectedScan._id)}
                                    className="bg-[#00ff41] text-black px-6 py-2 rounded hover:scale-105"
                                >
                                    ⬇ Download Report
                                </button>
                            </div>

                        </div>
                    )}

                </div>
            </div>

            {/* CVE MODAL */}
            {selectedCVE && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">

                    <div className="bg-[#020202] border border-green-500 p-6 rounded-xl w-[520px]">

                        <h2 className="text-[#00ff41] text-lg font-bold mb-3">
                            🧠 {selectedCVE.cve}
                        </h2>

                        <div className="mb-3">
                            <span className="px-3 py-1 bg-yellow-400 text-black rounded-full text-xs">
                                {selectedCVE.severity || "Unknown"}
                            </span>
                        </div>

                        <div className="bg-[#0d1117] p-4 rounded text-gray-300 text-sm">
                            {selectedCVE.description || "No description available"}
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={() => setSelectedCVE(null)}
                                className="bg-red-600 px-4 py-2 rounded"
                            >
                                Close
                            </button>
                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}

export default History;