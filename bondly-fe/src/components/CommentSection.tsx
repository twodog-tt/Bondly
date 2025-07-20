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
  CreateCommentRequest,
  CommentListRequest
} from "../api/comment";
import { useAuth } from "../contexts/AuthContext";

interface CommentSectionProps {
  postId?: string;
  contentId?: string;
  isMobile: boolean;
  onTipComment?: (commentId: string, authorName: string) => void;
}

export default function CommentSection({
  postId,
  contentId,
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

  // Load comment list
  useEffect(() => {
    loadComments();
  }, [postId, contentId]);

  const loadComments = async () => {
    try {
      setCommentLoading(true);
      const params: CommentListRequest = {
        page: 1,
        limit: 50
      };
      
      if (postId) {
        params.post_id = parseInt(postId);
      } else if (contentId) {
        params.content_id = parseInt(contentId);
      }
      
      const response = await getCommentList(params);
      setComments(response.comments || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
      notify('Failed to load comments', 'error');
      setComments([]); // Ensure empty array instead of null on failure
    } finally {
      setCommentLoading(false);
    }
  };

  // Handle post comment
  const handleSubmitComment = async () => {
    if (!isLoggedIn) {
      notify('Please login first', 'error');
      return;
    }

    if (!newComment.trim() && !replyContent.trim()) {
      return;
    }
    
    setLoading(true);
    try {
      const commentData: CreateCommentRequest = {
        content: replyTo ? replyContent : newComment,
        parent_comment_id: replyTo || undefined
      };
      
      if (postId) {
        commentData.post_id = parseInt(postId);
      } else if (contentId) {
        commentData.content_id = parseInt(contentId);
      }

      const newCommentObj = await createComment(commentData);

      if (replyTo) {
        // Add reply to the corresponding comment's child comments
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
        notify("Reply posted successfully", "success");
      } else {
        // Add new comment to the top of the list
        setComments((prev) => [newCommentObj, ...prev]);
        setNewComment("");
        notify("Comment posted successfully", "success");
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
      notify('Failed to post comment', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle like
  const handleLike = async (commentId: number) => {
    if (!isLoggedIn) {
      notify('Please login first', 'error');
      return;
    }

    try {
      await likeComment(commentId);
      
      // Update local state
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
      
      notify("Liked successfully", "success");
    } catch (error) {
      console.error('Failed to like comment:', error);
      notify('Failed to like comment', 'error');
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (commentId: number) => {
    if (!isLoggedIn) {
      notify('Please login first', 'error');
      return;
    }

    try {
      await deleteComment(commentId);
      
      // Remove comment from local state
      setComments((prev) => {
        // Check if it's a main comment
        const mainCommentIndex = prev.findIndex(c => c.id === commentId);
        if (mainCommentIndex !== -1) {
          return prev.filter((_, index) => index !== mainCommentIndex);
        }
        
        // Check if it's a reply
        return prev.map(comment => ({
          ...comment,
          child_comments: comment.child_comments?.filter(reply => reply.id !== commentId) || []
        }));
      });
      
      notify("Deleted successfully", "success");
    } catch (error) {
      console.error('Failed to delete comment:', error);
      notify('Failed to delete comment', 'error');
    }
  };

  // Handle reply
  const handleReply = (commentId: number) => {
    if (!isLoggedIn) {
      notify('Please login first', 'error');
      return;
    }
    setReplyTo(commentId);
    setShowReplyForm(commentId);
    setReplyContent("");
  };

  // Handle report
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

  // Handle comment tip
  const handleTipComment = (commentId: number, authorName: string) => {
    if (onTipComment) {
      onTipComment(commentId.toString(), authorName);
    }
  };

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Check if user is comment author
  const isCommentAuthor = (comment: Comment) => {
    return user && comment.author_id === user.user_id;
  };

  // Render single comment
  const renderComment = (comment: Comment, isReply = false) => (
    <div 
      key={comment.id}
      style={{
        marginBottom: isReply ? '12px' : '20px',
        position: 'relative'
      }}
    >
              {/* Comment card */}
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
        {/* Decorative border */}
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
        
        {/* User info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          {/* Avatar */}
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
                {comment.author?.nickname || "Anonymous"}
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
                }}>(Author)</span>
              )}
            </div>
            <div style={{ 
              fontSize: 12, 
              color: 'rgb(156, 163, 175)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>Reputation: {comment.author?.reputation_score || 0}</span>
              <span>•</span>
              <span>{formatTime(comment.created_at)}</span>
            </div>
          </div>
        </div>
        
        {/* Comment content */}
        <div style={{ 
          lineHeight: 1.6, 
          fontSize: isReply ? 14 : 16,
          marginBottom: '12px',
          color: 'rgb(209, 213, 219)',
          whiteSpace: 'pre-wrap'
        }}>
          {comment.content}
        </div>
        
        {/* Action buttons */}
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
              💬 Reply
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
                          onClick={() => handleTipComment(comment.id, comment.author?.nickname || "Anonymous")}
                      >
              💝 Tip
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
              🗑️ Delete
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
                          onClick={() => handleReport(comment.id, comment.content, comment.author?.nickname || "Anonymous")}
                      >
              ⚠️ Report
            </button>
        </div>
        
        {/* Reply form */}
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
              Reply to @{comment.author?.nickname || "Anonymous"}
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
              placeholder={`Reply to ${comment.author?.nickname || "Anonymous"}...`}
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
                Cancel
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
                Reply
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* Child comments */}
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
      {/* Decorative background */}
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
        <span>💬</span> Comments <span style={{ color: '#667eea' }}>({comments.length})</span>
      </h3>
      
      {/* Post comment */}
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
          placeholder="Share your thoughts..."
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
            {loading ? "Sending..." : "Post Comment"}
          </button>
        </div>
      </div>
      
      {/* Comment list */}
      <div>
        {commentLoading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px',
            color: '#9ca3af'
          }}>
            <p>Loading comments...</p>
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
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
      
      {/* Report Modal */}
      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal((prev) => ({ ...prev, isOpen: false }))}
        onReport={(reason) => {
          // TODO: Implement report functionality
          console.log('Report comment:', reportModal.targetId, reason);
          notify('Report submitted', 'success');
          setReportModal((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </div>
  );
}
