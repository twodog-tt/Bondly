import React, { useState, useEffect } from "react";
import { useNotification } from "./NotificationProvider";
import ReportModal from "./ReportModal";
import TipModal from "./TipModal";
import { 
  getCommentList, 
  createComment, 
  deleteComment, 
  likeComment, 
  unlikeComment,
  Comment,
  CreateCommentRequest
} from "../api/comment";
import { useAuth } from "../contexts/AuthContext";

interface CommentSectionProps {
  postId: string;
  isMobile: boolean;
  onTipComment?: (commentId: string, authorName: string) => void;
}

export default function CommentSection({
  postId,
  isMobile,
  onTipComment,
}: CommentSectionProps) {
  const { notify } = useNotification();
  const { isLoggedIn, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [showReplyForm, setShowReplyForm] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
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

  // 加载评论列表
  useEffect(() => {
    loadComments();
  }, [postId]);

  const loadComments = async () => {
    try {
      setCommentLoading(true);
      const response = await getCommentList({
        post_id: parseInt(postId),
        page: 1,
        limit: 50
      });
      setComments(response.comments);
    } catch (error) {
      console.error('加载评论失败:', error);
      notify('加载评论失败', 'error');
    } finally {
      setCommentLoading(false);
    }
  };

  // 处理发表评论
  const handleSubmitComment = async () => {
    if (!isLoggedIn) {
      notify('请先登录', 'error');
      return;
    }

    if (!newComment.trim() && !replyContent.trim()) {
      return;
    }
    
    setLoading(true);
    try {
      const commentData: CreateCommentRequest = {
        post_id: parseInt(postId),
        content: replyTo ? replyContent : newComment,
        parent_comment_id: replyTo || undefined
      };

      const newCommentObj = await createComment(commentData);

      if (replyTo) {
        // 将回复添加到对应评论的子评论中
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === replyTo
              ? { 
                  ...comment, 
                  child_comments: [...(comment.child_comments || []), newCommentObj] 
                }
              : comment
          )
        );
        setReplyTo(null);
        setReplyContent("");
        setShowReplyForm(null);
        notify("回复成功", "success");
      } else {
        // 添加新评论到列表顶部
        setComments((prev) => [newCommentObj, ...prev]);
        setNewComment("");
        notify("评论成功", "success");
      }
    } catch (error) {
      console.error('发表评论失败:', error);
      notify('发表评论失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 处理点赞
  const handleLike = async (commentId: number) => {
    if (!isLoggedIn) {
      notify('请先登录', 'error');
      return;
    }

    try {
      await likeComment(commentId);
      
      // 更新本地状态
      setComments((prev) =>
        prev.map((comment) => {
          if (comment.id === commentId) {
            return {
              ...comment,
              likes: comment.likes + 1
            };
          }
          if (comment.child_comments) {
            return {
              ...comment,
              child_comments: comment.child_comments.map((reply) =>
                reply.id === commentId
                  ? { ...reply, likes: reply.likes + 1 }
                  : reply
              )
            };
          }
          return comment;
        })
      );
      
      notify("点赞成功", "success");
    } catch (error) {
      console.error('点赞失败:', error);
      notify('点赞失败', 'error');
    }
  };

  // 处理删除评论
  const handleDeleteComment = async (commentId: number) => {
    if (!isLoggedIn) {
      notify('请先登录', 'error');
      return;
    }

    try {
      await deleteComment(commentId);
      
      // 从本地状态中移除评论
      setComments((prev) => {
        // 检查是否是主评论
        const mainCommentIndex = prev.findIndex(c => c.id === commentId);
        if (mainCommentIndex !== -1) {
          return prev.filter((_, index) => index !== mainCommentIndex);
        }
        
        // 检查是否是回复
        return prev.map(comment => ({
          ...comment,
          child_comments: comment.child_comments?.filter(reply => reply.id !== commentId) || []
        }));
      });
      
      notify("删除成功", "success");
    } catch (error) {
      console.error('删除评论失败:', error);
      notify('删除评论失败', 'error');
    }
  };

  // 处理回复
  const handleReply = (commentId: number) => {
    if (!isLoggedIn) {
      notify('请先登录', 'error');
      return;
    }
    setReplyTo(commentId);
    setShowReplyForm(commentId);
    setReplyContent("");
  };

  // 处理举报
  const handleReport = (
    commentId: number,
    content: string,
    authorName: string,
  ) => {
    setReportModal({
      isOpen: true,
      targetId: commentId.toString(),
      targetType: "comment",
      targetContent: content,
      authorName,
    });
  };

  // 处理评论打赏
  const handleTipComment = (commentId: number, authorName: string) => {
    if (onTipComment) {
      onTipComment(commentId.toString(), authorName);
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

  // 检查是否是评论作者
  const isCommentAuthor = (comment: Comment) => {
    return user && comment.author_id === user.user_id;
  };

  // 渲染单个评论
  const renderComment = (comment: Comment, isReply = false) => (
    <div 
      key={comment.id}
      style={{
        marginBottom: isReply ? '12px' : '20px',
        position: 'relative'
      }}
    >
      {/* 评论卡片 */}
      <div 
        style={{
          background: isReply 
            ? 'rgba(26, 27, 46, 0.8)' 
            : 'linear-gradient(135deg, #1a1b2e 0%, #23243a 100%)',
          borderRadius: '12px',
          padding: isReply ? '16px' : '20px',
          border: `1px solid ${isReply ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.2)'}`,
          boxShadow: isReply ? '0 4px 16px rgba(0, 0, 0, 0.2)' : '0 8px 32px rgba(0, 0, 0, 0.3)',
          position: 'relative',
          overflow: 'hidden',
          marginLeft: isReply ? '20px' : '0'
        }}
      >
        {/* 装饰性边框 */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
            borderRadius: '12px 12px 0 0'
          }}
        />
        
        {/* 用户信息 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          {/* 头像 */}
          {comment.author?.avatar_url ? (
            <div style={{
              width: isReply ? 32 : 40,
              height: isReply ? 32 : 40,
              borderRadius: '50%',
              background: `url(${comment.author.avatar_url}) center center / cover`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: isReply ? 14 : 16,
            }} />
          ) : (
            <div style={{
              width: isReply ? 32 : 40,
              height: isReply ? 32 : 40,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: isReply ? 14 : 16,
            }}>
              {comment.author?.nickname?.charAt(0) || "U"}
            </div>
          )}
          
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ 
                fontWeight: 600, 
                color: 'white',
                fontSize: isReply ? '14px' : '15px'
              }}>
                {comment.author?.nickname || "匿名用户"}
              </span>
              {comment.author?.reputation_score && comment.author.reputation_score > 100 && (
                <span style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '8px',
                  fontSize: '10px',
                  fontWeight: 'bold'
                }}>✓</span>
              )}
              {isCommentAuthor(comment) && (
                <span style={{
                  color: '#667eea',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>(作者)</span>
              )}
            </div>
            <div style={{ 
              fontSize: 12, 
              color: 'rgb(156, 163, 175)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>声望: {comment.author?.reputation_score || 0}</span>
              <span>•</span>
              <span>{formatTime(comment.created_at)}</span>
            </div>
          </div>
        </div>
        
        {/* 评论内容 */}
        <div style={{ 
          lineHeight: 1.6, 
          fontSize: isReply ? 14 : 16,
          marginBottom: '12px',
          color: 'rgb(209, 213, 219)',
          whiteSpace: 'pre-wrap'
        }}>
          {comment.content}
        </div>
        
        {/* 操作按钮 */}
        <div style={{ 
          display: 'flex', 
          gap: '8px', 
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <button
            style={{
              background: 'rgba(102, 126, 234, 0.1)',
              color: '#667eea',
              border: '1px solid rgba(102, 126, 234, 0.2)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.2)';
            }}
            onClick={() => handleLike(comment.id)}
          >
            🤍 {comment.likes}
          </button>
          
          {!isReply && (
            <button
              style={{
                background: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
              }}
              onClick={() => handleReply(comment.id)}
            >
              💬 回复
            </button>
          )}
          
          <button
            style={{
              background: 'rgba(236, 72, 153, 0.1)',
              color: '#ec4899',
              border: '1px solid rgba(236, 72, 153, 0.2)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(236, 72, 153, 0.2)';
            }}
            onClick={() => handleTipComment(comment.id, comment.author?.nickname || "匿名用户")}
          >
            💝 打赏
          </button>
          
          {isCommentAuthor(comment) && (
            <button
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                padding: '4px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
              }}
              onClick={() => handleDeleteComment(comment.id)}
            >
              🗑️ 删除
            </button>
          )}
          
          <button
            style={{
              background: 'rgba(245, 158, 11, 0.1)',
              color: '#f59e0b',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.2)';
            }}
            onClick={() => handleReport(comment.id, comment.content, comment.author?.nickname || "匿名用户")}
          >
            ⚠️ 举报
          </button>
        </div>
        
        {/* 回复表单 */}
        {showReplyForm === comment.id && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: 'rgba(26, 27, 46, 0.6)',
            borderRadius: '8px',
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#667eea',
              marginBottom: '8px',
              fontWeight: '500'
            }}>
              回复 @{comment.author?.nickname || "匿名用户"}
            </div>
            <textarea
              style={{
                width: '100%',
                minHeight: '60px',
                padding: '8px',
                border: '1px solid rgba(102, 126, 234, 0.3)',
                borderRadius: '6px',
                fontSize: '13px',
                lineHeight: 1.4,
                resize: 'vertical',
                background: 'rgba(26, 27, 46, 0.8)',
                color: 'white',
                outline: 'none'
              }}
              placeholder={`回复 ${comment.author?.nickname || "匿名用户"}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <div style={{ 
              display: 'flex', 
              gap: '6px', 
              marginTop: '8px',
              justifyContent: 'flex-end'
            }}>
              <button
                style={{
                  padding: '6px 12px',
                  background: 'rgba(75, 85, 99, 0.8)',
                  color: '#d1d5db',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(75, 85, 99, 1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(75, 85, 99, 0.8)'}
                onClick={() => {
                  setShowReplyForm(null);
                  setReplyContent("");
                  setReplyTo(null);
                }}
              >
                取消
              </button>
              <button
                style={{
                  padding: '6px 12px',
                  background: !replyContent.trim() 
                    ? 'rgba(75, 85, 99, 0.5)' 
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '12px',
                  cursor: !replyContent.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: !replyContent.trim() ? 0.6 : 1
                }}
                onClick={handleSubmitComment}
                disabled={!replyContent.trim()}
              >
                回复
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 子评论 */}
      {comment.child_comments && comment.child_comments.length > 0 && (
        <div style={{ marginTop: '12px' }}>
          {comment.child_comments
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div style={{
      marginTop: '32px',
      padding: '24px',
      background: 'linear-gradient(135deg, #0f101f 0%, #1a1b2e 100%)',
      borderRadius: '20px',
      border: '1px solid rgba(102, 126, 234, 0.15)',
      maxWidth: '800px',
      margin: '32px auto 0',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 装饰性背景 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
        borderRadius: '20px 20px 0 0'
      }} />
      
      <h3 style={{
        fontWeight: 'bold',
        marginBottom: '24px',
        color: 'white',
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span>💬</span> 评论 <span style={{ color: '#667eea' }}>({comments.length})</span>
      </h3>
      
      {/* 发表评论 */}
      <div style={{ marginBottom: '32px' }}>
        <textarea
          style={{
            width: '100%',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            borderRadius: '12px',
            fontSize: '16px',
            lineHeight: 1.6,
            resize: 'vertical',
            fontFamily: 'inherit',
            background: 'rgba(26, 27, 46, 0.8)',
            color: 'white',
            minHeight: '100px',
            padding: '16px',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          placeholder="分享你的想法..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          disabled={loading}
        />
        <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
          <button
            style={{
              background: 'rgb(37, 99, 235)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '16px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              cursor: !newComment.trim() ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              opacity: !newComment.trim() ? 0.6 : 1
            }}
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || loading}
          >
            {loading ? "发送中..." : "发表评论"}
          </button>
        </div>
      </div>
      
      {/* 评论列表 */}
      <div>
        {commentLoading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#9ca3af'
          }}>
            <p>加载评论中...</p>
          </div>
        ) : comments.length > 0 ? (
          comments
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((comment) => renderComment(comment))
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#9ca3af'
          }}>
            <p>暂无评论，成为第一个评论者吧！</p>
          </div>
        )}
      </div>
      
      {/* 举报模态框 */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal((prev) => ({ ...prev, isOpen: false }))}
        onReport={(reason) => {
          // TODO: 实现举报功能
          console.log('举报评论:', reportModal.targetId, reason);
          notify('举报已提交', 'success');
          setReportModal((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}
