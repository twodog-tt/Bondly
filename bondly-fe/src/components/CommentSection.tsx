import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNotification } from "./NotificationProvider";
import ReportModal from "./ReportModal";

interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    reputation: number;
    isVerified: boolean;
  };
  content: string;
  parentId?: string;
  replies: Comment[];
  likes: number;
  isLiked: boolean;
  isAuthor: boolean;
  createdAt: string;
  status: "active" | "deleted" | "hidden";
}

interface CommentSectionProps {
  postId: string;
  isMobile: boolean;
  onTipComment?: (commentId: string, authorName: string) => void;
}

// 模拟评论数据
const mockComments: Comment[] = [
  {
    id: "1",
    postId: "1",
    author: {
      id: "user1",
      name: "Alice Chen",
      avatar: "",
      reputation: 89,
      isVerified: true,
    },
    content: "这篇文章写得非常详细，Hook机制确实是Uniswap V4的一大创新！",
    replies: [],
    likes: 12,
    isLiked: false,
    isAuthor: false,
    createdAt: "2024-01-15T10:30:00Z",
    status: "active",
  },
  {
    id: "2",
    postId: "1",
    author: {
      id: "user2",
      name: "Bob Zhang",
      avatar: "",
      reputation: 234,
      isVerified: true,
    },
    content: "想请教一下，Hook机制对现有的DeFi协议会有什么影响？",
    replies: [
      {
        id: "2-1",
        postId: "1",
        author: {
          id: "user1",
          name: "Alice Chen",
          avatar: "",
          reputation: 89,
          isVerified: true,
        },
        content:
          "@Bob Zhang 我认为主要影响是让协议更加灵活，开发者可以自定义更多逻辑。",
        parentId: "2",
        replies: [],
        likes: 5,
        isLiked: true,
        isAuthor: true,
        createdAt: "2024-01-15T11:00:00Z",
        status: "active",
      },
    ],
    likes: 8,
    isLiked: false,
    isAuthor: false,
    createdAt: "2024-01-15T10:45:00Z",
    status: "active",
  },
];

export default function CommentSection({
  postId,
  isMobile,
  onTipComment,
}: CommentSectionProps) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [comments, setComments] = useState<Comment[]>(mockComments);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showReplyForm, setShowReplyForm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reportModal, setReportModal] = useState<{
    isOpen: boolean;
    targetId: string;
    targetType: "post" | "comment";
    targetContent?: string;
    authorName: string;
  }>({
    isOpen: false,
    targetId: "",
    targetType: "comment",
    authorName: "",
  });

  // 处理发表评论
  const handleSubmitComment = async () => {
    if (!newComment.trim() && !replyContent.trim()) return;
    setLoading(true);
    // TODO: 调用后端接口
    // const response = await fetch('/api/comments', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     postId,
    //     content: newComment,
    //     parentId: replyTo
    //   })
    // });

    // 模拟添加新评论
    const newCommentObj: Comment = {
      id: Date.now().toString(),
      postId,
      author: {
        id: "currentUser",
        name: "Current User",
        avatar: "",
        reputation: 45,
        isVerified: false,
      },
      content: replyTo ? replyContent : newComment,
      parentId: replyTo || undefined,
      replies: [],
      likes: 0,
      isLiked: false,
      isAuthor: false,
      createdAt: new Date().toISOString(),
      status: "active",
    };

    if (replyTo) {
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === replyTo
            ? { ...comment, replies: [...comment.replies, newCommentObj] }
            : comment,
        ),
      );
      setReplyTo(null);
      setReplyContent("");
      setShowReplyForm(null);
      notify("回复成功", "success");
    } else {
      setComments((prev) => [newCommentObj, ...prev]);
      setNewComment("");
      notify("评论成功", "success");
    }
    setLoading(false);
  };

  // 处理点赞
  const handleLike = async (commentId: string) => {
    // TODO: 调用后端接口
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          notify(comment.isLiked ? "已取消点赞" : "点赞成功", "info");
          return {
            ...comment,
            isLiked: !comment.isLiked,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
          };
        }
        if (comment.replies.some((reply) => reply.id === commentId)) {
          return {
            ...comment,
            replies: comment.replies.map((reply) =>
              reply.id === commentId
                ? {
                    ...reply,
                    isLiked: !reply.isLiked,
                    likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                  }
                : reply,
            ),
          };
        }
        return comment;
      }),
    );
  };

  // 处理回复
  const handleReply = (commentId: string) => {
    setReplyTo(commentId);
    setShowReplyForm(commentId);
    setReplyContent("");
  };

  // 处理举报
  const handleReport = (
    commentId: string,
    content: string,
    authorName: string,
  ) => {
    setReportModal({
      isOpen: true,
      targetId: commentId,
      targetType: "comment",
      targetContent: content,
      authorName,
    });
  };

  // 处理评论打赏
  const handleTipComment = (commentId: string, authorName: string) => {
    if (onTipComment) {
      onTipComment(commentId, authorName);
    }
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "刚刚";
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  const containerStyle = {
    marginTop: "32px",
    padding: "24px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    border: "1px solid rgba(0,0,0,0.05)",
  };

  const mobileContainerStyle = {
    ...containerStyle,
    padding: "20px 16px",
    borderRadius: "12px",
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "24px",
    color: "#2d3748",
  };

  const mobileTitleStyle = {
    ...titleStyle,
    fontSize: "20px",
    marginBottom: "20px",
  };

  const commentFormStyle = {
    marginBottom: "32px",
  };

  const textareaStyle = {
    width: "100%",
    minHeight: "100px",
    padding: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "14px",
    lineHeight: "1.6",
    resize: "vertical" as const,
    fontFamily: "inherit",
  };

  const mobileTextareaStyle = {
    ...textareaStyle,
    minHeight: "80px",
    padding: "12px",
  };

  const buttonStyle = {
    padding: "12px 24px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: "12px",
  };

  const mobileButtonStyle = {
    ...buttonStyle,
    padding: "10px 20px",
    fontSize: "13px",
  };

  const commentItemStyle = {
    padding: "20px 0",
    borderBottom: "1px solid #f1f5f9",
  };

  const commentHeaderStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
    gap: "12px",
  };

  const avatarStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    flexShrink: 0,
  };

  const authorInfoStyle = {
    flex: 1,
  };

  const authorNameStyle = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  };

  const authorNameTextStyle = {
    fontWeight: "600",
    fontSize: "14px",
    color: "#2d3748",
  };

  const verifiedBadgeStyle = {
    background: "#48bb78",
    color: "white",
    padding: "2px 6px",
    borderRadius: "8px",
    fontSize: "10px",
    fontWeight: "bold",
  };

  const commentMetaStyle = {
    fontSize: "12px",
    color: "#718096",
  };

  const commentContentStyle = {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#4a5568",
    marginBottom: "12px",
  };

  const commentActionsStyle = {
    display: "flex",
    gap: "16px",
    alignItems: "center",
  };

  const actionButtonStyle = {
    background: "none",
    border: "none",
    color: "#718096",
    fontSize: "12px",
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: "4px",
    transition: "all 0.2s ease",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  };

  const likeButtonStyle = (isLiked: boolean) => ({
    ...actionButtonStyle,
    color: isLiked ? "#667eea" : "#718096",
  });

  const replyFormStyle = {
    marginTop: "16px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  };

  const replyTextareaStyle = {
    width: "100%",
    minHeight: "60px",
    padding: "12px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    fontSize: "13px",
    lineHeight: "1.5",
    resize: "vertical" as const,
    fontFamily: "inherit",
    marginBottom: "12px",
  };

  const replyActionsStyle = {
    display: "flex",
    gap: "8px",
    justifyContent: "flex-end",
  };

  const cancelButtonStyle = {
    padding: "6px 12px",
    background: "#f1f5f9",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
  };

  const submitButtonStyle = {
    padding: "6px 12px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    cursor: "pointer",
  };

  const repliesContainerStyle = {
    marginLeft: "52px",
    marginTop: "16px",
    paddingLeft: "16px",
    borderLeft: "2px solid #e2e8f0",
  };

  const mobileRepliesContainerStyle = {
    ...repliesContainerStyle,
    marginLeft: "32px",
    paddingLeft: "12px",
  };

  return (
    <div style={isMobile ? mobileContainerStyle : containerStyle}>
      <h3 style={isMobile ? mobileTitleStyle : titleStyle}>
        💬 评论 ({comments.length})
      </h3>

      {/* 发表评论 */}
      <div style={commentFormStyle}>
        <textarea
          style={isMobile ? mobileTextareaStyle : textareaStyle}
          placeholder={
            replyTo
              ? `回复 ${comments.find((c) => c.id === replyTo)?.author.name}...`
              : "分享你的想法..."
          }
          value={replyTo ? replyContent : newComment}
          onChange={(e) =>
            replyTo
              ? setReplyContent(e.target.value)
              : setNewComment(e.target.value)
          }
          disabled={loading}
        />
        <button
          style={isMobile ? mobileButtonStyle : buttonStyle}
          onClick={handleSubmitComment}
          disabled={
            loading ||
            (!replyTo && !newComment.trim()) ||
            (!!replyTo && !replyContent.trim())
          }
        >
          {loading ? "发送中..." : replyTo ? "回复" : "发表评论"}
        </button>
        {replyTo && (
          <button
            style={cancelButtonStyle}
            onClick={() => {
              setReplyTo(null);
              setReplyContent("");
              setShowReplyForm(null);
            }}
          >
            取消
          </button>
        )}
      </div>

      {/* 评论列表 */}
      <div>
        {comments.map((comment) => (
          <div key={comment.id} style={commentItemStyle}>
            <div style={commentHeaderStyle}>
              <div style={avatarStyle}>
                {comment.author.avatar || comment.author.name.charAt(0)}
              </div>
              <div style={authorInfoStyle}>
                <div style={authorNameStyle}>
                  <span style={authorNameTextStyle}>{comment.author.name}</span>
                  {comment.author.isVerified && (
                    <span style={verifiedBadgeStyle}>✓</span>
                  )}
                  {comment.isAuthor && (
                    <span style={{ fontSize: "12px", color: "#667eea" }}>
                      (作者)
                    </span>
                  )}
                </div>
                <div style={commentMetaStyle}>
                  <span>声誉: {comment.author.reputation}</span>
                  <span> • </span>
                  <span>{formatTime(comment.createdAt)}</span>
                </div>
              </div>
            </div>

            <div style={commentContentStyle}>{comment.content}</div>

            <div style={commentActionsStyle}>
              <button
                style={likeButtonStyle(comment.isLiked)}
                onClick={() => handleLike(comment.id)}
              >
                {comment.isLiked ? "❤️" : "🤍"} {comment.likes}
              </button>
              <button
                style={actionButtonStyle}
                onClick={() => handleReply(comment.id)}
              >
                💬 回复
              </button>
              <button
                style={actionButtonStyle}
                onClick={() =>
                  handleTipComment(comment.id, comment.author.name)
                }
              >
                💝 打赏
              </button>
              <button
                style={actionButtonStyle}
                onClick={() =>
                  handleReport(comment.id, comment.content, comment.author.name)
                }
              >
                ⚠️ 举报
              </button>
            </div>

            {/* 回复表单 */}
            {showReplyForm === comment.id && (
              <div style={replyFormStyle}>
                <textarea
                  style={replyTextareaStyle}
                  placeholder={`回复 ${comment.author.name}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                />
                <div style={replyActionsStyle}>
                  <button
                    style={cancelButtonStyle}
                    onClick={() => {
                      setShowReplyForm(null);
                      setReplyContent("");
                      setReplyTo(null);
                    }}
                  >
                    取消
                  </button>
                  <button
                    style={submitButtonStyle}
                    onClick={handleSubmitComment}
                    disabled={!replyContent.trim()}
                  >
                    回复
                  </button>
                </div>
              </div>
            )}

            {/* 回复列表 */}
            {comment.replies.length > 0 && (
              <div
                style={
                  isMobile ? mobileRepliesContainerStyle : repliesContainerStyle
                }
              >
                {comment.replies.map((reply) => (
                  <div key={reply.id} style={commentItemStyle}>
                    <div style={commentHeaderStyle}>
                      <div
                        style={{
                          ...avatarStyle,
                          width: "32px",
                          height: "32px",
                          fontSize: "14px",
                        }}
                      >
                        {reply.author.avatar || reply.author.name.charAt(0)}
                      </div>
                      <div style={authorInfoStyle}>
                        <div style={authorNameStyle}>
                          <span style={authorNameTextStyle}>
                            {reply.author.name}
                          </span>
                          {reply.author.isVerified && (
                            <span style={verifiedBadgeStyle}>✓</span>
                          )}
                          {reply.isAuthor && (
                            <span
                              style={{ fontSize: "12px", color: "#667eea" }}
                            >
                              (作者)
                            </span>
                          )}
                        </div>
                        <div style={commentMetaStyle}>
                          <span>声誉: {reply.author.reputation}</span>
                          <span> • </span>
                          <span>{formatTime(reply.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div style={commentContentStyle}>{reply.content}</div>

                    <div style={commentActionsStyle}>
                      <button
                        style={likeButtonStyle(reply.isLiked)}
                        onClick={() => handleLike(reply.id)}
                      >
                        {reply.isLiked ? "❤️" : "🤍"} {reply.likes}
                      </button>
                      <button
                        style={actionButtonStyle}
                        onClick={() =>
                          handleTipComment(reply.id, reply.author.name)
                        }
                      >
                        💝 打赏
                      </button>
                      <button
                        style={actionButtonStyle}
                        onClick={() =>
                          handleReport(
                            reply.id,
                            reply.content,
                            reply.author.name,
                          )
                        }
                      >
                        ⚠️ 举报
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            color: "#718096",
          }}
        >
          <p>还没有评论，来发表第一条评论吧！</p>
        </div>
      )}

      {/* 举报模态框 */}
      <ReportModal
        targetId={reportModal.targetId}
        targetType={reportModal.targetType}
        targetContent={reportModal.targetContent}
        authorName={reportModal.authorName}
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
