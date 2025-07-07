import React from 'react';
import CommonNavbar from '../components/CommonNavbar';

interface BlogListPageProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const BlogListPage: React.FC<BlogListPageProps> = ({ isMobile, onPageChange }) => {
  // 模拟博客数据
  const blogs = [
    {
      id: 1,
      title: "Web3 Social Revolution: How Bondly is Changing the Game",
      excerpt: "Explore how Bondly is revolutionizing social media through blockchain technology, creating a new paradigm where user interactions become valuable assets.",
      author: "Bondly Team",
      readTime: "5 min read",
      category: "Technology",
      date: "2024-01-15",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop"
    },
    {
      id: 2,
      title: "The Future of Decentralized Social Networks",
      excerpt: "Discover the potential of decentralized social platforms and how they're reshaping the way we connect, share, and monetize our online presence.",
      author: "Crypto Analyst",
      readTime: "7 min read",
      category: "Analysis",
      date: "2024-01-12",
      image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&h=200&fit=crop"
    },
    {
      id: 3,
      title: "Building Trust in Web3: Reputation Systems Explained",
      excerpt: "Learn how reputation systems work in decentralized networks and why they're crucial for building trust in the Web3 ecosystem.",
      author: "Web3 Researcher",
      readTime: "6 min read",
      category: "Education",
      date: "2024-01-10",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop"
    },
    {
      id: 4,
      title: "NFTs and Social Media: The Perfect Match",
      excerpt: "Explore how NFTs are transforming social media by enabling users to monetize their content and build unique digital identities.",
      author: "NFT Expert",
      readTime: "8 min read",
      category: "NFT",
      date: "2024-01-08",
      image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&h=200&fit=crop"
    },
    {
      id: 5,
      title: "DAO Governance: Community-Driven Decision Making",
      excerpt: "Understand how DAOs are revolutionizing governance and decision-making processes in decentralized organizations.",
      author: "DAO Specialist",
      readTime: "9 min read",
      category: "Governance",
      date: "2024-01-05",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop"
    },
    {
      id: 6,
      title: "Staking Mechanisms in SocialFi Platforms",
      excerpt: "Learn about staking mechanisms and how they incentivize positive behavior in social finance platforms.",
      author: "DeFi Analyst",
      readTime: "6 min read",
      category: "DeFi",
      date: "2024-01-03",
      image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?w=400&h=200&fit=crop"
    }
  ];

  const handleLoginClick = () => {
    // 处理登录点击
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
        currentPage="blog-list"
      />
      
      <div style={{ padding: isMobile ? "20px" : "40px" }}>
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
            Blog & Articles
          </h1>
          <p style={{ 
            fontSize: "18px", 
            color: "#9ca3af",
            maxWidth: "600px",
            margin: "0 auto"
          }}>
            Discover insights, tutorials, and updates about the future of decentralized social networks
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "32px",
          maxWidth: "1200px",
          margin: "0 auto"
        }}>
          {blogs.map((blog) => (
            <div key={blog.id} style={{
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "16px",
              overflow: "hidden",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              cursor: "pointer",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={() => onPageChange?.("blog-detail")}
            >
              <div style={{
                height: "200px",
                background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                position: "relative",
                overflow: "hidden"
              }}>
                <img 
                  src={blog.image} 
                  alt={blog.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    opacity: "0.8"
                  }}
                />
                <div style={{
                  position: "absolute",
                  top: "12px",
                  left: "12px",
                  background: "rgba(0, 0, 0, 0.7)",
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "500"
                }}>
                  {blog.category}
                </div>
              </div>
              
              <div style={{ padding: "24px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "12px",
                  fontSize: "14px",
                  color: "#9ca3af"
                }}>
                  <span>{blog.author}</span>
                  <span>•</span>
                  <span>{blog.readTime}</span>
                  <span>•</span>
                  <span>{blog.date}</span>
                </div>
                
                <h3 style={{
                  fontSize: "20px",
                  fontWeight: "600",
                  marginBottom: "12px",
                  lineHeight: "1.4",
                  color: "white"
                }}>
                  {blog.title}
                </h3>
                
                <p style={{
                  fontSize: "16px",
                  color: "#d1d5db",
                  lineHeight: "1.6",
                  marginBottom: "20px"
                }}>
                  {blog.excerpt}
                </p>
                
                <button style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "opacity 0.2s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = "0.9"}
                onMouseLeave={(e) => e.currentTarget.style.opacity = "1"}
                >
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogListPage; 