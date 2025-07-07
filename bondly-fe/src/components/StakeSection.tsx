import React from 'react';

interface StakeSectionProps {
  isMobile: boolean;
}

const StakeSection: React.FC<StakeSectionProps> = ({ isMobile }) => {
  return (
    <section style={{
      padding: isMobile ? "48px 24px" : "48px 24px",
      background: "#0f101f"
    }}>
      <div style={{
        maxWidth: "896px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
        gap: "32px"
      }}>
        <div>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "8px"
          }}>
            Stake to Earn
          </h2>
          <p style={{
            color: "#9ca3af",
            fontSize: "14px"
          }}>
            Like and comment by staking BOND tokens. Earn rewards as your favorite content grows.
          </p>
        </div>
        <div>
          <h2 style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: "8px"
          }}>
            Bond Token
          </h2>
          <p style={{
            color: "#9ca3af",
            fontSize: "14px"
          }}>
            Power your content. Participate in governance. Own your social value.
          </p>
        </div>
      </div>
    </section>
  );
};

export default StakeSection; 