import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "../components/NotificationProvider";
import EditorToolbar from "../components/editor/EditorToolbar";
import MediaUploader from "../components/editor/MediaUploader";
import MarkdownPreview from "../components/editor/MarkdownPreview";
import AutoSaveIndicator from "../components/common/AutoSaveIndicator";
import PublishModal from "../components/publish/PublishModal";

interface EditorProps {
  isMobile: boolean;
}

interface PublishData {
  title: string;
  summary: string;
  tags: string[];
  category: string;
  language: string;
  coverImage?: string;
  visibility: "public" | "private" | "password";
  password?: string;
  scheduledPublish?: string;
}

export default function Editor({ isMobile }: EditorProps) {
  const { t } = useTranslation();
  const { notify } = useNotification();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editorMode, setEditorMode] = useState<"rich" | "markdown">("rich");
  const [showPreview, setShowPreview] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // 自动保存功能
  useEffect(() => {
    if (!autoSaveEnabled || !title.trim() || !content.trim()) return;

    const autoSaveTimer = setTimeout(() => {
      handleSaveDraft();
    }, 30000); // 30秒自动保存

    return () => clearTimeout(autoSaveTimer);
  }, [title, content, autoSaveEnabled]);

  // 处理格式变化
  const handleFormatChange = (format: string) => {
    // TODO: 实现富文本格式功能
    console.log("格式变化:", format);
  };

  // 处理媒体插入
  const handleMediaInsert = (
    mediaUrl: string,
    mediaType: "image" | "video" | "audio",
  ) => {
    const mediaMarkdown =
      mediaType === "image"
        ? `![图片](${mediaUrl})`
        : mediaType === "video"
          ? `<video src="${mediaUrl}" controls></video>`
          : `<audio src="${mediaUrl}" controls></audio>`;

    setContent((prev) => prev + "\n" + mediaMarkdown);
    notify("媒体已插入", "success");
  };

  // 处理代码插入
  const handleCodeInsert = () => {
    const codeBlock = "\n```\n// 在这里输入代码\n```\n";
    setContent((prev) => prev + codeBlock);
  };

  // 处理数学公式插入
  const handleMathInsert = () => {
    const mathBlock = "\n$$\n// 在这里输入LaTeX公式\n$$\n";
    setContent((prev) => prev + mathBlock);
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    if (!title.trim() && !content.trim()) {
      notify("请至少输入标题或内容", "warning");
      return;
    }

    setIsSaving(true);

    try {
      // TODO: 调用后端API保存草稿
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLastSaved(new Date());
      notify("草稿已保存", "success");
    } catch (error) {
      notify("保存失败，请重试", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // 处理发布
  const handlePublish = async (publishData: PublishData) => {
    try {
      // TODO: 调用后端API发布文章
      await new Promise((resolve) => setTimeout(resolve, 2000));

      notify("文章发布成功！", "success");
      // 可以跳转到文章页面或清空编辑器
    } catch (error) {
      notify("发布失败，请重试", "error");
      throw error;
    }
  };

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
    marginLeft: "8px",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "16px",
    marginBottom: "16px",
  };

  const textareaStyle = {
    ...inputStyle,
    height: "400px",
    resize: "vertical" as const,
    fontFamily: editorMode === "markdown" ? "monospace" : "inherit",
    fontSize: editorMode === "markdown" ? "14px" : "16px",
    lineHeight: "1.6",
  };

  const editorContainerStyle = {
    display: "grid",
    gridTemplateColumns: showPreview ? "1fr 1fr" : "1fr",
    gap: "24px",
    height: "calc(100vh - 200px)",
  };

  const editorPanelStyle = {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    display: "flex",
    flexDirection: "column" as const,
  };

  const statusBarStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 0",
    borderTop: "1px solid #e2e8f0",
    marginTop: "16px",
    fontSize: "14px",
    color: "#718096",
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>✍️ 内容创作</h1>
        <div>
          <button style={buttonStyle} onClick={() => setEditorMode("rich")}>
            📝 富文本
          </button>
          <button style={buttonStyle} onClick={() => setEditorMode("markdown")}>
            📄 Markdown
          </button>
        </div>
      </div>

      <div style={editorContainerStyle}>
        {/* 编辑区域 */}
        <div style={editorPanelStyle}>
          <input
            type="text"
            placeholder="请输入文章标题..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ ...inputStyle, fontSize: "20px", fontWeight: "bold" }}
          />

          {/* 编辑器工具栏 */}
          <EditorToolbar
            onFormatChange={handleFormatChange}
            onInsertMedia={() => setShowMediaUploader(true)}
            onInsertCode={handleCodeInsert}
            onInsertMath={handleMathInsert}
            onPreviewToggle={() => setShowPreview(!showPreview)}
            showPreview={showPreview}
          />

          <textarea
            placeholder={
              editorMode === "markdown"
                ? "使用Markdown语法编写文章内容..."
                : "请输入文章内容..."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={textareaStyle}
          />

          {/* 状态栏 */}
          <div style={statusBarStyle}>
            <AutoSaveIndicator
              isSaving={isSaving}
              lastSaved={lastSaved}
              enabled={autoSaveEnabled}
            />
            <div>
              字符数: {content.length} | 字数:{" "}
              {content.replace(/\s/g, "").length}
            </div>
          </div>

          {/* 操作按钮 */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
              marginTop: "16px",
            }}
          >
            <button style={buttonStyle} onClick={handleSaveDraft}>
              💾 保存草稿
            </button>
            <button
              style={primaryButtonStyle}
              onClick={() => setShowPublishModal(true)}
            >
              🚀 发布文章
            </button>
          </div>
        </div>

        {/* 预览区域 */}
        {showPreview && (
          <div style={editorPanelStyle}>
            <h3 style={{ margin: "0 0 16px 0", color: "#2d3748" }}>👁️ 预览</h3>
            <div style={{ flex: 1, overflow: "auto" }}>
              <MarkdownPreview content={content} title={title} />
            </div>
          </div>
        )}
      </div>

      {/* 媒体上传器 */}
      <MediaUploader
        isOpen={showMediaUploader}
        onClose={() => setShowMediaUploader(false)}
        onInsert={handleMediaInsert}
      />

      {/* 发布模态框 */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={handlePublish}
        title={title}
        content={content}
      />
    </div>
  );
}
