import React from "react";
import AgentHotLeadsInbox from "../components/AgentHotLeadsInbox";
import CRMDashboard from "../components/CRMDashboard";

export default function AgentHotLeadsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "48px 20px",
        background:
          "radial-gradient(circle at top, rgba(248,113,113,0.18), transparent 28%), #fff7f7",
      }}
    >
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <AgentHotLeadsInbox />
        <CRMDashboard />
      </div>
    </main>
  );
}
