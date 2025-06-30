import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

interface ProfileProps {
  isMobile: boolean;
}

export default function Profile({ isMobile }: ProfileProps) {
  const { t } = useTranslation();
  const [visibleStats, setVisibleStats] = useState<number[]>([]);

  // 统计卡片进入动画
  useEffect(() => {
    const timer = setTimeout(() => {
      [0, 1, 2, 3].forEach((index) => {
        setTimeout(() => {
          setVisibleStats((prev) => [...prev, index]);
        }, index * 150);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // 按钮涟漪效果
  const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x + "px";
    ripple.style.top = y + "px";
    ripple.style.position = "absolute";
    ripple.style.borderRadius = "50%";
    ripple.style.background = "rgba(255, 255, 255, 0.3)";
    ripple.style.transform = "scale(0)";
    ripple.style.animation = "ripple 0.6s linear";
    ripple.style.pointerEvents = "none";

    button.style.position = "relative";
    button.style.overflow = "hidden";
    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600);
  };

  const containerStyle = {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "40px 20px",
  };

  const mobileContainerStyle = {
    ...containerStyle,
    padding: "20px 16px",
  };

  const titleStyle = {
    fontSize: "40px",
    fontWeight: "bold",
    marginBottom: "32px",
    textAlign: "center" as const,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
    backgroundClip: "text" as const,
  };

  const mobileTitleStyle = {
    ...titleStyle,
    fontSize: "28px",
    marginBottom: "24px",
  };

  const profileCardStyle = {
    background: "white",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    border: "1px solid rgba(0,0,0,0.05)",
    marginBottom: "32px",
  };

  const mobileProfileCardStyle = {
    ...profileCardStyle,
    padding: "24px 20px",
    marginBottom: "24px",
    borderRadius: "16px",
  };

  const profileHeaderStyle = {
    display: "flex",
    alignItems: "center",
    marginBottom: "32px",
  };

  const mobileProfileHeaderStyle = {
    ...profileHeaderStyle,
    flexDirection: "column" as const,
    textAlign: "center" as const,
    marginBottom: "24px",
  };

  const avatarStyle = {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "36px",
    fontWeight: "bold",
    marginRight: "32px",
    boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
  };

  const mobileAvatarStyle = {
    ...avatarStyle,
    width: "80px",
    height: "80px",
    fontSize: "28px",
    marginRight: "0",
    marginBottom: "16px",
  };

  const userInfoStyle = {
    flex: 1,
  };

  const userNameStyle = {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "8px",
    color: "#2d3748",
  };

  const mobileUserNameStyle = {
    ...userNameStyle,
    fontSize: "24px",
  };

  const userMetaStyle = {
    color: "#718096",
    fontSize: "16px",
    marginBottom: "4px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const statsGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "24px",
    marginBottom: "32px",
  };

  const mobileStatsGridStyle = {
    ...statsGridStyle,
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "16px",
    marginBottom: "24px",
  };

  const statItemStyle = {
    textAlign: "center" as const,
    padding: "24px",
    background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    transition: "all 0.3s ease",
    cursor: "pointer",
    opacity: 0,
    transform: "translateY(20px)",
  };

  const mobileStatItemStyle = {
    ...statItemStyle,
    padding: "16px 12px",
    borderRadius: "12px",
  };

  const animatedStatItemStyle = (index: number) => ({
    ...statItemStyle,
    opacity: visibleStats.includes(index) ? 1 : 0,
    transform: visibleStats.includes(index)
      ? "translateY(0)"
      : "translateY(20px)",
    transition: `all 0.6s ease ${index * 0.15}s`,
  });

  const animatedMobileStatItemStyle = (index: number) => ({
    ...mobileStatItemStyle,
    opacity: visibleStats.includes(index) ? 1 : 0,
    transform: visibleStats.includes(index)
      ? "translateY(0)"
      : "translateY(20px)",
    transition: `all 0.6s ease ${index * 0.15}s`,
  });

  const statValueStyle = {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#2d3748",
  };

  const mobileStatValueStyle = {
    ...statValueStyle,
    fontSize: "20px",
  };

  const statLabelStyle = {
    color: "#718096",
    fontSize: "14px",
    marginBottom: "8px",
    fontWeight: "500",
  };

  const mobileStatLabelStyle = {
    ...statLabelStyle,
    fontSize: "12px",
  };

  const dividerStyle = {
    height: "2px",
    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
    margin: "32px 0",
    borderRadius: "1px",
  };

  const sectionStyle = {
    marginBottom: "32px",
  };

  const sectionTitleStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#2d3748",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const activityItemStyle = {
    padding: "20px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    marginBottom: "12px",
    background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  };

  const walletInfoStyle = {
    padding: "24px",
    background: "linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)",
    borderRadius: "12px",
    border: "1px solid #9ae6b4",
  };

  return (
    <div style={isMobile ? mobileContainerStyle : containerStyle}>
      <h1 style={isMobile ? mobileTitleStyle : titleStyle}>
        👤 {t("profile_title")}
      </h1>

      <div style={isMobile ? mobileProfileCardStyle : profileCardStyle}>
        <div style={isMobile ? mobileProfileHeaderStyle : profileHeaderStyle}>
          <div style={isMobile ? mobileAvatarStyle : avatarStyle}>A</div>
          <div style={userInfoStyle}>
            <div style={isMobile ? mobileUserNameStyle : userNameStyle}>
              Alice.eth
            </div>
            <div style={userMetaStyle}>
              <span>🆔 SBT: #123456</span>
            </div>
            <div style={userMetaStyle}>
              <span>⭐ {t("reputation")}: 89</span>
            </div>
          </div>
        </div>

        <div style={isMobile ? mobileStatsGridStyle : statsGridStyle}>
          <div
            style={
              isMobile
                ? animatedMobileStatItemStyle(0)
                : animatedStatItemStyle(0)
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={isMobile ? mobileStatLabelStyle : statLabelStyle}>
              🎯 {t("level")}
            </div>
            <div style={isMobile ? mobileStatValueStyle : statValueStyle}>
              5
            </div>
          </div>
          <div
            style={
              isMobile
                ? animatedMobileStatItemStyle(1)
                : animatedStatItemStyle(1)
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={isMobile ? mobileStatLabelStyle : statLabelStyle}>
              💰 {t("token_balance")}
            </div>
            <div style={isMobile ? mobileStatValueStyle : statValueStyle}>
              1200 BOND
            </div>
          </div>
          <div
            style={
              isMobile
                ? animatedMobileStatItemStyle(2)
                : animatedStatItemStyle(2)
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={isMobile ? mobileStatLabelStyle : statLabelStyle}>
              🖼️ {t("nft_count")}
            </div>
            <div style={isMobile ? mobileStatValueStyle : statValueStyle}>
              3
            </div>
          </div>
          <div
            style={
              isMobile
                ? animatedMobileStatItemStyle(3)
                : animatedStatItemStyle(3)
            }
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div style={isMobile ? mobileStatLabelStyle : statLabelStyle}>
              🏛️ {t("dao_rights")}
            </div>
            <div style={isMobile ? mobileStatValueStyle : statValueStyle}>
              {t("connected")}
            </div>
          </div>
        </div>
      </div>

      <div style={profileCardStyle}>
        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>📊 {t("recent_activities")}</h2>
          <div
            style={activityItemStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateX(4px)";
              e.currentTarget.style.background =
                "linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateX(0)";
              e.currentTarget.style.background =
                "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)";
            }}
          >
            <strong>📝 {t("publish_content")}</strong> - "
            {t("web3_social_value")}" (2 {t("hours_ago")})
          </div>
          <div
            style={activityItemStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateX(4px)";
              e.currentTarget.style.background =
                "linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateX(0)";
              e.currentTarget.style.background =
                "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)";
            }}
          >
            <strong>❤️ {t("received_likes")}</strong> - {t("received_likes")} 12{" "}
            {t("like")} (3 {t("hours_ago")})
          </div>
          <div
            style={activityItemStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateX(4px)";
              e.currentTarget.style.background =
                "linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateX(0)";
              e.currentTarget.style.background =
                "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)";
            }}
          >
            <strong>🖼️ {t("mint_nft")}</strong> - {t("mint_nft")} "
            {t("bondly_introduction")}" (1 {t("day_ago")})
          </div>
        </div>

        <div style={sectionStyle}>
          <h2 style={sectionTitleStyle}>🔐 {t("wallet_management")}</h2>
          <div style={walletInfoStyle}>
            <p style={{ marginBottom: "8px" }}>
              <strong>{t("current_wallet")}:</strong> 0x1234...5678
            </p>
            <p style={{ marginBottom: "8px" }}>
              <strong>{t("network")}:</strong> {t("ethereum_mainnet")}
            </p>
            <p style={{ marginBottom: "8px" }}>
              <strong>{t("connection_status")}:</strong>{" "}
              <span style={{ color: "#38a169" }}>✅ {t("connected")}</span>
            </p>
          </div>
        </div>
      </div>

      <div
        style={{
          textAlign: "center" as const,
          color: "#718096",
          fontSize: "16px",
          padding: "40px",
        }}
      >
        <p>🚀 {t("more_features_developing")}</p>
        <p style={{ fontSize: "14px", marginTop: "8px" }}>
          {t("continue_exploring")}
        </p>
      </div>
    </div>
  );
}
