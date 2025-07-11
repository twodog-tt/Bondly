import React, { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useWalletConnect } from '../contexts/WalletConnectContext';
import useAuth from '../contexts/AuthContext';
import CommonNavbar from '../components/CommonNavbar';
import HeroSection from '../components/HeroSection';
import FeaturedArticles from '../components/FeaturedArticles';
import StakeSection from '../components/StakeSection';
import GovernanceSection from '../components/GovernanceSection';
import Footer from '../components/Footer';
import WalletChoiceModal from '../components/WalletChoiceModal';

interface HomeProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

// 首页荣誉分Top榜单数据（可后续对接后端）
const honorTopUsers = [
  {
    id: 1,
    name: "Alice Chen",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg",
    honor: 1280,
    blogCount: 24
  },
  {
    id: 2,
    name: "Bob Zhang", 
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    honor: 1105,
    blogCount: 19
  },
  {
    id: 3,
    name: "Cathy Wu",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg", 
    honor: 980,
    blogCount: 15
  }
];

const Home: React.FC<HomeProps> = ({ isMobile, onPageChange }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState(0); // 0: 选择登录方式, 1: 输入邮箱, 2: 输入用户名, 3: 头像选择
  const [loginData, setLoginData] = useState({
    username: '',
    email: '',
    verificationCode: '',
    avatar: null as File | null
  });
  
  // 登录相关状态
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarChoice, setAvatarChoice] = useState<"upload" | "skip" | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);
  
  // 钱包选择相关状态
  const [showWalletChoiceModal, setShowWalletChoiceModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);
  
  // 使用认证Hook和钱包连接Hook
  const { login, checkAuthStatus } = useAuth();
  const { openConnectModal } = useWalletConnect();

  // 处理登录按钮点击
  const handleLoginClick = () => {
    setShowLoginModal(true);
    setLoginStep(0); // 新增：第0步为选择登录方式
    setLoginData({
      username: '',
      email: '',
      verificationCode: '',
      avatar: null
    });
    setAvatarPreview("");
    setAvatarChoice(null);
    setEmailError("");
    setUsernameError("");
    setVerificationCodeError("");
    setIsCodeSent(false);
    setIsVerifying(false);
    setCountdown(0);
  };

  // 关闭登录模态框
  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    setLoginStep(0); // 重置为第0步
    setLoginData({
      username: '',
      email: '',
      verificationCode: '',
      avatar: null
    });
    setAvatarPreview("");
    setAvatarChoice(null);
    setEmailError("");
    setUsernameError("");
    setVerificationCodeError("");
    setIsCodeSent(false);
    setIsVerifying(false);
    setCountdown(0);
  };

  // 选择登录方式
  const handleLoginMethodSelect = (method: 'email' | 'wallet') => {
    if (method === 'wallet') {
      // 直接进行钱包登录
      handleWalletLogin();
    } else {
      // 进入邮箱登录流程
      setLoginStep(1);
    }
  };

  // 钱包登录处理
  const handleWalletLogin = async () => {
    try {
      // 检查钱包是否已连接
      if (!window.ethereum) {
        alert('请先安装 MetaMask 钱包');
        return;
      }

      // 请求连接钱包
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        alert('请连接钱包');
        return;
      }

      const walletAddress = accounts[0];
      

      // 调用钱包登录接口
      const { authApi } = await import('../utils/api');
      const loginResult = await authApi.walletLogin(walletAddress);

      

      // 使用认证Hook的login函数
      const userInfo = {
        user_id: loginResult.user_id,
        email: loginResult.email,
        nickname: loginResult.nickname,
        role: loginResult.role,
        is_new_user: loginResult.is_new_user,
        wallet_address: walletAddress // 存储钱包地址
      };

      login(loginResult.token, userInfo);

      // 如果是新用户，显示欢迎消息
      if (loginResult.is_new_user) {
        setSuccessMessage(`Welcome to Bondly!\nYour wallet account has been created successfully.\nWallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);
      } else {
        setSuccessMessage(`Welcome back!\nYou have successfully logged in with your wallet.\nWallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`);
      }

      setShowSuccessModal(true);
      setShowLoginModal(false);

      // 移除页面刷新，改为局部更新状态
      checkAuthStatus();

    } catch (error: any) {
      console.error('钱包登录失败:', error);
      
      if (error instanceof Error) {
        alert(`钱包登录失败: ${error.message}`);
      } else {
        alert('钱包登录失败，请稍后重试');
      }
    }
  };

  // 输入框变化处理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (loginStep === 1) {
      // 第一步：输入邮箱
      setLoginData(prev => ({ ...prev, email: value }));
      const error = validateEmail(value);
      setEmailError(error);
      if (!error) {
        setLoginData(prev => ({ ...prev, verificationCode: '' }));
        setVerificationCodeError("");
        setIsCodeSent(false);
        setCountdown(0);
      }
    } else if (loginStep === 2) {
      // 第二步：输入用户名
      setLoginData(prev => ({ ...prev, username: value }));
      const error = validateUsername(value);
      setUsernameError(error);
    }
  };

  // 验证码输入处理
  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLoginData(prev => ({ ...prev, verificationCode: value }));
    const error = validateVerificationCode(value);
    setVerificationCodeError(error);
  };

  // 下一步处理
  const handleNextStep = () => {
    if (loginStep === 1) {
      // 第一步：处理邮箱和验证码
      const error = validateEmail(loginData.email);
      if (error) {
        setEmailError(error);
        return;
      }
      if (!isCodeSent) {
        handleSendVerificationCode();
        return;
      }
      if (!loginData.verificationCode.trim()) {
        setVerificationCodeError("Verification code cannot be empty");
        return;
      }
      handleVerifyCode();
    } else if (loginStep === 2) {
      // 第二步：处理用户名
      const error = validateUsername(loginData.username);
      if (error) {
        setUsernameError(error);
        return;
      }
      setLoginStep(3);
    } else if (loginStep === 3) {
      handleCreateUserSubmit();
    }
  };

  // 用户名验证
  const validateUsername = (value: string) => {
    if (!value.trim()) {
      return "Username cannot be empty";
    }
    if (value.length < 3) {
      return "Username must be at least 3 characters";
    }
    if (value.length > 20) {
      return "Username cannot exceed 20 characters";
    }
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(value)) {
      return "Username can only contain letters, numbers, underscores and Chinese characters";
    }
    return "";
  };

  // 邮箱验证
  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return "Email cannot be empty";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Invalid email format";
    }
    return "";
  };

  // 验证码验证
  const validateVerificationCode = (value: string) => {
    if (!value.trim()) {
      return "Verification code cannot be empty";
    }
    if (value.length !== 6) {
      return "Verification code must be 6 digits";
    }
    if (!/^\d{6}$/.test(value)) {
      return "Verification code can only contain numbers";
    }
    return "";
  };

  // 发送验证码
  const handleSendVerificationCode = async () => {
    const emailError = validateEmail(loginData.email);
    if (emailError) {
      setEmailError(emailError);
      return;
    }

    try {
      setIsVerifying(true);
      
      // 调用真实的后端API
      const { authApi } = await import('../utils/api');
      const result = await authApi.sendCode(loginData.email);
      
      console.log('验证码发送成功:', result);
      setIsCodeSent(true);
      setCountdown(60);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error("Failed to send verification code:", error);
      
      if (error instanceof Error) {
        // 如果是API错误，显示具体的错误信息
        const errorMessage = error.message || "发送验证码失败";
        setEmailError(errorMessage);
      } else {
        setEmailError("发送验证码失败，请稍后重试");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // 验证验证码
  const handleVerifyCode = async () => {
    const codeError = validateVerificationCode(loginData.verificationCode);
    if (codeError) {
      setVerificationCodeError(codeError);
      return;
    }

    try {
      setIsVerifying(true);
      
      // 调用真实的后端API
      const { authApi } = await import('../utils/api');
      const { TokenManager } = await import('../utils/token');
      const result = await authApi.verifyCode(
        loginData.email, 
        loginData.verificationCode
      );
      
      console.log('验证码验证成功:', result);
      
      if (result.isValid) {
        // 检查是否返回了token
        if (result.token) {
          // 如果有token，说明用户已经完成注册，直接完成登录
  
          
          // 使用认证Hook的login函数
          login(result.token, {
            user_id: result.user_id || 0,
            email: loginData.email,
            nickname: result.nickname || loginData.email.split('@')[0],
            role: result.role || 'user',
            is_new_user: result.is_new_user || false
          });
          
  
          
          // 显示登录成功消息
          setSuccessMessage(`Welcome back!\nYou have successfully logged in with email: ${loginData.email}`);
          setShowSuccessModal(true);
          setShowLoginModal(false);
          
          // 移除页面刷新，改为局部更新状态
          // 调用checkAuthStatus确保所有组件都能获取到最新的登录状态
          checkAuthStatus();
  
        } else {
          // 没有token，说明是新用户，需要继续注册流程
          console.log('验证码验证成功，但需要继续注册流程');
          setLoginStep(2);
        }
      } else {
        setVerificationCodeError("验证码无效，请重新输入");
      }
    } catch (error: any) {
      console.error("Verification code verification failed:", error);
      
      if (error instanceof Error) {
        // 如果是API错误，显示具体的错误信息
        const errorMessage = error.message || "验证码验证失败";
        setVerificationCodeError(errorMessage);
      } else {
        setVerificationCodeError("验证码验证失败，请重新输入");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // 处理头像选择
  const handleAvatarChoice = (choice: "upload" | "skip") => {
    setAvatarChoice(choice);
    if (choice === "skip") {
      setLoginData(prev => ({ ...prev, avatar: null }));
      setAvatarPreview("");
    }
  };

  // 处理头像文件选择
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        // 调用真实的后端API上传图片
        const { uploadApi } = await import('../utils/api');
        const result = await uploadApi.uploadImage(file);
        
        setLoginData(prev => ({ ...prev, avatar: file }));
        setAvatarPreview(result.url);
      } catch (error: any) {
        console.error("头像上传失败:", error);
        
        // 显示错误信息
        if (error instanceof Error) {
          alert(`头像上传失败: ${error.message}`);
        } else {
          alert("头像上传失败，请重试");
        }
      }
    }
  };

  // 创建用户提交
  const handleCreateUserSubmit = async () => {
    try {
      setIsVerifying(true);
      
      // 调用登录接口
      const { authApi } = await import('../utils/api');
      
      // 如果有头像预览URL，则传递给登录接口
      const imageUrl = avatarPreview || undefined;
      const loginResult = await authApi.login(loginData.email, loginData.username, imageUrl);
      
      
      
      // 使用认证Hook的login函数
      // 根据用户是否有自己的钱包地址来决定存储哪个地址
      const userInfo = {
        user_id: loginResult.user_id,
        email: loginResult.email,
        nickname: loginResult.nickname,
        role: loginResult.role,
        is_new_user: loginResult.is_new_user
      };
      
      // 如果用户没有连接自己的钱包，则获取并存储托管钱包地址
      if (!loginResult.wallet_address) {
        try {
          // 获取用户的托管钱包信息
          const { walletApi } = await import('../utils/api');
          const walletInfo = await walletApi.getWalletInfo(loginResult.user_id);
          if (walletInfo.custody_wallet_address) {
            (userInfo as any).custody_wallet_address = walletInfo.custody_wallet_address;
    
          }
        } catch (error) {
  
        }
      } else {
        // 用户连接了自己的钱包，存储用户钱包地址
        (userInfo as any).wallet_address = loginResult.wallet_address;

      }
      
      login(loginResult.token, userInfo);
      
      
      
      // 调用checkAuthStatus确保所有组件都能获取到最新的登录状态
      checkAuthStatus();
      
      
      // 如果是新用户，显示钱包选择弹窗
      if (loginResult.is_new_user) {
        setCurrentUserId(loginResult.user_id);
        setShowWalletChoiceModal(true);
        setShowLoginModal(false);
      } else {
        // 老用户直接显示成功消息
        const welcomeMessage = `Welcome back ${loginData.username}!\nYou have successfully logged in.`;
        setSuccessMessage(welcomeMessage);
        setShowSuccessModal(true);
        setShowLoginModal(false);
      }
    } catch (error: any) {
      console.error("Failed to login:", error);
      
      if (error instanceof Error) {
        alert(`登录失败: ${error.message}`);
      } else {
        alert("登录失败，请稍后重试");
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // 生成托管钱包
  const handleGenerateCustodyWallet = async () => {
    if (!currentUserId) return;
    
    try {
      setIsGeneratingWallet(true);
      
      const { walletApi } = await import('../utils/api');
      const result = await walletApi.generateCustodyWallet(currentUserId);
      
      
      
      // 调用checkAuthStatus确保所有组件都能获取到最新的登录状态
      checkAuthStatus();
      
      // 显示成功消息
      const successMessage = `Welcome ${loginData.username}!\nYour account has been successfully created.\nCustody wallet generated: ${result.custody_wallet_address}\nNow you can start creating and exploring content!`;
      setSuccessMessage(successMessage);
      setShowWalletChoiceModal(false);
      setShowSuccessModal(true);
      
      // 移除页面刷新，改为局部更新状态
      checkAuthStatus();
    } catch (error: any) {
      console.error("Failed to generate custody wallet:", error);
      
      if (error instanceof Error) {
        alert(`生成托管钱包失败: ${error.message}`);
      } else {
        alert("生成托管钱包失败，请稍后重试");
      }
    } finally {
      setIsGeneratingWallet(false);
    }
  };

  // 连接钱包
  const handleConnectWallet = () => {
    setShowWalletChoiceModal(false);
    
    // 触发Connect Wallet功能
    openConnectModal();
    
    // 显示成功消息
    const successMessage = `Welcome ${loginData.username}!\nYour account has been successfully created.\nPlease connect your wallet in the popup.\nYou can refresh the page after connecting your wallet.`;
    setSuccessMessage(successMessage);
    setShowSuccessModal(true);
    
    // 不自动刷新页面，让用户完成钱包连接操作后再手动刷新
  };

  // 关闭钱包选择弹窗
  const handleCloseWalletChoiceModal = () => {
    setShowWalletChoiceModal(false);
    setCurrentUserId(null);
    
    // 显示成功消息
    const successMessage = `Welcome ${loginData.username}!\nYour account has been successfully created.\nYou can manage your wallet later.`;
    setSuccessMessage(successMessage);
    setShowSuccessModal(true);
    
    // 移除页面刷新，改为局部更新状态
    checkAuthStatus();
  };

  // 关闭成功模态框
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };



  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(to bottom, #0b0c1a 0%, #11131f 100%)",
      color: "white",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
    }}>
      {/* 使用组件 */}
      <CommonNavbar 
        isMobile={isMobile} 
        onLoginClick={handleLoginClick}
        onPageChange={onPageChange}
        showHomeButton={true}
        showExploreButton={true}
        showDaoButton={true}
        showProfileButton={true}
        currentPage="home"
      />
      
      <HeroSection 
        isMobile={isMobile}
        onPageChange={onPageChange}
      />

      {/* 荣誉分Top榜单 */}
      <section style={{
        maxWidth: isMobile ? "99%" : "1100px",
        margin: isMobile ? "-32px auto 32px auto" : "-48px auto 48px auto",
        background: "rgba(255,255,255,0.04)",
        borderRadius: "24px",
        boxShadow: "0 4px 24px rgba(102,126,234,0.08)",
        border: "1px solid #23244a",
        padding: isMobile ? "24px 8px" : "40px 56px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}>
        <h2 style={{
          fontSize: isMobile ? "22px" : "30px",
          fontWeight: 800,
          marginBottom: "8px",
          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          textAlign: "center"
        }}>
          🏆 Honor Leaderboard
        </h2>
        <p style={{ color: "#b3b8c5", fontSize: isMobile ? "14px" : "17px", marginBottom: isMobile ? "18px" : "28px", textAlign: "center", maxWidth: "600px" }}>
          Discover the most reputable creators in the Bondly community. The Honor Leaderboard highlights users with the highest honor points and their blogging achievements.
        </p>
        <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "18px" : "40px", width: "100%", justifyContent: "center", alignItems: "center" }}>
          {honorTopUsers.map((user, idx) => (
            <div key={user.id}
              onClick={() => {
                const addressOrENS = user.name.toLowerCase().replace(/\s+/g, "");
                // 跳转到用户公开个人资料页面
                onPageChange?.(`user-profile-${addressOrENS}`);
              }}
              style={{
                background: "linear-gradient(135deg, rgba(102,126,234,0.10) 0%, rgba(118,75,162,0.10) 100%)",
                borderRadius: "22px",
                padding: isMobile ? "18px 12px" : "32px 36px",
                minWidth: isMobile ? "auto" : "220px",
                textAlign: "center",
                boxShadow: idx === 0 ? "0 0 0 3px #667eea" : "0 2px 16px rgba(102,126,234,0.08)",
                border: idx === 0 ? "2.5px solid #667eea" : "1.5px solid #23244a",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.2s cubic-bezier(.4,2,.6,1)",
                backdropFilter: "blur(2px)",
                cursor: "pointer",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px) scale(1.03)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}
            >
              {/* 冠军/亚军/季军角标 */}
              {(idx === 0 || idx === 1 || idx === 2) && (
                <div style={{
                  position: "absolute",
                  top: "14px",
                  right: "14px",
                  background: idx === 0
                    ? "linear-gradient(90deg, #667eea 0%, #764ba2 100%)"
                    : idx === 1
                    ? "linear-gradient(90deg, #60a5fa 0%, #a78bfa 100%)"
                    : "linear-gradient(90deg, #fbbf24 0%, #f472b6 100%)",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "13px",
                  padding: "4px 14px 4px 10px",
                  borderRadius: "0 12px 0 12px",
                  boxShadow: "0 2px 8px rgba(102,126,234,0.18)",
                  letterSpacing: "1px",
                  zIndex: 2
                }}>
                  {`No.${idx + 1}`}
                </div>
              )}
              <img src={user.avatar} alt={user.name} style={{
                width: isMobile ? "56px" : "80px",
                height: isMobile ? "56px" : "80px",
                borderRadius: "50%",
                marginBottom: "14px",
                border: idx === 0 ? "3px solid #764ba2" : "2px solid #374151",
                boxShadow: idx === 0 ? "0 0 0 4px #e9d8fd" : undefined,
              }} />
              <div style={{ fontWeight: 700, fontSize: isMobile ? "16px" : "20px", marginBottom: "6px", color: idx === 0 ? "#764ba2" : "#fff" }}>{user.name}</div>
              <div style={{ display: "flex", justifyContent: "center", gap: "14px", marginBottom: "8px" }}>
                <span style={{ color: "#667eea", fontWeight: 700, fontSize: isMobile ? "15px" : "18px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{marginRight:2}}><circle cx="10" cy="10" r="10" fill="#667eea"/><text x="50%" y="55%" textAnchor="middle" fill="#fff" fontSize="11" fontWeight="bold" dy=".3em">H</text></svg>
                  {user.honor}
                </span>
              </div>
              <div style={{ color: "#b3b8c5", fontSize: isMobile ? "13px" : "15px" }}>Blogs: {user.blogCount}</div>
            </div>
          ))}
        </div>
      </section>
      
      <FeaturedArticles isMobile={isMobile} />
      
      <StakeSection isMobile={isMobile} />
      
      <GovernanceSection 
        isMobile={isMobile} 
        onPageChange={onPageChange}
      />
      
      <Footer isMobile={isMobile} />

      {/* 登录模态框 */}
      {showLoginModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: isMobile ? "16px" : "20px"
        }}>
          <div style={{
            background: "#151728",
            borderRadius: "20px",
            padding: isMobile ? "24px" : "40px",
            maxWidth: "500px",
            width: "90%",
            border: "1px solid #374151",
            position: "relative"
          }}>
            {/* 关闭按钮 */}
            <button
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "transparent",
                border: "none",
                color: "#9ca3af",
                fontSize: "24px",
                cursor: "pointer",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                transition: "background 0.2s ease"
              }}
              onClick={handleCloseLoginModal}
              onMouseEnter={(e) => e.currentTarget.style.background = "#374151"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              ✕
            </button>

            {/* 步骤指示器 */}
            <div style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "30px",
              gap: "8px"
            }}>
              {[0, 1, 2, 3].map((step) => (
                <div
                  key={step}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: step <= loginStep ? "#3b82f6" : "#374151",
                    transition: "background 0.3s ease"
                  }}
                />
              ))}
            </div>

            {/* 步骤内容 */}
            {loginStep === 0 && (
              <div>
                <h3 style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  textAlign: "center"
                }}>
                  Choose Login Method
                </h3>
                <p style={{
                  fontSize: "14px",
                  color: "#9ca3af",
                  marginBottom: "24px",
                  textAlign: "center"
                }}>
                  Select how you would like to log in to your account.
                </p>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  marginBottom: "24px"
                }}>
                  <button
                    onClick={() => handleLoginMethodSelect('email')}
                    style={{
                      width: "100%",
                      padding: "12px 24px",
                      fontSize: "16px",
                      fontWeight: "600",
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "background 0.3s ease"
                    }}
                  >
                    Email Login
                  </button>
                  <button
                    onClick={() => handleLoginMethodSelect('wallet')}
                    style={{
                      width: "100%",
                      padding: "12px 24px",
                      fontSize: "16px",
                      fontWeight: "600",
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "background 0.3s ease"
                    }}
                  >
                    Wallet Login (MetaMask)
                  </button>
                </div>
              </div>
            )}

            {loginStep === 1 && (
              <div>
                <h3 style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  textAlign: "center"
                }}>
                  {isCodeSent ? "Verify Email" : "Enter Email"}
                </h3>
                <p style={{
                  fontSize: "14px",
                  color: "#9ca3af",
                  marginBottom: "24px",
                  textAlign: "center"
                }}>
                  {isCodeSent ? "Please enter the 6-digit verification code sent to your email" : "We will send a verification code to your email"}
                </p>
                
                {!isCodeSent ? (
                  <>
                    <input
                      type="email"
                      placeholder="Enter email address"
                      value={loginData.email}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        fontSize: "16px",
                        border: emailError ? "2px solid #ef4444" : "2px solid #374151",
                        borderRadius: "12px",
                        background: "#0f101f",
                        color: "white",
                        marginBottom: emailError ? "8px" : "24px",
                        transition: "border-color 0.3s ease"
                      }}
                    />
                    {emailError && (
                      <p style={{
                        color: "#ef4444",
                        fontSize: "14px",
                        marginBottom: "16px"
                      }}>
                        {emailError}
                      </p>
                    )}
                    <button
                      onClick={handleNextStep}
                      disabled={isVerifying || !loginData.email.trim() || !!emailError}
                      style={{
                        width: "100%",
                        padding: "12px 24px",
                        fontSize: "16px",
                        fontWeight: "600",
                        background: loginData.email.trim() && !emailError && !isVerifying ? "#3b82f6" : "#374151",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        cursor: loginData.email.trim() && !emailError && !isVerifying ? "pointer" : "not-allowed",
                        transition: "background 0.3s ease"
                      }}
                    >
                      {isVerifying ? "Sending..." : "Send Verification Code"}
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{
                      display: "flex",
                      gap: "12px",
                      marginBottom: "24px"
                    }}>
                      <input
                        type="text"
                        placeholder="Verification Code"
                        value={loginData.verificationCode}
                        onChange={handleVerificationCodeChange}
                        maxLength={6}
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          fontSize: "16px",
                          border: verificationCodeError ? "2px solid #ef4444" : "2px solid #374151",
                          borderRadius: "12px",
                          background: "#0f101f",
                          color: "white",
                          transition: "border-color 0.3s ease"
                        }}
                      />
                      <button
                        onClick={handleSendVerificationCode}
                        disabled={isVerifying || countdown > 0}
                        style={{
                          padding: "12px 16px",
                          fontSize: "14px",
                          background: countdown > 0 ? "#374151" : "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: "12px",
                          cursor: countdown > 0 ? "not-allowed" : "pointer",
                          whiteSpace: "nowrap",
                          transition: "background 0.3s ease"
                        }}
                      >
                        {countdown > 0 ? `${countdown}s` : "Resend"}
                      </button>
                    </div>
                    {verificationCodeError && (
                      <p style={{
                        color: "#ef4444",
                        fontSize: "14px",
                        marginBottom: "16px"
                      }}>
                        {verificationCodeError}
                      </p>
                    )}
                    <button
                      onClick={handleNextStep}
                      disabled={isVerifying || !loginData.verificationCode.trim() || !!verificationCodeError}
                      style={{
                        width: "100%",
                        padding: "12px 24px",
                        fontSize: "16px",
                        fontWeight: "600",
                        background: loginData.verificationCode.trim() && !verificationCodeError && !isVerifying ? "#3b82f6" : "#374151",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        cursor: loginData.verificationCode.trim() && !verificationCodeError && !isVerifying ? "pointer" : "not-allowed",
                        transition: "background 0.3s ease"
                      }}
                    >
                      {isVerifying ? "Verifying..." : "Verify and Continue"}
                    </button>
                  </>
                )}
              </div>
            )}

            {loginStep === 2 && (
              <div>
                <h3 style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  textAlign: "center"
                }}>
                  Complete Registration
                </h3>
                <p style={{
                  fontSize: "14px",
                  color: "#9ca3af",
                  marginBottom: "24px",
                  textAlign: "center"
                }}>
                  Choose a unique username to complete your account setup
                </p>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={loginData.username}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "16px",
                    border: usernameError ? "2px solid #ef4444" : "2px solid #374151",
                    borderRadius: "12px",
                    background: "#0f101f",
                    color: "white",
                    marginBottom: usernameError ? "8px" : "24px",
                    transition: "border-color 0.3s ease"
                  }}
                />
                {usernameError && (
                  <p style={{
                    color: "#ef4444",
                    fontSize: "14px",
                    marginBottom: "16px"
                  }}>
                    {usernameError}
                  </p>
                )}
                <button
                  onClick={handleNextStep}
                  disabled={!loginData.username.trim() || !!usernameError}
                  style={{
                    width: "100%",
                    padding: "12px 24px",
                    fontSize: "16px",
                    fontWeight: "600",
                    background: loginData.username.trim() && !usernameError ? "#3b82f6" : "#374151",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    cursor: loginData.username.trim() && !usernameError ? "pointer" : "not-allowed",
                    transition: "background 0.3s ease"
                  }}
                >
                  Continue to Profile Setup
                </button>
              </div>
            )}

            {loginStep === 3 && (
              <div>
                <h3 style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  textAlign: "center"
                }}>
                  Profile Picture (Optional)
                </h3>
                <p style={{
                  fontSize: "14px",
                  color: "#9ca3af",
                  marginBottom: "24px",
                  textAlign: "center"
                }}>
                  Add a profile picture to personalize your account (you can skip this step)
                </p>
                
                <div style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "24px"
                }}>
                  <button
                    onClick={() => handleAvatarChoice("upload")}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      fontSize: "14px",
                      background: avatarChoice === "upload" ? "#3b82f6" : "#374151",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "background 0.3s ease"
                    }}
                  >
                    Upload Profile Picture
                  </button>
                  <button
                    onClick={() => handleAvatarChoice("skip")}
                    style={{
                      flex: 1,
                      padding: "12px 24px",
                      fontSize: "14px",
                      background: avatarChoice === "skip" ? "#3b82f6" : "#374151",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "background 0.3s ease"
                    }}
                  >
                    Skip
                  </button>
                </div>

                {avatarChoice === "upload" && (
                  <div style={{ textAlign: "center", marginBottom: "24px" }}>
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile Picture Preview"
                        style={{
                          width: "100px",
                          height: "100px",
                          borderRadius: "50%",
                          objectFit: "cover",
                          marginBottom: "16px",
                          border: "3px solid #3b82f6"
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        border: "3px dashed #374151",
                        margin: "0 auto 16px auto",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#0f101f",
                        cursor: "pointer"
                      }}>
                        <span style={{ fontSize: "24px", color: "#9ca3af" }}>📷</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      style={{ display: "none" }}
                      id="avatar-upload"
                    />
                    <label
                      htmlFor="avatar-upload"
                      style={{
                        padding: "8px 16px",
                        fontSize: "14px",
                        background: "#3b82f6",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "background 0.3s ease"
                      }}
                    >
                      Choose File
                    </label>
                  </div>
                )}

                <button
                  onClick={handleNextStep}
                  disabled={avatarChoice === null}
                  style={{
                    width: "100%",
                    padding: "12px 24px",
                    fontSize: "16px",
                    fontWeight: "600",
                    background: avatarChoice !== null ? "#3b82f6" : "#374151",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    cursor: avatarChoice !== null ? "pointer" : "not-allowed",
                    transition: "background 0.3s ease"
                  }}
                >
                  Complete Registration
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 钱包选择弹窗 */}
      <WalletChoiceModal
        isOpen={showWalletChoiceModal}
        onClose={handleCloseWalletChoiceModal}
        onGenerateCustodyWallet={handleGenerateCustodyWallet}
        onConnectWallet={handleConnectWallet}
        isMobile={isMobile}
      />

      {/* 成功模态框 */}
      {showSuccessModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1001,
          padding: "20px"
        }}>
          <div style={{
            background: "#151728",
            borderRadius: "20px",
            padding: "40px",
            maxWidth: "500px",
            width: "90%",
            border: "1px solid #374151",
            textAlign: "center"
          }}>
            <div style={{
              fontSize: "60px",
              marginBottom: "20px"
            }}>
              🎉
            </div>
            <h3 style={{
              fontSize: "28px",
              fontWeight: "bold",
              marginBottom: "16px",
              color: "#10b981"
            }}>
              Registration Successful!
            </h3>
            <p style={{
              fontSize: "16px",
              color: "#9ca3af",
              lineHeight: "1.6",
              marginBottom: "24px",
              whiteSpace: "pre-line"
            }}>
              {successMessage}
            </p>
            <button
              onClick={handleCloseSuccessModal}
              style={{
                padding: "12px 32px",
                fontSize: "16px",
                fontWeight: "600",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "background 0.3s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#2563eb"}
              onMouseLeave={(e) => e.currentTarget.style.background = "#3b82f6"}
            >
              Start Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
