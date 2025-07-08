import React from 'react';
import CommonNavbar from '../components/CommonNavbar';

interface DaoPageProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const DaoPage: React.FC<DaoPageProps> = ({ isMobile, onPageChange }) => {
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
        currentPage="dao"
      />
      
      <div style={{ padding: isMobile ? "20px" : "40px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* 页面标题 */}
        <div style={{ 
          marginBottom: "40px",
          textAlign: "center"
        }}>
          <h1 style={{ 
            fontSize: isMobile ? "28px" : "36px", 
            fontWeight: "bold",
            marginBottom: "16px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            DAO Governance
          </h1>
          <p style={{ 
            fontSize: "18px", 
            color: "#9ca3af",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            Participate in community governance and help shape the future of Bondly
          </p>
        </div>

        {/* 统计卡片 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)",
          gap: "20px",
          marginBottom: "40px"
        }}>
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>1,234</div>
            <div style={{ fontSize: "14px", color: "#9ca3af" }}>Total Members</div>
          </div>
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>56</div>
            <div style={{ fontSize: "14px", color: "#9ca3af" }}>Active Proposals</div>
          </div>
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>89%</div>
            <div style={{ fontSize: "14px", color: "#9ca3af" }}>Voter Participation</div>
          </div>
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            border: "1px solid rgba(255, 255, 255, 0.1)"
          }}>
            <div style={{ fontSize: "32px", fontWeight: "bold", color: "white", marginBottom: "8px" }}>2.5M</div>
            <div style={{ fontSize: "14px", color: "#9ca3af" }}>Bond Tokens Staked</div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
          gap: "32px"
        }}>
          {/* 左侧：提案列表 */}
          <div>
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px"
              }}>
                <h2 style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  color: "white"
                }}>
                  Active Proposals
                </h2>
                <button style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "opacity 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  Create Proposal
                </button>
              </div>

              {/* 提案列表 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {[
                  {
                    id: 1,
                    title: "Increase Staking Rewards for Content Creators",
                    description: "Proposal to increase staking rewards for users who create high-quality content and maintain good reputation scores.",
                    status: "Active",
                    votes: { for: 1234, against: 89, abstain: 45 },
                    endDate: "2024-02-15",
                    creator: "Content Creator Guild"
                  },
                  {
                    id: 2,
                    title: "Add Support for Polygon Network",
                    description: "Proposal to expand Bondly to the Polygon network to reduce gas fees and improve user experience.",
                    status: "Active",
                    votes: { for: 856, against: 234, abstain: 67 },
                    endDate: "2024-02-20",
                    creator: "Technical Committee"
                  },
                  {
                    id: 3,
                    title: "Implement New Reputation Algorithm",
                    description: "Proposal to implement an improved reputation calculation algorithm that better reflects user contributions.",
                    status: "Active",
                    votes: { for: 567, against: 123, abstain: 89 },
                    endDate: "2024-02-25",
                    creator: "Reputation System Team"
                  }
                ].map((proposal) => (
                  <div key={proposal.id} style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "12px",
                    padding: "20px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    cursor: "pointer",
                    transition: "all 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                  >
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "12px"
                    }}>
                      <h3 style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "white",
                        marginBottom: "8px"
                      }}>
                        {proposal.title}
                      </h3>
                      <span style={{
                        background: "#10b981",
                        color: "white",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "500"
                      }}>
                        {proposal.status}
                      </span>
                    </div>
                    
                    <p style={{
                      fontSize: "14px",
                      color: "#9ca3af",
                      marginBottom: "16px",
                      lineHeight: "1.5"
                    }}>
                      {proposal.description}
                    </p>
                    
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "12px",
                      color: "#6b7280"
                    }}>
                      <span>By {proposal.creator}</span>
                      <span>Ends {proposal.endDate}</span>
                    </div>
                    
                    <div style={{
                      display: "flex",
                      gap: "16px",
                      marginTop: "12px"
                    }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#10b981"
                      }}>
                        <span>✓</span>
                        <span>{proposal.votes.for}</span>
                      </div>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#ef4444"
                      }}>
                        <span>✗</span>
                        <span>{proposal.votes.against}</span>
                      </div>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        color: "#6b7280"
                      }}>
                        <span>○</span>
                        <span>{proposal.votes.abstain}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧：投票面板和最近活动 */}
          <div>
            {/* 投票面板 */}
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              padding: "24px",
              marginBottom: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <h3 style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "20px",
                color: "white"
              }}>
                Your Voting Power
              </h3>
              
              <div style={{
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "16px"
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "8px"
                }}>
                  <span style={{ color: "#9ca3af" }}>Staked Tokens</span>
                  <span style={{ color: "white", fontWeight: "600" }}>1,000 BOND</span>
                </div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span style={{ color: "#9ca3af" }}>Voting Power</span>
                  <span style={{ color: "white", fontWeight: "600" }}>1,000 votes</span>
                </div>
              </div>
              
              <button style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                padding: "12px 24px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "opacity 0.2s ease",
                width: "100%"
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
              >
                Stake More Tokens
              </button>
            </div>

            {/* 最近活动 */}
            <div style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              padding: "24px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}>
              <h3 style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "20px",
                color: "white"
              }}>
                Recent Activity
              </h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {[
                  { action: "Voted FOR", proposal: "Increase Staking Rewards", time: "2 hours ago" },
                  { action: "Staked 500 BOND", proposal: "", time: "1 day ago" },
                  { action: "Voted AGAINST", proposal: "Add Polygon Support", time: "3 days ago" },
                  { action: "Created proposal", proposal: "New Feature Request", time: "1 week ago" }
                ].map((activity, index) => (
                  <div key={index} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px",
                    background: "rgba(255, 255, 255, 0.05)",
                    borderRadius: "6px"
                  }}>
                    <div style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#667eea"
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: "14px", color: "white" }}>
                        {activity.action}
                        {activity.proposal && (
                          <span style={{ color: "#9ca3af" }}>: {activity.proposal}</span>
                        )}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        {activity.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaoPage; 