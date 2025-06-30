import { useState } from "react";
import { useTranslation } from "react-i18next";

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
}

export default function Drafts({ isMobile }: DraftsProps) {
  const { t } = useTranslation();

  // 模拟草稿数据
  const [drafts] = useState<Draft[]>([
    {
      id: "1",
      title: "Uniswap V4 Hook机制深度解析",
      summary: "深入探讨Uniswap V4的Hook机制，分析其对DeFi生态的影响...",
      lastModified: "2024-01-15T10:30:00Z",
      wordCount: 2500,
      isAutoSaved: true,
    },
    {
      id: "2",
      title: "Web3安全最佳实践指南",
      summary: "总结Web3开发中的安全要点，包括智能合约审计、私钥管理等...",
      lastModified: "2024-01-14T15:20:00Z",
      wordCount: 1800,
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
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    minHeight: "100vh",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
    padding: "20px",
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
  };

  const titleStyle = {
    fontSize: isMobile ? "20px" : "24px",
    fontWeight: "bold",
    color: "#2d3748",
    margin: 0,
  };

  const buttonStyle = {
    padding: "8px 16px",
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#4a5568",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
  };

  const draftCardStyle = {
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    marginBottom: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
  };

  const draftTitleStyle = {
    fontSize: "18px",
    fontWeight: "bold",
    color: "#2d3748",
    margin: "0 0 8px 0",
  };

  const draftSummaryStyle = {
    color: "#718096",
    fontSize: "14px",
    margin: "0 0 12px 0",
    lineHeight: "1.5",
  };

  const draftMetaStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontSize: "12px",
    color: "#a0aec0",
  };

  const statusBadgeStyle = (isAutoSaved: boolean) => ({
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
    background: isAutoSaved ? "#c6f6d5" : "#fed7d7",
    color: isAutoSaved ? "#22543d" : "#742a2a",
  });

  const handleEditDraft = (draftId: string) => {
    // TODO: 跳转到编辑器页面并加载草稿
    console.log("编辑草稿:", draftId);
  };

  const handleDeleteDraft = (draftId: string) => {
    // TODO: 删除草稿确认
    console.log("删除草稿:", draftId);
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>📝 草稿管理</h1>
        <button style={primaryButtonStyle}>✨ 新建文章</button>
      </div>

      {drafts.length === 0 ? (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "60px 20px",
            textAlign: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📄</div>
          <h3 style={{ color: "#2d3748", marginBottom: "8px" }}>暂无草稿</h3>
          <p style={{ color: "#718096", marginBottom: "24px" }}>
            开始创作您的第一篇文章吧！
          </p>
          <button style={primaryButtonStyle}>✨ 开始创作</button>
        </div>
      ) : (
        <div>
          {drafts.map((draft) => (
            <div
              key={draft.id}
              style={draftCardStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.08)";
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
                  <span>📊 {draft.wordCount} 字</span>
                </div>

                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span style={statusBadgeStyle(draft.isAutoSaved)}>
                    {draft.isAutoSaved ? "💾 已自动保存" : "⚠️ 未保存"}
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
                  >
                    ✏️ 编辑
                  </button>

                  <button
                    style={{
                      ...buttonStyle,
                      padding: "4px 8px",
                      fontSize: "12px",
                      background: "#fed7d7",
                      color: "#742a2a",
                      border: "1px solid #feb2b2",
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDraft(draft.id);
                    }}
                  >
                    🗑️ 删除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
