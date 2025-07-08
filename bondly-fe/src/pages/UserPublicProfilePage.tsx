import React from 'react';
import CommonNavbar from '../components/CommonNavbar';

interface UserPublicProfilePageProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

// 模拟用户数据
const mockUserData = {
  address: "0x1234...5678",
  ensName: "alice.eth",
  avatar: "https://randomuser.me/api/portraits/women/68.jpg",
  stats: {
    reputation: 1280,
    totalEarned: 45.6,
    articles: 24,
    nfts: 8
  }
};

// 模拟用户发布的文章
const mockUserArticles = [
  {
    id: 1,
    title: "深入解析 Uniswap V4 的 Hook 机制",
    summary: "Uniswap V4 引入了革命性的 Hook 机制，本文将详细分析其技术实现和潜在影响...",
    mintStatus: "minted",
    earnedTokens: 12.5,
    readTime: "8 min read",
    publishDate: "2024-01-15",
    category: "DeFi"
  },
  {
    id: 2,
    title: "Web3 社交革命：去中心化身份的未来",
    summary: "探讨去中心化身份系统如何重塑互联网社交体验，以及其面临的挑战和机遇...",
    mintStatus: "pending",
    earnedTokens: 8.3,
    readTime: "6 min read", 
    publishDate: "2024-01-12",
    category: "Identity"
  },
  {
    id: 3,
    title: "智能合约安全最佳实践指南",
    summary: "总结智能合约开发中的安全要点，包括常见漏洞分析和防护措施...",
    mintStatus: "minted",
    earnedTokens: 15.2,
    readTime: "10 min read",
    publishDate: "2024-01-08", 
    category: "Security"
  }
];

// 模拟用户铸造的NFT
const mockUserNFTs = [
  {
    id: 1,
    title: "Genesis Article NFT",
    imageUrl: "https://via.placeholder.com/200x200/667eea/fff?text=NFT1",
    ipfsUrl: "https://ipfs.io/ipfs/QmHash1"
  },
  {
    id: 2,
    title: "DeFi Analysis Collection",
    imageUrl: "https://via.placeholder.com/200x200/764ba2/fff?text=NFT2",
    ipfsUrl: "https://ipfs.io/ipfs/QmHash2"
  },
  {
    id: 3,
    title: "Technical Tutorial Series",
    imageUrl: "https://via.placeholder.com/200x200/151728/fff?text=NFT3",
    ipfsUrl: "https://ipfs.io/ipfs/QmHash3"
  }
];

// 模拟治理参与记录
const mockGovernanceData = [
  {
    id: 1,
    proposalTitle: "提高创作者奖励比例",
    voteChoice: "yes",
    reputationGained: 25,
    earningsFromVote: 2.1,
    voteDate: "2024-01-14"
  },
  {
    id: 2,
    proposalTitle: "新增内容分类标准",
    voteChoice: "yes", 
    reputationGained: 15,
    earningsFromVote: 1.8,
    voteDate: "2024-01-10"
  },
  {
    id: 3,
    proposalTitle: "修改质押机制参数",
    voteChoice: "no",
    reputationGained: 10,
    earningsFromVote: 0.9,
    voteDate: "2024-01-06"
  }
];

const UserPublicProfilePage: React.FC<UserPublicProfilePageProps> = ({ isMobile, onPageChange }) => {
  const handleLoginClick = () => {
    console.log("Login clicked");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0b0c1a", color: "white" }}>
      <CommonNavbar 
        isMobile={isMobile} 
        onPageChange={onPageChange}
        onLoginClick={handleLoginClick}
        showHomeButton={true}
        showWriteButton={true}
        showExploreButton={true}
        showDaoButton={true}
        showProfileButton={true}
        showDraftsButton={true}
        currentPage="user-profile"
      />
      
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: isMobile ? "20px 16px" : "40px 24px" 
      }}>
        {/* 用户身份区块 */}
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: isMobile ? "24px 20px" : "40px 32px",
          marginBottom: "32px",
          textAlign: "center"
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* 头像 */}
            <div style={{
              width: isMobile ? "80px" : "120px",
              height: isMobile ? "80px" : "120px",
              borderRadius: "50%",
              overflow: "hidden",
              marginBottom: "20px",
              border: "3px solid #667eea",
              boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)"
            }}>
              <img 
                src={mockUserData.avatar} 
                alt="User Avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            
            {/* 用户名和地址 */}
            <h1 style={{
              fontSize: isMobile ? "24px" : "32px",
              fontWeight: "bold",
              marginBottom: "8px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              {mockUserData.ensName}
            </h1>
            <p style={{
              color: "#9ca3af",
              fontSize: "14px",
              marginBottom: "32px",
              fontFamily: "monospace",
              background: "rgba(255, 255, 255, 0.05)",
              padding: "8px 16px",
              borderRadius: "8px"
            }}>
              {mockUserData.address}
            </p>
            
            {/* 统计数据 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
              gap: isMobile ? "16px" : "32px",
              width: "100%",
              maxWidth: "600px"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: isMobile ? "20px" : "28px",
                  fontWeight: "bold",
                  color: "#667eea",
                  marginBottom: "4px"
                }}>
                  {mockUserData.stats.reputation}
                </div>
                <div style={{ fontSize: "14px", color: "#9ca3af" }}>Reputation</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: isMobile ? "20px" : "28px",
                  fontWeight: "bold",
                  color: "#10b981",
                  marginBottom: "4px"
                }}>
                  {mockUserData.stats.totalEarned}
                </div>
                <div style={{ fontSize: "14px", color: "#9ca3af" }}>Total Earned</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: isMobile ? "20px" : "28px",
                  fontWeight: "bold",
                  color: "#8b5cf6",
                  marginBottom: "4px"
                }}>
                  {mockUserData.stats.articles}
                </div>
                <div style={{ fontSize: "14px", color: "#9ca3af" }}>Articles</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: isMobile ? "20px" : "28px",
                  fontWeight: "bold",
                  color: "#ec4899",
                  marginBottom: "4px"
                }}>
                  {mockUserData.stats.nfts}
                </div>
                <div style={{ fontSize: "14px", color: "#9ca3af" }}>NFTs</div>
              </div>
            </div>
          </div>
        </div>

        {/* 发布文章区块 */}
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: isMobile ? "20px 16px" : "24px",
          marginBottom: "32px"
        }}>
          <h2 style={{
            fontSize: isMobile ? "18px" : "24px",
            fontWeight: "bold",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            color: "white"
          }}>
            <span style={{ marginRight: "8px" }}>📝</span>
            Published Articles
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {mockUserArticles.map((article) => (
              <div key={article.id} style={{
                background: "#0b0c1a",
                borderRadius: "12px",
                padding: isMobile ? "16px" : "20px",
                border: "1px solid #374151",
                transition: "border-color 0.2s ease, transform 0.2s ease",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#6b7280";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#374151";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "12px",
                  flexDirection: isMobile ? "column" : "row",
                  gap: isMobile ? "12px" : "16px"
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontWeight: "600",
                      fontSize: isMobile ? "16px" : "18px",
                      marginBottom: "8px",
                      color: "white",
                      cursor: "pointer",
                      transition: "color 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#667eea"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "white"}
                    >
                      {article.title}
                    </h3>
                    <p style={{
                      color: "#9ca3af",
                      fontSize: "14px",
                      marginBottom: "12px",
                      lineHeight: "1.5"
                    }}>
                      {article.summary}
                    </p>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "12px",
                      color: "#6b7280",
                      gap: "16px",
                      flexWrap: "wrap"
                    }}>
                      <span>{article.category}</span>
                      <span>{article.readTime}</span>
                      <span>{article.publishDate}</span>
                    </div>
                  </div>
                  <div style={{ 
                    textAlign: isMobile ? "left" : "right",
                    minWidth: isMobile ? "auto" : "120px"
                  }}>
                    <div style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      marginBottom: "8px",
                      background: article.mintStatus === 'minted' ? "#065f46" : "#92400e",
                      color: "white"
                    }}>
                      {article.mintStatus === 'minted' ? '✅ Minted' : '⏳ Pending'}
                    </div>
                    <div style={{
                      color: "#10b981",
                      fontWeight: "600",
                      fontSize: "14px"
                    }}>
                      +{article.earnedTokens} BONDLY
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <a 
                    href={`/blog/${article.id}`}
                    style={{
                      color: "#667eea",
                      fontSize: "14px",
                      textDecoration: "none",
                      transition: "color 0.2s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#3b82f6";
                      e.currentTarget.style.textDecoration = "underline";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#667eea";
                      e.currentTarget.style.textDecoration = "none";
                    }}
                  >
                    Read More →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 铸造NFT区块 */}
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: isMobile ? "20px 16px" : "24px",
          marginBottom: "32px"
        }}>
          <h2 style={{
            fontSize: isMobile ? "18px" : "24px",
            fontWeight: "bold",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            color: "white"
          }}>
            <span style={{ marginRight: "8px" }}>🎨</span>
            Minted Content NFTs
          </h2>
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: isMobile ? "16px" : "24px"
          }}>
            {mockUserNFTs.map((nft) => (
              <div key={nft.id} style={{
                background: "#0b0c1a",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid #374151",
                transition: "border-color 0.2s ease, transform 0.2s ease",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#6b7280";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#374151";
                e.currentTarget.style.transform = "translateY(0)";
              }}
              >
                <div style={{
                  aspectRatio: "1",
                  background: "#374151",
                  borderRadius: "8px",
                  marginBottom: "12px",
                  overflow: "hidden"
                }}>
                  <img 
                    src={nft.imageUrl} 
                    alt={nft.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  />
                </div>
                <h3 style={{
                  fontWeight: "600",
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "white"
                }}>
                  {nft.title}
                </h3>
                <a 
                  href={nft.ipfsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#667eea",
                    fontSize: "12px",
                    textDecoration: "none",
                    transition: "color 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#3b82f6";
                    e.currentTarget.style.textDecoration = "underline";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#667eea";
                    e.currentTarget.style.textDecoration = "none";
                  }}
                >
                  View on IPFS →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* 治理参与区块 */}
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: isMobile ? "20px 16px" : "24px"
        }}>
          <h2 style={{
            fontSize: isMobile ? "18px" : "24px",
            fontWeight: "bold",
            marginBottom: "24px",
            display: "flex",
            alignItems: "center",
            color: "white"
          }}>
            <span style={{ marginRight: "8px" }}>🗳</span>
            Governance Participation
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {mockGovernanceData.map((governance) => (
              <div key={governance.id} style={{
                background: "#0b0c1a",
                borderRadius: "12px",
                padding: isMobile ? "16px" : "20px",
                border: "1px solid #374151",
                transition: "border-color 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "#6b7280"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "#374151"}
              >
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexDirection: isMobile ? "column" : "row",
                  gap: isMobile ? "12px" : "16px"
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontWeight: "600",
                      marginBottom: "8px",
                      fontSize: isMobile ? "16px" : "18px",
                      color: "white"
                    }}>
                      {governance.proposalTitle}
                    </h3>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      fontSize: "14px",
                      color: "#9ca3af",
                      gap: "16px",
                      flexWrap: "wrap"
                    }}>
                      <span style={{
                        display: "flex",
                        alignItems: "center",
                        color: governance.voteChoice === 'yes' ? "#10b981" : "#ef4444",
                        fontWeight: "500"
                      }}>
                        {governance.voteChoice === 'yes' ? '✅ Voted Yes' : '❌ Voted No'}
                      </span>
                      <span>{governance.voteDate}</span>
                    </div>
                  </div>
                  <div style={{
                    textAlign: isMobile ? "left" : "right",
                    fontSize: "14px",
                    minWidth: isMobile ? "auto" : "140px"
                  }}>
                    <div style={{
                      color: "#667eea",
                      marginBottom: "4px",
                      fontWeight: "500"
                    }}>
                      +{governance.reputationGained} Reputation
                    </div>
                    <div style={{
                      color: "#10b981",
                      fontWeight: "500"
                    }}>
                      +{governance.earningsFromVote} BONDLY
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPublicProfilePage; 