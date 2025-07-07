import React from 'react';

interface FeaturedArticlesProps {
  isMobile: boolean;
}

const FeaturedArticles: React.FC<FeaturedArticlesProps> = ({ isMobile }) => {
  // 模拟文章数据
  const articles = [
    {
      id: 1,
      title: "How to Mint Blog NFTs",
      author: "0x1234...abcd",
      earned: "2.3 USDC"
    },
    {
      id: 2,
      title: "The Future of Decentralized Content",
      author: "0x5678...efgh",
      earned: "1.8 USDC"
    },
    {
      id: 3,
      title: "Building Trust in Web3 Social",
      author: "0x9abc...ijkl",
      earned: "3.1 USDC"
    }
  ];

  return (
    <section style={{
      padding: isMobile ? "48px 24px" : "48px 24px",
      maxWidth: "1200px",
      margin: "0 auto"
    }}>
      <h2 style={{
        fontSize: "24px",
        fontWeight: "bold",
        marginBottom: "24px"
      }}>
        Featured Articles
      </h2>
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
        gap: "24px"
      }}>
        {articles.map((article) => (
          <div key={article.id} style={{
            border: "1px solid #374151",
            borderRadius: "16px",
            padding: "16px",
            background: "#151728"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "8px"
            }}>
              {article.title}
            </h3>
            <p style={{
              fontSize: "14px",
              color: "#9ca3af",
              marginBottom: "16px"
            }}>
              by {article.author} · Earned: {article.earned}
            </p>
            <div style={{
              display: "flex",
              gap: "8px",
              fontSize: "14px"
            }}>
              <button style={{
                border: "1px solid #4b5563",
                borderRadius: "12px",
                padding: "4px 12px",
                background: "transparent",
                color: "white",
                cursor: "pointer",
                transition: "background 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#374151"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                Mint NFT
              </button>
              <button style={{
                background: "transparent",
                border: "none",
                color: "#60a5fa",
                cursor: "pointer",
                transition: "opacity 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.7"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              >
                View on IPFS
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedArticles; 