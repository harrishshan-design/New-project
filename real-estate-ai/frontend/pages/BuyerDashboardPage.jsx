import React, { useState, useEffect } from "react";
import AIPredictionCard from "../src/components/AIPredictionCard";

export default function BuyerDashboardPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch properties from backend
    fetch("http://localhost:5000/api/properties")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProperties(data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch properties", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="container" style={{ paddingTop: "40px" }}>Loading properties...</div>;
  }

  return (
    <div className="container" style={{ paddingTop: "20px" }}>
      <h2 style={{ marginBottom: "24px" }}>Available Properties</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
        {properties.map((property) => (
          <div key={property._id} className="glass-card flex-col justify-between">
            <div>
              {property.images && property.images.length > 0 ? (
                <img 
                  src={property.images[0]} 
                  alt={property.title} 
                  style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "8px", marginBottom: "16px" }}
                />
              ) : (
                <div style={{ width: "100%", height: "200px", background: "rgba(0,0,0,0.3)", borderRadius: "8px", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="text-muted">No Image</span>
                </div>
              )}
              
              <div className="flex justify-between items-center" style={{ marginBottom: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {property.title}
                </h3>
                <span className={`badge ${property.status === 'Available' ? 'badge-success' : 'badge-warning'}`}>
                  {property.status}
                </span>
              </div>
              
              <div className="text-muted" style={{ marginBottom: "12px", fontSize: "0.9rem" }}>
                {property.location?.city}, {property.location?.state}
              </div>
              
              <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--primary-accent)", marginBottom: "16px" }}>
                RM {property.price?.toLocaleString()}
              </div>
              
              <div className="flex gap-4 text-sm text-muted" style={{ marginBottom: "16px" }}>
                <span>{property.specs?.bedrooms} Beds</span>
                <span>{property.specs?.bathrooms} Baths</span>
                <span>{property.specs?.sqft} sqft</span>
              </div>

              {property.aiInsights && (
                <AIPredictionCard insights={property.aiInsights} />
              )}
            </div>
            
            <button className="btn btn-primary" style={{ width: "100%", marginTop: "24px" }}>
              Request Viewing
            </button>
          </div>
        ))}
      </div>
      
      {properties.length === 0 && (
        <div className="glass-panel" style={{ padding: "40px", textAlign: "center" }}>
          <p className="text-muted">No properties available. Please ensure the backend is running and seeded.</p>
        </div>
      )}
    </div>
  );
}
