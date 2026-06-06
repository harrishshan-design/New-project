import React, { useEffect, useState } from "react";
import { mockHotLeads } from "../src/mockData";

const API_BASE_URL = "http://localhost:5000/api";

function formatDate(value) {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-MY", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function buildWhatsappLink(lead) {
  const phone = String(lead.phone || "").replace(/[^\d]/g, "");
  const message = encodeURIComponent(lead.whatsappMessage || "");
  return `https://wa.me/${phone}?text=${message}`;
}

function priorityTone(score) {
  if (score >= 85) {
    return {
      border: "#fca5a5",
      background: "#fff1f2",
      label: "Urgent",
      labelBg: "#b91c1c",
    };
  }

  if (score >= 60) {
    return {
      border: "#93c5fd",
      background: "#eff6ff",
      label: "Priority",
      labelBg: "#1d4ed8",
    };
  }

  return {
    border: "#cbd5e1",
    background: "#f8fafc",
    label: "Watch",
    labelBg: "#475569",
  };
}

export default function AgentHotLeadsInbox() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadHotLeads() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/leads/hot`);
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Unable to load hot leads");
        }

        if (active) {
          setLeads(payload.data || []);
          setError("");
          setIsOfflineMode(false);
        }
      } catch (_requestError) {
        if (active) {
          setLeads(mockHotLeads);
          setError("");
          setIsOfflineMode(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadHotLeads();
    const intervalId = setInterval(loadHotLeads, 15000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <section style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>Agent View</p>
          <h2 style={styles.title}>Hot Leads Inbox</h2>
          <p style={styles.subtitle}>
            Buyers with strong intent are surfaced here instantly so agents can respond fast.
          </p>
          {isOfflineMode ? (
            <div style={styles.offlineBadge}>Offline Demo Mode: using local hot lead samples</div>
          ) : null}
        </div>
        <div style={styles.kpiCard}>
          <span style={styles.kpiLabel}>Hot Leads Live</span>
          <strong style={styles.kpiValue}>{leads.length}</strong>
        </div>
      </div>

      {loading ? <div style={styles.stateBox}>Loading hot leads...</div> : null}
      {error ? <div style={styles.errorBox}>{error}</div> : null}

      {!loading && !error && !leads.length ? (
        <div style={styles.emptyBox}>
          No hot leads yet. Once a buyer views the same property 3 times, books a viewing, or
          stays engaged long enough, they will appear here.
        </div>
      ) : null}

      {!loading && !error && leads.length ? (
        <div style={styles.grid}>
          {leads.map((lead) => {
            const tone = priorityTone(lead.score);

            return (
              <article
                key={lead.id}
                style={{
                  ...styles.card,
                  background: tone.background,
                  borderColor: tone.border,
                }}
              >
                <div style={styles.cardTop}>
                  <span style={{ ...styles.priorityBadge, background: tone.labelBg }}>
                    {tone.label}
                  </span>
                  <span style={styles.timestamp}>{formatDate(lead.updatedAt)}</span>
                </div>

                <h3 style={styles.leadName}>{lead.name}</h3>
                <p style={styles.leadLocation}>{lead.location}</p>

                <div style={styles.scoreStrip}>
                  <div>
                    <span style={styles.metricLabel}>Lead Score</span>
                    <strong style={styles.metricValue}>{lead.score}%</strong>
                  </div>
                  <div>
                    <span style={styles.metricLabel}>Assigned Agent</span>
                    <strong style={styles.metricValue}>
                      {lead.assignedAgent?.name || lead.assignedAgent}
                    </strong>
                  </div>
                </div>

                <div style={styles.signalRow}>
                  {lead.tags.map((tag) => (
                    <span key={tag} style={styles.signalChip}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div style={styles.detailGrid}>
                  <div style={styles.detailCard}>
                    <span style={styles.metricLabel}>Property Interest</span>
                    <strong style={styles.detailValue}>{lead.propertyTitle || "Hidden listing"}</strong>
                  </div>
                  <div style={styles.detailCard}>
                    <span style={styles.metricLabel}>WhatsApp</span>
                    <strong style={styles.detailValue}>{lead.phone}</strong>
                  </div>
                </div>

                <div style={styles.messageBox}>
                  <span style={styles.metricLabel}>Auto Follow-Up</span>
                  <p style={styles.messageText}>{lead.whatsappMessage}</p>
                </div>

                <div style={styles.actionRow}>
                  <a
                    href={buildWhatsappLink(lead)}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.primaryAction}
                  >
                    Message on WhatsApp
                  </a>
                  <button type="button" style={styles.secondaryAction}>
                    Mark Contacted
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

const styles = {
  wrapper: {
    padding: "32px",
    borderRadius: "28px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,247,250,0.98) 100%)",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.08)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    flexWrap: "wrap",
    marginBottom: "24px",
  },
  eyebrow: {
    margin: 0,
    color: "#2563eb",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontSize: "12px",
  },
  title: {
    margin: "8px 0 6px",
    fontSize: "32px",
    color: "#0f172a",
  },
  subtitle: {
    margin: 0,
    color: "#475569",
    maxWidth: "620px",
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
  kpiCard: {
    minWidth: "180px",
    padding: "18px 20px",
    borderRadius: "20px",
    background: "linear-gradient(135deg, #0f172a, #1d4ed8)",
    color: "#fff",
  },
  kpiLabel: {
    display: "block",
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    opacity: 0.75,
    marginBottom: "8px",
  },
  kpiValue: {
    fontSize: "30px",
    lineHeight: 1,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "18px",
  },
  card: {
    padding: "20px",
    borderRadius: "22px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    marginBottom: "14px",
  },
  priorityBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 10px",
    borderRadius: "999px",
    color: "#fff",
    fontWeight: 700,
    fontSize: "11px",
    letterSpacing: "0.04em",
  },
  timestamp: {
    color: "#64748b",
    fontSize: "12px",
  },
  leadName: {
    margin: "0 0 4px",
    color: "#0f172a",
    fontSize: "24px",
  },
  leadLocation: {
    margin: "0 0 16px",
    color: "#475569",
  },
  scoreStrip: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginBottom: "14px",
  },
  metricLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "6px",
  },
  metricValue: {
    color: "#0f172a",
    fontSize: "15px",
  },
  signalRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "14px",
  },
  signalChip: {
    display: "inline-flex",
    alignItems: "center",
    padding: "7px 10px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.75)",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 600,
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginBottom: "14px",
  },
  detailCard: {
    padding: "12px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.8)",
  },
  detailValue: {
    color: "#0f172a",
    fontSize: "14px",
  },
  messageBox: {
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.85)",
    marginBottom: "14px",
  },
  messageText: {
    margin: 0,
    color: "#1e293b",
    lineHeight: 1.6,
  },
  actionRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  primaryAction: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: "14px",
    background: "#16a34a",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 700,
    flex: 1,
  },
  secondaryAction: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "12px 16px",
    borderRadius: "14px",
    background: "#fff",
    color: "#0f172a",
    border: "1px solid #cbd5e1",
    fontWeight: 700,
    cursor: "pointer",
    flex: 1,
  },
  stateBox: {
    padding: "18px",
    borderRadius: "18px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 600,
  },
  errorBox: {
    padding: "18px",
    borderRadius: "18px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontWeight: 600,
  },
  emptyBox: {
    padding: "20px",
    borderRadius: "18px",
    background: "#f8fafc",
    color: "#475569",
    lineHeight: 1.6,
  },
};
