import React, { useEffect, useState } from "react";
import { createOfflineLead, mockDealAlerts } from "../src/mockData";

const API_BASE_URL = "http://localhost:5000/api";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function statusTone(status) {
  if (status === "undervalued") {
    return {
      chipBg: "#dcfce7",
      chipColor: "#166534",
      border: "#86efac",
    };
  }

  if (status === "overpriced") {
    return {
      chipBg: "#fee2e2",
      chipColor: "#991b1b",
      border: "#fca5a5",
    };
  }

  return {
    chipBg: "#e0f2fe",
    chipColor: "#0c4a6e",
    border: "#7dd3fc",
  };
}

export default function BuyerDashboard() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [leadForm, setLeadForm] = useState({
    name: "",
    phone: "",
  });
  const [submittingFor, setSubmittingFor] = useState("");
  const [leadState, setLeadState] = useState({});
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadAlerts() {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/properties/deal-alerts`);
        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || "Unable to load deal alerts");
        }

        if (active) {
          setAlerts(payload.data || []);
          setError("");
          setIsOfflineMode(false);
        }
      } catch (_requestError) {
        if (active) {
          setAlerts(mockDealAlerts);
          setError("");
          setIsOfflineMode(true);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadAlerts();

    return () => {
      active = false;
    };
  }, []);

  async function recordEvent(alert, eventType) {
    if (!leadForm.phone) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/leads/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: leadForm.name || "Guest Buyer",
          phone: leadForm.phone,
          propertyId: alert.propertyId,
          propertyTitle: alert.title,
          location: alert.location,
          eventType,
        }),
      });

      const payload = await response.json();
      if (payload.success) {
        setLeadState((current) => ({
          ...current,
          [alert.propertyId]: payload.data,
        }));
        setIsOfflineMode(false);
      }
    } catch (_error) {
      setIsOfflineMode(true);
      setLeadState((current) => ({
        ...current,
        [alert.propertyId]: createOfflineLead(alert, eventType, leadForm),
      }));
    }
  }

  async function captureLead(alert, source) {
    try {
      setSubmittingFor(`${alert.propertyId}:${source}`);
      const response = await fetch(`${API_BASE_URL}/leads/capture`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: leadForm.name,
          phone: leadForm.phone,
          propertyId: alert.propertyId,
          propertyTitle: alert.title,
          location: alert.location,
          source,
          interest: source,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || "Unable to capture lead");
      }

      setLeadState((current) => ({
        ...current,
        [alert.propertyId]: payload.data,
      }));
      setIsOfflineMode(false);

      if (source === "Get Exact Location + Agent Contact") {
        await recordEvent(alert, "book_viewing");
      }
    } catch (_requestError) {
      setIsOfflineMode(true);
      setError("");
      setLeadState((current) => ({
        ...current,
        [alert.propertyId]: createOfflineLead(alert, source, leadForm),
      }));
    } finally {
      setSubmittingFor("");
    }
  }

  return (
    <section style={styles.wrapper}>
      <div style={styles.headerRow}>
        <div>
          <p style={styles.eyebrow}>Buyer Dashboard</p>
          <h2 style={styles.title}>AI Deal Alerts</h2>
          <p style={styles.subtitle}>
            Spot undervalued Malaysian listings before everyone else.
          </p>
          {isOfflineMode ? (
            <div style={styles.offlineBadge}>Offline Demo Mode: showing local sample insights</div>
          ) : null}
        </div>
        <div style={styles.capturePanel}>
          <p style={styles.captureTitle}>Unlock every feature</p>
          <div style={styles.captureInputs}>
            <input
              type="text"
              placeholder="Name"
              value={leadForm.name}
              onChange={(event) =>
                setLeadForm((current) => ({ ...current, name: event.target.value }))
              }
              style={styles.input}
            />
            <input
              type="tel"
              placeholder="WhatsApp Number"
              value={leadForm.phone}
              onChange={(event) =>
                setLeadForm((current) => ({ ...current, phone: event.target.value }))
              }
              style={styles.input}
            />
          </div>
          <p style={styles.captureHint}>
            Name + WhatsApp unlock full AI analysis, exact location, agent contact, and reports.
          </p>
        </div>
      </div>

      {loading ? <div style={styles.stateCard}>Loading alerts...</div> : null}
      {error ? <div style={styles.errorCard}>{error}</div> : null}

      {!loading && !error ? (
        <div style={styles.grid}>
          {alerts.map((alert) => {
            const tone = statusTone(alert.status);

            return (
              <article
                key={alert.propertyId}
                style={{ ...styles.card, borderColor: tone.border }}
                onMouseEnter={() => recordEvent(alert, "property_view")}
              >
                <div style={styles.cardTop}>
                  <span
                    style={{
                      ...styles.badge,
                      background: tone.chipBg,
                      color: tone.chipColor,
                    }}
                  >
                    {alert.badge}
                  </span>
                  <span style={styles.location}>{alert.location}</span>
                </div>

                <h3 style={styles.cardTitle}>{alert.title}</h3>
                <p style={styles.message}>{alert.message}</p>

                <div style={styles.metrics}>
                  <div style={styles.metricBox}>
                    <span style={styles.metricLabel}>Asking</span>
                    <strong style={styles.metricValue}>
                      {formatCurrency(alert.askingPrice)}
                    </strong>
                  </div>
                  <div style={styles.metricBox}>
                    <span style={styles.metricLabel}>Fair Price</span>
                    <strong style={styles.metricValue}>
                      {formatCurrency(alert.fairPrice)}
                    </strong>
                  </div>
                  <div style={styles.metricBox}>
                    <span style={styles.metricLabel}>Difference</span>
                    <strong style={styles.metricValue}>
                      {alert.percentageDifference}%
                    </strong>
                  </div>
                </div>

                <div style={styles.insightBlock}>
                  <span style={styles.insightLabel}>AI Insight</span>
                  <p style={styles.insightText}>{alert.aiSummary}</p>
                </div>

                <div style={styles.ctaStack}>
                  {[
                    "Unlock Full AI Analysis",
                    "Get Exact Location + Agent Contact",
                    "Download Full Report",
                  ].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => captureLead(alert, label)}
                      disabled={!leadForm.name || !leadForm.phone || Boolean(submittingFor)}
                      style={{
                        ...styles.ctaButton,
                        opacity:
                          !leadForm.name || !leadForm.phone || Boolean(submittingFor) ? 0.65 : 1,
                      }}
                    >
                      {submittingFor === `${alert.propertyId}:${label}`
                        ? "Saving..."
                        : `Unlock: ${label}`}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => recordEvent(alert, "book_viewing")}
                    disabled={!leadForm.name || !leadForm.phone}
                    style={styles.secondaryButton}
                  >
                    Book Viewing
                  </button>
                  <button
                    type="button"
                    onClick={() => recordEvent(alert, "long_session")}
                    disabled={!leadForm.name || !leadForm.phone}
                    style={styles.ghostButton}
                  >
                    Track 2-Min Session
                  </button>
                </div>

                {leadState[alert.propertyId] ? (
                  <div style={styles.leadBox}>
                    <div style={styles.leadTopRow}>
                      <strong style={styles.leadLabel}>Lead Status</strong>
                      {leadState[alert.propertyId].hotLead ? (
                        <span style={styles.hotLeadBadge}>HOT LEAD</span>
                      ) : null}
                    </div>
                    <p style={styles.leadMeta}>
                      Score: {leadState[alert.propertyId].score}% | Agent:{" "}
                      {leadState[alert.propertyId].assignedAgent?.name ||
                        leadState[alert.propertyId].assignedAgent}
                    </p>
                    <p style={styles.whatsappPreview}>
                      WhatsApp auto follow-up: {leadState[alert.propertyId].whatsappMessage}
                    </p>
                  </div>
                ) : null}
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
    borderRadius: "24px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,247,251,0.98) 100%)",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.08)",
    border: "1px solid rgba(148, 163, 184, 0.22)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "24px",
    gap: "16px",
    flexWrap: "wrap",
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
    fontSize: "15px",
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
  capturePanel: {
    minWidth: "320px",
    maxWidth: "420px",
    padding: "16px",
    borderRadius: "18px",
    background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
    color: "#fff",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.18)",
  },
  captureTitle: {
    margin: "0 0 12px",
    fontWeight: 700,
    fontSize: "16px",
  },
  captureInputs: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "10px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.22)",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    outline: "none",
  },
  captureHint: {
    margin: "10px 0 0",
    color: "rgba(255,255,255,0.74)",
    fontSize: "12px",
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "18px",
  },
  card: {
    padding: "20px",
    borderRadius: "20px",
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    marginBottom: "16px",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: 700,
  },
  location: {
    color: "#64748b",
    fontSize: "13px",
    textAlign: "right",
  },
  cardTitle: {
    margin: "0 0 8px",
    color: "#0f172a",
    fontSize: "22px",
  },
  message: {
    margin: "0 0 18px",
    color: "#334155",
    lineHeight: 1.5,
    minHeight: "48px",
  },
  metrics: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
    marginBottom: "18px",
  },
  metricBox: {
    padding: "12px",
    borderRadius: "16px",
    background: "#f8fafc",
  },
  metricLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "12px",
    marginBottom: "6px",
  },
  metricValue: {
    color: "#0f172a",
    fontSize: "14px",
  },
  insightBlock: {
    padding: "14px",
    borderRadius: "16px",
    background: "linear-gradient(135deg, #eff6ff, #f8fafc)",
    border: "1px solid #dbeafe",
  },
  insightLabel: {
    display: "block",
    color: "#1d4ed8",
    fontWeight: 700,
    fontSize: "12px",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  insightText: {
    margin: 0,
    color: "#1e293b",
    lineHeight: 1.55,
  },
  ctaStack: {
    display: "grid",
    gap: "10px",
    marginTop: "16px",
  },
  ctaButton: {
    border: "none",
    borderRadius: "14px",
    padding: "12px 14px",
    background: "linear-gradient(135deg, #111827, #2563eb)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    textAlign: "left",
  },
  secondaryButton: {
    border: "none",
    borderRadius: "14px",
    padding: "12px 14px",
    background: "#e0f2fe",
    color: "#0c4a6e",
    fontWeight: 700,
    cursor: "pointer",
    textAlign: "left",
  },
  ghostButton: {
    border: "1px dashed #cbd5e1",
    borderRadius: "14px",
    padding: "12px 14px",
    background: "#fff",
    color: "#334155",
    fontWeight: 700,
    cursor: "pointer",
    textAlign: "left",
  },
  leadBox: {
    marginTop: "14px",
    padding: "14px",
    borderRadius: "16px",
    background: "#f8fafc",
    border: "1px solid #dbeafe",
  },
  leadTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px",
  },
  leadLabel: {
    color: "#0f172a",
  },
  hotLeadBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.04em",
  },
  leadMeta: {
    margin: "0 0 8px",
    color: "#475569",
    fontSize: "13px",
  },
  whatsappPreview: {
    margin: 0,
    color: "#0f172a",
    fontSize: "13px",
    lineHeight: 1.5,
  },
  stateCard: {
    padding: "18px",
    borderRadius: "18px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 600,
  },
  errorCard: {
    padding: "18px",
    borderRadius: "18px",
    background: "#fef2f2",
    color: "#b91c1c",
    fontWeight: 600,
  },
};
