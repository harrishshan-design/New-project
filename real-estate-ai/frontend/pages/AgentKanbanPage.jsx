import React, { useState, useEffect } from "react";
import { MessageSquare, Flame, Clock } from "lucide-react";

export default function AgentKanbanPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/leads")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLeads(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch leads", err);
        setLoading(false);
      });
  }, []);

  const handleFollowUp = async (leadId) => {
    // In a real app, this would trigger a backend WhatsApp follow-up via Twilio
    alert("WhatsApp automated follow-up initiated for Lead ID: " + leadId);
  };

  if (loading) {
    return <div className="container" style={{ paddingTop: "40px" }}>Loading leads...</div>;
  }

  return (
    <div className="container" style={{ paddingTop: "20px" }}>
      <div className="flex justify-between items-center" style={{ marginBottom: "32px" }}>
        <h2>Agent Kanban Overview</h2>
        <div className="flex gap-4">
          <div className="glass-panel text-sm" style={{ padding: "8px 16px" }}>
            Total Leads: <strong>{leads.length}</strong>
          </div>
          <div className="glass-panel text-sm" style={{ padding: "8px 16px" }}>
            Hot Leads: <strong style={{ color: "var(--danger)" }}>{leads.filter(l => l.hotLead).length}</strong>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
        {/* Kanban Column 1: New / Cold */}
        <div className="glass-panel" style={{ padding: "16px", background: "rgba(24, 27, 33, 0.4)" }}>
          <h3 className="flex items-center gap-2" style={{ marginBottom: "16px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
            <Clock size={16} /> New Leads
          </h3>
          <div className="flex flex-col gap-4">
            {leads.filter(l => l.score < 50 && !l.hotLead).map(lead => (
              <LeadCard key={lead._id} lead={lead} onFollowUp={handleFollowUp} />
            ))}
          </div>
        </div>

        {/* Kanban Column 2: Warm */}
        <div className="glass-panel" style={{ padding: "16px", background: "rgba(24, 27, 33, 0.4)" }}>
          <h3 className="flex items-center gap-2" style={{ marginBottom: "16px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
            <span style={{ color: "var(--warning)" }}>●</span> Warm
          </h3>
          <div className="flex flex-col gap-4">
            {leads.filter(l => l.score >= 50 && l.score < 80 && !l.hotLead).map(lead => (
              <LeadCard key={lead._id} lead={lead} onFollowUp={handleFollowUp} />
            ))}
          </div>
        </div>

        {/* Kanban Column 3: Hot Leads */}
        <div className="glass-panel" style={{ padding: "16px", background: "rgba(24, 27, 33, 0.4)" }}>
          <h3 className="flex items-center gap-2 text-danger" style={{ marginBottom: "16px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px", color: "var(--danger)" }}>
            <Flame size={16} /> Hot Leads
          </h3>
          <div className="flex flex-col gap-4">
            {leads.filter(l => l.hotLead || l.score >= 80).map(lead => (
              <LeadCard key={lead._id} lead={lead} onFollowUp={handleFollowUp} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadCard({ lead, onFollowUp }) {
  return (
    <div className="glass-card" style={{ padding: "16px" }}>
      <div className="flex justify-between items-center" style={{ marginBottom: "8px" }}>
        <h4 style={{ margin: 0, fontSize: "1.05rem" }}>{lead.name}</h4>
        <span className={`badge ${lead.score >= 80 ? 'badge-danger' : lead.score >= 50 ? 'badge-warning' : ''}`} style={{ background: lead.score < 50 ? 'rgba(255,255,255,0.1)' : undefined }}>
          {lead.score} / 100
        </span>
      </div>
      
      <div className="text-muted text-sm space-y-1" style={{ marginBottom: "16px" }}>
        <p style={{ margin: "4px 0" }}>Interest: {lead.interest}</p>
        <p style={{ margin: "4px 0" }}>Source: {lead.source}</p>
        {lead.propertyTitle && (
          <p style={{ margin: "4px 0", color: "var(--primary-accent)" }}>Target: {lead.propertyTitle}</p>
        )}
      </div>

      <button 
        className="btn flex items-center justify-center gap-2" 
        style={{ width: "100%", background: "rgba(45, 212, 191, 0.15)", color: "var(--success)", border: "1px solid rgba(45, 212, 191, 0.3)" }}
        onClick={() => onFollowUp(lead._id)}
      >
        <MessageSquare size={16} /> WhatsApp
      </button>
    </div>
  );
}
