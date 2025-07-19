import { useState, useRef } from "react";

interface MediaUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (mediaUrl: string, mediaType: "image" | "video" | "audio") => void;
}

export default function MediaUploader({
  isOpen,
  onClose,
  onInsert,
}: MediaUploaderProps) {
  const [uploadType, setUploadType] = useState<"file" | "url">("file");
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // 调用真实的后端API上传图片
      const { uploadApi } = await import('../../utils/api');
      const result = await uploadApi.uploadImage(file);

      const mediaType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
          ? "video"
          : "audio";

      onInsert(result.url, mediaType);
      onClose();
    } catch (error: any) {
      console.error("上传失败:", error);
      
      // 显示错误信息
      if (error instanceof Error) {
        alert(`上传失败: ${error.message}`);
      } else {
        alert("上传失败，请重试");
      }
    } finally {
      setUploading(false);
    }
  };

  const handleUrlInsert = () => {
    if (!mediaUrl.trim()) return;

    const mediaType = mediaUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)
      ? "image"
      : mediaUrl.match(/\.(mp4|webm|ogg)$/i)
        ? "video"
        : "audio";

    onInsert(mediaUrl, mediaType);
    onClose();
  };

  const modalOverlayStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  };

  const modalStyle = {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "1px solid #e2e8f0",
  };

  const titleStyle = {
    fontSize: "20px",
    fontWeight: "bold",
    color: "#2d3748",
    margin: 0,
  };

  const closeButtonStyle = {
    background: "none",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#718096",
    padding: "4px",
    borderRadius: "4px",
  };

  const tabStyle = (isActive: boolean) => ({
    padding: "8px 16px",
    border: "none",
    background: isActive ? "#667eea" : "transparent",
    color: isActive ? "white" : "#4a5568",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    marginRight: "8px",
  });

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "14px",
    marginBottom: "16px",
  };

  const buttonStyle = {
    padding: "10px 20px",
    border: "1px solid #e2e8f0",
    background: "white",
    color: "#4a5568",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    marginRight: "12px",
  };

  const primaryButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
  };

  const uploadAreaStyle = {
    border: "2px dashed #e2e8f0",
    borderRadius: "8px",
    padding: "40px 20px",
    textAlign: "center" as const,
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginBottom: "16px",
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>🖼️ 插入媒体</h3>
          <button style={closeButtonStyle} onClick={onClose}>
            ✕
          </button>
        </div>

        {/* 上传类型选择 */}
        <div style={{ marginBottom: "20px" }}>
          <button
            style={tabStyle(uploadType === "file")}
            onClick={() => setUploadType("file")}
          >
            上传文件
          </button>
          <button
            style={tabStyle(uploadType === "url")}
            onClick={() => setUploadType("url")}
          >
            输入链接
          </button>
        </div>

        {uploadType === "file" ? (
          <div>
            <div
              style={uploadAreaStyle}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  const input = fileInputRef.current;
                  if (input) {
                    input.files = e.dataTransfer.files;
                    input.dispatchEvent(new Event("change", { bubbles: true }));
                  }
                }
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "12px" }}>📁</div>
              <p style={{ color: "#4a5568", marginBottom: "8px" }}>
                点击或拖拽文件到此处
              </p>
              <p style={{ color: "#a0aec0", fontSize: "12px" }}>
                支持 JPG, PNG, GIF, MP4, WebM 等格式
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,audio/*"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />

            {uploading && (
              <div style={{ textAlign: "center", padding: "20px" }}>
                <div style={{ fontSize: "24px", marginBottom: "8px" }}>⏳</div>
                <p>正在上传...</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <input
              type="text"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="Enter media file URL..."
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "16px",
                marginBottom: "16px",
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={buttonStyle} onClick={onClose}>
                取消
              </button>
              <button style={primaryButtonStyle} onClick={handleUrlInsert}>
                插入
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
