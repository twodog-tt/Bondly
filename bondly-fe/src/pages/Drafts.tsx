import React, { useState } from "react";
import CommonNavbar from '../components/CommonNavbar';

interface Draft {
  id: string;
  title: string;
  summary: string;
  lastModified: string;
  wordCount: number;
  isAutoSaved: boolean;
}

interface DraftsProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

export default function Drafts({ isMobile, onPageChange }: DraftsProps) {
  const [drafts, setDrafts] = useState<Draft[]>([
    {
      id: "1",
      title: "Uniswap V4 Hook机制深度解析",
      summary: "深入探讨Uniswap V4的Hook机制，分析其对DeFi生态的影响...",
      lastModified: "2024-01-15T14:30:00Z",
      wordCount: 2800,
      isAutoSaved: true,
    },
    {
      id: "2",
      title: "Web3安全最佳实践指南",
      summary: "总结Web3开发中的安全要点，包括智能合约审计、私钥管理等...",
      lastModified: "2024-01-14T10:20:00Z",
      wordCount: 3500,
      isAutoSaved: false,
    },
    {
      id: "3",
      title: "NFT艺术创作技巧分享",
      summary: "分享NFT艺术创作的经验和技巧，从创意到技术实现...",
      lastModified: "2024-01-13T09:15:00Z",
      wordCount: 3200,
      isAutoSaved: true,
    },
  ]);

  const containerStyle = {
    padding: isMobile ? "20px" : "40px",
    background: "#0b0c1a",
    minHeight: "100vh",
    color: "white"
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
    padding: "20px",
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
  };

  const titleStyle = {
    fontSize: isMobile ? "20px" : "24px",
    fontWeight: "bold",
    color: "white",
    margin: 0,
  };

  const buttonStyle = {
    padding: "8px 16px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.2s ease"
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
  };

  const draftCardStyle = {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
  };

  const draftTitleStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    color: "white",
    margin: "0 0 8px 0",
  };

  const draftSummaryStyle = {
    color: "#9ca3af",
    fontSize: "14px",
    margin: "0 0 12px 0",
    lineHeight: "1.5",
  };

  const draftMetaStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#6b7280",
  };

  const statusBadgeStyle = (isAutoSaved: boolean) => ({
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    background: isAutoSaved ? "rgba(34, 197, 94, 0.2)" : "rgba(239, 68, 68, 0.2)",
    color: isAutoSaved ? "#4ade80" : "#f87171",
  });

  const handleEditDraft = (draftId: string) => {
    // TODO: 跳转到编辑器页面并加载草稿
    console.log("Edit draft:", draftId);
    onPageChange?.("editor");
  };

  const handleDeleteDraft = (draftId: string) => {
    // TODO: 删除草稿确认
    console.log("Delete draft:", draftId);
  };

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
        currentPage="drafts"
      />
      
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>📝 Draft Management</h1>
          <button 
            style={primaryButtonStyle}
            onClick={() => onPageChange?.("editor")}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
          >
            ✨ New Article
          </button>
        </div>

        {drafts.length === 0 ? (
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              padding: "60px 20px",
              textAlign: "center",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
            <h3 style={{ color: "white", marginBottom: "8px" }}>No drafts</h3>
            <p style={{ color: "#9ca3af", marginBottom: "24px" }}>
              Start creating your first article
            </p>
            <button 
              style={primaryButtonStyle}
              onClick={() => onPageChange?.("editor")}
              onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
              onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
            >
              ✨ Start Creating
            </button>
          </div>
        ) : (
          <div>
            {drafts.map((draft) => (
              <div
                key={draft.id}
                style={draftCardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                }}
              >
                <h3 style={draftTitleStyle}>{draft.title}</h3>
                <p style={draftSummaryStyle}>{draft.summary}</p>

                <div style={draftMetaStyle}>
                  <div>
                    <span>
                      📅 {new Date(draft.lastModified).toLocaleDateString()}
                    </span>
                    <span style={{ margin: "0 8px" }}>•</span>
                    <span>📊 {draft.wordCount} words</span>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <span style={statusBadgeStyle(draft.isAutoSaved)}>
                      {draft.isAutoSaved ? `💾 Auto Saved` : `⚠️ Not Saved`}
                    </span>

                    <button
                      style={{
                        ...buttonStyle,
                        padding: "4px 8px",
                        fontSize: "12px",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditDraft(draft.id);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      style={{
                        ...buttonStyle,
                        padding: "4px 8px",
                        fontSize: "12px",
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        color: "#f87171",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDraft(draft.id);
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
