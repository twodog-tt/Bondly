import React, { useState } from 'react';
import CommonNavbar from '../components/CommonNavbar';
import HeroSection from '../components/HeroSection';
import FeaturedArticles from '../components/FeaturedArticles';
import StakeSection from '../components/StakeSection';
import GovernanceSection from '../components/GovernanceSection';
import Footer from '../components/Footer';

interface HomeProps {
  isMobile: boolean;
  onPageChange?: (newPage: string) => void;
}

const Home: React.FC<HomeProps> = ({ isMobile, onPageChange }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginStep, setLoginStep] = useState(1);
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

  // 处理登录按钮点击
  const handleLoginClick = () => {
    setShowLoginModal(true);
    setLoginStep(1);
    setLoginData({
      username: '',
      email: '',
      verificationCode: '',
      avatar: null
    });
    setAvatarPreview("");
    setAvatarChoice(null);
    setVerificationCodeError("");
    setIsCodeSent(false);
    setIsVerifying(false);
    setCountdown(0);
  };

  // 关闭登录模态框
  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
    setLoginStep(1);
    setLoginData({
      username: '',
      email: '',
      verificationCode: '',
      avatar: null
    });
    setAvatarPreview("");
    setAvatarChoice(null);
    setVerificationCodeError("");
    setIsCodeSent(false);
    setIsVerifying(false);
    setCountdown(0);
  };

  // 输入框变化处理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (loginStep === 1) {
      setLoginData(prev => ({ ...prev, username: value }));
      const error = validateUsername(value);
      setUsernameError(error);
    } else if (loginStep === 2) {
      setLoginData(prev => ({ ...prev, email: value }));
      const error = validateEmail(value);
      setEmailError(error);
      if (!error) {
        setLoginData(prev => ({ ...prev, verificationCode: '' }));
        setVerificationCodeError("");
        setIsCodeSent(false);
        setCountdown(0);
      }
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
      const error = validateUsername(loginData.username);
      if (error) {
        setUsernameError(error);
        return;
      }
      setLoginStep(2);
    } else if (loginStep === 2) {
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
      // 模拟发送验证码
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
    } catch (error) {
      console.error("Failed to send verification code:", error);
      alert("Failed to send verification code");
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
      // 模拟验证验证码
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // 验证成功，进入下一步
      setLoginStep(3);
    } catch (error) {
      console.error("Verification code verification failed:", error);
      setVerificationCodeError("Verification code error, please re-enter");
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
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLoginData(prev => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = (event) => {
        setAvatarPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 创建用户提交
  const handleCreateUserSubmit = async () => {
    try {
      setIsVerifying(true);
      // 模拟创建用户
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const avatarText = avatarChoice === "upload" && loginData.avatar ? "and uploaded a profile picture" : "";
      setSuccessMessage(`Welcome ${loginData.username}!\nYour account has been successfully created${avatarText}.\nNow you can start creating and exploring content!`);
      setShowSuccessModal(true);
      setShowLoginModal(false);
    } catch (error) {
      console.error("Failed to create user:", error);
      alert("Failed to create user, please try again");
    } finally {
      setIsVerifying(false);
    }
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
        showWriteButton={true}
        showExploreButton={true}
        showDaoButton={true}
        showProfileButton={true}
        showDraftsButton={true}
        currentPage="home"
      />
      
      <HeroSection 
        isMobile={isMobile}
        onPageChange={onPageChange}
      />
      
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
              {[1, 2, 3].map((step) => (
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
            {loginStep === 1 && (
              <div>
                <h3 style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  textAlign: "center"
                }}>
                  Create Username
                </h3>
                <p style={{
                  fontSize: "14px",
                  color: "#9ca3af",
                  marginBottom: "24px",
                  textAlign: "center"
                }}>
                  Choose a unique username to identify your identity
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
                  Next
                </button>
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

            {loginStep === 3 && (
              <div>
                <h3 style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  textAlign: "center"
                }}>
                  Upload Profile Picture
                </h3>
                <p style={{
                  fontSize: "14px",
                  color: "#9ca3af",
                  marginBottom: "24px",
                  textAlign: "center"
                }}>
                  Choose a profile picture or upload later
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
