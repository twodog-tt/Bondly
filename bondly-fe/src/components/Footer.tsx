import React from 'react';

interface FooterProps {
  isMobile: boolean;
}

const Footer: React.FC<FooterProps> = ({ isMobile: _isMobile }) => {
  return (
    <footer style={{
      textAlign: "center",
      fontSize: "14px",
      color: "#6b7280",
      padding: "32px 0",
      borderTop: "1px solid #374151"
    }}>
      <p>Powered by Ethereum, IPFS, The Graph</p>
      <p style={{ marginTop: "8px" }}>
        © {new Date().getFullYear()} Bondly. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer; 