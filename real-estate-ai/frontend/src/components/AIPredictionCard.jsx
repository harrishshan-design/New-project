import React from "react";
import { Sparkles, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";

export default function AIPredictionCard({ insights }) {
  if (!insights) return null;

  const { marketSentiment, confidenceScore, roiEstimate, reasoning } = insights;
  
  let sentimentColor = "var(--success)";
  let SentimentIcon = TrendingUp;
  let sentimentBadge = "badge-success";
  
  if (marketSentiment === "Overvalued") {
    sentimentColor = "var(--danger)";
    SentimentIcon = AlertCircle;
    sentimentBadge = "badge-danger";
  } else if (marketSentiment === "Fair") {
    sentimentColor = "var(--warning)";
    SentimentIcon = CheckCircle;
    sentimentBadge = "badge-warning";
  }

  return (
    <div className="glass-card" style={{ marginTop: "16px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", background: sentimentColor }}></div>
      <div className="flex items-center gap-2" style={{ marginBottom: "12px" }}>
        <Sparkles size={18} color="var(--primary-accent)" />
        <h3 style={{ fontSize: "1rem", margin: 0 }}>AI Property Analysis</h3>
      </div>
      
      <div className="flex gap-4" style={{ flexWrap: "wrap", marginBottom: "16px" }}>
        <div style={{ flex: "1 1 auto", background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px" }}>
          <div className="text-muted text-sm">Market Sentiment</div>
          <div className="flex items-center gap-2" style={{ marginTop: "4px" }}>
            <SentimentIcon size={16} color={sentimentColor} />
            <span className={`badge ${sentimentBadge}`}>{marketSentiment}</span>
          </div>
        </div>
        
        <div style={{ flex: "1 1 auto", background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px" }}>
          <div className="text-muted text-sm">Est. ROI</div>
          <div style={{ fontSize: "1.2rem", fontWeight: "600", color: "var(--success)", marginTop: "4px" }}>
            {roiEstimate}%
          </div>
        </div>

        <div style={{ flex: "1 1 auto", background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "8px" }}>
          <div className="text-muted text-sm">AI Confidence</div>
          <div style={{ fontSize: "1.2rem", fontWeight: "600", marginTop: "4px" }}>
            {confidenceScore}/100
          </div>
        </div>
      </div>
      
      <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
        {reasoning}
      </p>
    </div>
  );
}
