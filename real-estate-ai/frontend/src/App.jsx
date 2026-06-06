import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import BuyerDashboardPage from "../pages/BuyerDashboardPage";
import AgentKanbanPage from "../pages/AgentKanbanPage";
import "./styles.css";

export default function App() {
  return (
    <Router>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <header className="glass-panel" style={{ margin: "24px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Real Estate AI</h1>
            <p className="text-muted" style={{ margin: 0, fontSize: "0.9rem" }}>Malaysia Property Intelligence</p>
          </div>
          <nav className="flex gap-4">
            <Link to="/" className="btn btn-primary" style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)" }}>Buyer Dashboard</Link>
            <Link to="/agent" className="btn btn-primary">Agent Kanban</Link>
          </nav>
        </header>

        <main style={{ flex: 1, padding: "0 24px 48px" }}>
          <Routes>
            <Route path="/" element={<BuyerDashboardPage />} />
            <Route path="/agent" element={<AgentKanbanPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
