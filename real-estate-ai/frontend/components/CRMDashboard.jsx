import React, { useEffect, useState } from "react";
import { mockCRM } from "../src/mockData";

const API_BASE_URL = "http://localhost:5000/api";

function StatCard({ label, value, accent }) {
  return (
    <div
      style={{
        padding: "18px",
        borderRadius: "18px",
        background: "#fff",
        border: `1px solid ${accent}`,
        boxShadow: "0 10px 24px rgba(15,23,42,0.05)",
      }}
    >
      <span style={{ display: "block", color: "#64748b", fontSize: "12px", marginBottom: "8px" }}>
        {label}
      </span>
      <strong style={{ color: "#0f172a", fontSize: "28px" }}>{value}</strong>
    </div>
  );
}

export default function CRMDashboard() {
  const [crm, setCrm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCRM() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/leads/crm`);
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Unable to load CRM dashboard");
        }

        if (active) {
          setCrm(payload.data);
          setError("");
          setIsOfflineMode(false);
        }
      } catch (_requestError) {
        if (active) {
          setCrm(mockCRM);
          setError("");
          setIsOfflineMode(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCRM();
    const intervalId = setInterval(loadCRM, 15000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return <div style={styles.state}>Loading CRM dashboard...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  if (!crm) {
    return null;
  }

  return (
    <section style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Automation</p>
          <h2 style={styles.title}>CRM Dashboard</h2>
          <p style={styles.subtitle}>
            Track lead volume, status movement, agent distribution, and conversion health in one place.
          </p>
          {isOfflineMode ? (
            <div style={styles.offlineBadge}>Offline Demo Mode: CRM numbers are sample data</div>
          ) : null}
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard label="Total Leads" value={crm.totalLeads} accent="#cbd5e1" />
        <StatCard label="Hot Leads" value={crm.hotLeads} accent="#fca5a5" />
        <StatCard label="Booked Viewings" value={crm.bookedViewing} accent="#93c5fd" />
        <StatCard
          label="Conversions"
          value={`${crm.converted} (${crm.conversionRate}%)`}
          accent="#86efac"
        />
      </div>

      <div style={styles.columns}>
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Pipeline Status</h3>
          <div style={styles.pipelineGrid}>
            {Object.entries(crm.pipeline).map(([key, value]) => (
              <div key={key} style={styles.pipelineCard}>
                <span style={styles.pipelineLabel}>{key}</span>
                <strong style={styles.pipelineValue}>{value}</strong>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Lead Distribution</h3>
          <div style={styles.distributionList}>
            {crm.distribution.map((agent) => (
              <div key={agent.id} style={styles.distributionRow}>
                <div>
                  <strong style={styles.agentName}>{agent.name}</strong>
                  <p style={styles.agentPhone}>{agent.phone}</p>
                </div>
                <div style={styles.distributionMeta}>
                  <span>{agent.totalLeads} leads</span>
                  <span>{agent.hotLeads} hot</span>
                  <span>{agent.converted} converted</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  wrapper: {
    marginTop: "24px",
    padding: "32px",
    borderRadius: "28px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,246,250,0.98) 100%)",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.08)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
  },
  header: {
    marginBottom: "22px",
  },
  eyebrow: {
    margin: 0,
    color: "#7c3aed",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: "12px",
  },
  title: {
    margin: "8px 0 6px",
    fontSize: "30px",
    color: "#0f172a",
  },
  subtitle: {
    margin: 0,
    color: "#475569",
    lineHeight: 1.6,
  },
  offlineBadge: {
    display: "inline-flex",
    alignItems: "center",
    marginTop: "12px",
    padding: "8px 12px",
    borderRadius: "999px",
    background: "#fff7ed",
    color: "#c2410c",
    fontSize: "12px",
    fontWeight: 700,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "14px",
    marginBottom: "22px",
  },
  columns: {
    display: "grid",
    gridTemplateColumns: "1.1fr 1fr",
    gap: "18px",
  },
  panel: {
    padding: "20px",
    borderRadius: "22px",
    background: "#fff",
    border: "1px solid #e2e8f0",
  },
  panelTitle: {
    margin: "0 0 16px",
    color: "#0f172a",
    fontSize: "20px",
  },
  pipelineGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
    gap: "12px",
  },
  pipelineCard: {
    padding: "14px",
    borderRadius: "16px",
    background: "#f8fafc",
  },
  pipelineLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    textTransform: "capitalize",
    marginBottom: "8px",
  },
  pipelineValue: {
    fontSize: "24px",
    color: "#0f172a",
  },
  distributionList: {
    display: "grid",
    gap: "12px",
  },
  distributionRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
    padding: "14px",
    borderRadius: "16px",
    background: "#f8fafc",
  },
  agentName: {
    display: "block",
    color: "#0f172a",
  },
  agentPhone: {
    margin: "4px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },
  distributionMeta: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    color: "#334155",
    fontSize: "13px",
    fontWeight: 600,
    justifyContent: "flex-end",
  },
  state: {
    marginTop: "24px",
    padding: "18px",
    borderRadius: "18px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 600,
  },
  error: {
    marginTop: "24px",
    padding: "18px",
    borderRadius: "18px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontWeight: 600,
  },
};
