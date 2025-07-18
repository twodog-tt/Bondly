import React, { useState, useEffect } from 'react';
import CommonNavbar from '../components/CommonNavbar';
import ContentInteraction from '../components/ContentInteraction';
import CommentSection from '../components/CommentSection';
import InteractionStakingSection from '../components/InteractionStakingSection';
import { getContentById, Content } from '../api/content';

interface BlogDetailPageProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const BlogDetailPage: React.FC<BlogDetailPageProps> = ({ isMobile, onPageChange }) => {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get content ID from URL parameters
  const getContentIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    return id ? parseInt(id) : null;
  };

  // Get content details
  useEffect(() => {
    const fetchContent = async () => {
      const contentId = getContentIdFromUrl();
      
      if (!contentId) {
        setError('Content ID not found');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const contentData = await getContentById(contentId);
        setContent(contentData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleLoginClick = () => {
    console.log("Login clicked");
  };

  // Calculate reading time
  const calculateReadTime = (content: string) => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    return Math.ceil(words / 200); // Assume 200 words per minute
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Loading state
  if (loading) {
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
          currentPage="blog-detail"
        />
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "60vh",
          flexDirection: "column",
          gap: "20px"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid rgba(255, 255, 255, 0.3)",
            borderTop: "3px solid #667eea",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <p style={{ color: "#9ca3af" }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !content) {
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
          currentPage="blog-detail"
        />
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          alignItems: "center", 
          height: "60vh",
          flexDirection: "column",
          gap: "20px"
        }}>
                      <p style={{ color: "#ef4444" }}>Load failed: {error || 'Content does not exist'}</p>
          <button
            onClick={() => onPageChange?.('feed')}
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "8px",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
                          Back to List
          </button>
        </div>
      </div>
    );
  }

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
        currentPage="blog-detail"
      />
      
      <div style={{ padding: isMobile ? "20px" : "40px", maxWidth: "800px", margin: "0 auto" }}>
        {/* Blog header */}
        <div style={{ marginBottom: "40px" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "16px",
            fontSize: "14px",
            color: "#9ca3af"
          }}>
            <span>{content.type || 'article'}</span>
            <span>•</span>
            <span>{calculateReadTime(content.content)} min read</span>
            <span>•</span>
            <span>{formatDate(content.created_at)}</span>
          </div>
          
          <h1 style={{
            fontSize: isMobile ? "28px" : "36px",
            fontWeight: "bold",
            marginBottom: "20px",
            lineHeight: "1.3",
            color: "white"
          }}>
            {content.title}
          </h1>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "24px"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: content.author?.avatar_url 
                ? `url(${content.author.avatar_url})` 
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              fontSize: "16px"
            }}>
              {content.author?.avatar_url ? '' : (content.author?.nickname?.charAt(0) || 'U')}
            </div>
            <div>
              <div style={{ fontWeight: "600", color: "white" }}>
                {content.author?.nickname || 'Anonymous'}
              </div>
              <div style={{ fontSize: "14px", color: "#9ca3af" }}>
                Reputation: {content.author?.reputation_score || 0}
              </div>
            </div>
          </div>
          
          {/* Cover image */}
          <div style={{
            height: "300px",
            background: content.cover_image_url 
              ? `url(${content.cover_image_url})` 
              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            borderRadius: "12px",
            marginBottom: "32px",
            position: "relative",
            overflow: "hidden"
          }}>
            {/* If no cover image, show gradient background */}
            {!content.cover_image_url && (
              <div style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              }} />
            )}
            
            {/* Gradient overlay to ensure text readability */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "80px",
              background: "linear-gradient(transparent, rgba(0, 0, 0, 0.7))"
            }} />
          </div>
        </div>

        {/* Blog content */}
        <div style={{ lineHeight: "1.8", fontSize: "18px" }}>
          <div style={{ 
            color: "#d1d5db",
            whiteSpace: "pre-wrap"
          }}>
            {content.content}
          </div>
        </div>

        {/* Interaction area */}
        <div style={{
          borderTop: "1px solid #374151",
          marginTop: "40px",
          paddingTop: "32px"
        }}>
          {/* Content interaction component */}
          <ContentInteraction
            contentId={content.id}
            initialStats={{
              likes: content.likes,
              dislikes: content.dislikes,
              bookmarks: 0,
              shares: 0,
              views: content.views
            }}
            onStatsChange={(newStats) => {
              // Update local content state
              setContent(prev => prev ? {
                ...prev,
                likes: newStats.likes,
                dislikes: newStats.dislikes
              } : null);
            }}
          />
          
          {/* Interaction staking area */}
          <InteractionStakingSection
            contentId={content.id}
            isMobile={isMobile}
            onInteraction={(type, success) => {
                      console.log('Interaction staking result:', type, success);
        // Additional processing logic can be added here
            }}
          />
          
          {/* Comment section */}
          <CommentSection
            postId={content.id.toString()}
            isMobile={isMobile}
            onTipComment={(commentId: string, authorName: string) => {
                  // TODO: Implement comment tip functionality
    console.log('Tip comment:', commentId, authorName);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage; 