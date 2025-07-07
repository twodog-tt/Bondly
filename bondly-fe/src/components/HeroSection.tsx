import React from 'react';

interface HeroSectionProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ isMobile, onPageChange }) => {
  return (
    <section style={{
      textAlign: "center",
      padding: isMobile ? "96px 16px" : "96px 16px"
    }}>
      <h1 style={{
        fontSize: isMobile ? "36px" : "60px",
        fontWeight: "800",
        marginBottom: "16px",
        lineHeight: "1.1"
      }}>
        Write Freely.<br /> Own What You Create.
      </h1>
      <p style={{
        color: "#d1d5db",
        fontSize: "18px",
        marginBottom: "32px"
      }}>
        Build trust. Create value. Share freely.
      </p>
      <button 
        style={{
          background: "#2563eb",
          color: "white",
          padding: "12px 24px",
          borderRadius: "16px",
          fontSize: "14px",
          fontWeight: "600",
          border: "none",
          cursor: "pointer",
          transition: "background 0.2s ease"
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#3b82f6"}
        onMouseLeave={(e) => e.currentTarget.style.background = "#2563eb"}
        onClick={() => onPageChange?.("editor")}
      >
        Start Writing
      </button>
    </section>
  );
};

export default HeroSection; 