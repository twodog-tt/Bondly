import React from 'react';

interface GovernanceSectionProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const GovernanceSection: React.FC<GovernanceSectionProps> = ({ isMobile, onPageChange }) => {
  return (
    <section style={{
      padding: isMobile ? "48px 24px" : "48px 24px",
      maxWidth: "896px",
      margin: "0 auto"
    }}>
      <h2 style={{
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "16px"
      }}>
        Community Governance
      </h2>
      <div style={{ marginBottom: "16px" }}>
        <div style={{
          padding: "16px",
          background: "#151728",
          borderRadius: "16px",
          border: "1px solid #374151"
        }}>
          <p style={{
            fontSize: "14px",
            marginBottom: "8px"
          }}>
            Proposal #42: Adjust content staking rewards
          </p>
          <div style={{
            width: "100%",
            background: "#374151",
            height: "8px",
            borderRadius: "4px",
            marginBottom: "4px"
          }}>
            <div style={{
              background: "#3b82f6",
              height: "8px",
              borderRadius: "4px",
              width: "62%"
            }}></div>
          </div>
          <p style={{
            fontSize: "12px",
            color: "#9ca3af",
            marginBottom: "12px"
          }}>
            Voting ends in 12 hours
          </p>
          <button 
            style={{
              background: "#3b82f6",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: "600",
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
            onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}
            onClick={() => onPageChange?.("dao")}
          >
            View All Proposals
          </button>
        </div>
      </div>
    </section>
  );
};

export default GovernanceSection; 