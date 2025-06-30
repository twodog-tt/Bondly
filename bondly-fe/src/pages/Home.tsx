import { useState } from "react";
import { useTranslation } from "react-i18next";
import WalletConnect from "../components/WalletConnect";

interface HomeProps {
  isMobile: boolean;
}

const highlights = [
  { icon: "📱", label: "user_entry", value: "progressive_login_desc" },
  { icon: "🧱", label: "value_loop", value: "value_loop_desc" },
  { icon: "🔐", label: "security_guard", value: "security_guard_desc" },
  { icon: "📊", label: "reputation_system", value: "reputation_system_desc" },
  { icon: "💸", label: "token_mechanism", value: "token_mechanism_desc" },
  {
    icon: "⚙️",
    label: "architecture_design",
    value: "architecture_design_desc",
  },
];

const roadmap = [
  { stage: "stage_one", content: "progressive_login", status: "completed" },
  { stage: "stage_two", content: "content_publishing", status: "completed" },
  {
    stage: "stage_three",
    content: "reputation_calculation",
    status: "in_progress",
  },
  { stage: "stage_four", content: "nft_integration", status: "coming_soon" },
  { stage: "stage_five", content: "dao_governance", status: "coming_soon" },
];

export default function Home({ isMobile }: HomeProps) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1); // 1: 用户名, 2: 邮箱, 3: 头像
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [avatarChoice, setAvatarChoice] = useState<"upload" | "skip" | null>(
    null,
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationCodeError, setVerificationCodeError] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const containerStyle = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px",
    position: "relative" as const,
    overflow: "hidden" as const,
  };

  const mobileContainerStyle = {
    ...containerStyle,
    padding: "20px 16px",
  };

  const heroStyle = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "24px",
    padding: "60px 40px",
    textAlign: "center" as const,
    position: "relative" as const,
    overflow: "hidden" as const,
    marginBottom: "60px",
    boxShadow: "0 20px 40px rgba(102, 126, 234, 0.3)",
  };

  const mobileHeroStyle = {
    ...heroStyle,
    padding: "40px 24px",
    marginBottom: "40px",
  };

  const titleStyle = {
    fontSize: "48px",
    fontWeight: "bold",
    color: "white",
    marginBottom: "16px",
    textShadow: "0 4px 8px rgba(0,0,0,0.3)",
  };

  const mobileTitleStyle = {
    ...titleStyle,
    fontSize: "32px",
  };

  const subtitleStyle = {
    fontSize: "24px",
    color: "rgba(255,255,255,0.9)",
    marginBottom: "24px",
    lineHeight: "1.4",
  };

  const mobileSubtitleStyle = {
    ...subtitleStyle,
    fontSize: "18px",
    marginBottom: "20px",
  };

  const createUserButtonStyle = {
    padding: "16px 32px",
    fontSize: "18px",
    fontWeight: "bold",
    background: "rgba(255,255,255,0.2)",
    color: "white",
    border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
  };

  const mobileCreateUserButtonStyle = {
    ...createUserButtonStyle,
    padding: "14px 28px",
    fontSize: "16px",
  };

  const heroDecoration = {
    position: "absolute" as const,
    top: "-50%",
    right: "-20%",
    width: "300px",
    height: "300px",
    borderRadius: "50%",
    background:
      "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
    zIndex: 0,
  };

  const heroContent = {
    position: "relative" as const,
    zIndex: 1,
  };

  // 和平装饰元素
  const peaceDecorations = {
    position: "absolute" as const,
    top: "20px",
    left: "20px",
    fontSize: "30px",
    color: "rgba(102, 126, 234, 0.2)",
    zIndex: 1,
  };

  const peaceDecorationsRight = {
    position: "absolute" as const,
    top: "20px",
    right: "20px",
    fontSize: "30px",
    color: "rgba(118, 75, 162, 0.2)",
    zIndex: 1,
  };

  const sectionStyle = {
    marginBottom: "60px",
    padding: "40px",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    border: "1px solid rgba(0,0,0,0.05)",
    position: "relative" as const,
    overflow: "hidden" as const,
  };

  const mobileSectionStyle = {
    ...sectionStyle,
    marginBottom: "40px",
    padding: "24px 20px",
    borderRadius: "12px",
  };

  const sectionDecoration = {
    position: "absolute" as const,
    top: 0,
    right: 0,
    width: "100px",
    height: "100px",
    background:
      "linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%)",
    borderRadius: "0 16px 0 100%",
    zIndex: 0,
  };

  const mobileSectionDecoration = {
    ...sectionDecoration,
    width: "60px",
    height: "60px",
    borderRadius: "0 12px 0 60px",
  };

  const sectionContent = {
    position: "relative" as const,
    zIndex: 1,
  };

  const sectionTitleStyle = {
    fontSize: "32px",
    fontWeight: "bold",
    marginBottom: "24px",
    color: "#2d3748",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  };

  const mobileSectionTitleStyle = {
    ...sectionTitleStyle,
    fontSize: "24px",
    marginBottom: "20px",
  };

  const dividerStyle = {
    height: "3px",
    background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
    margin: "40px 0",
    borderRadius: "2px",
  };

  const highlightsGridStyle: any = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
    marginBottom: "24px",
  };

  const mobileHighlightsGridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "16px",
    marginBottom: "20px",
  };

  const highlightCardStyle = {
    padding: "24px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    borderLeft: "4px solid #667eea",
    position: "relative" as const,
    overflow: "hidden" as const,
  };

  const mobileHighlightCardStyle = {
    ...highlightCardStyle,
    padding: "20px 16px",
    borderRadius: "10px",
  };

  const cardDecoration = {
    position: "absolute" as const,
    top: 0,
    right: 0,
    width: "60px",
    height: "60px",
    background:
      "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
    borderRadius: "0 12px 0 60px",
    zIndex: 0,
  };

  const mobileCardDecoration = {
    ...cardDecoration,
    width: "40px",
    height: "40px",
    borderRadius: "0 10px 0 40px",
  };

  const cardContent = {
    position: "relative" as const,
    zIndex: 1,
  };

  const highlightLabelStyle = {
    fontWeight: "bold",
    fontSize: "18px",
    marginBottom: "12px",
    color: "#2d3748",
  };

  const mobileHighlightLabelStyle = {
    ...highlightLabelStyle,
    fontSize: "16px",
    marginBottom: "10px",
  };

  const highlightValueStyle = {
    color: "#4a5568",
    lineHeight: "1.6",
  };

  const mobileHighlightValueStyle = {
    ...highlightValueStyle,
    fontSize: "14px",
    lineHeight: "1.5",
  };

  const roadmapItemStyle = {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: "16px",
    padding: "16px",
    background: "#f7fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    transition: "all 0.3s ease",
    cursor: "pointer",
    gap: "16px",
  };

  const mobileRoadmapItemStyle = {
    ...roadmapItemStyle,
    flexDirection: "column" as const,
    gap: "8px",
    padding: "12px",
  };

  const stageStyle = {
    minWidth: "120px",
    fontWeight: "bold",
    color: "#667eea",
    flexShrink: 0,
  };

  const mobileStageStyle = {
    ...stageStyle,
    minWidth: "auto",
    fontSize: "14px",
  };

  const contentStyle = {
    flex: 1,
    color: "#4a5568",
    lineHeight: "1.5",
  };

  const mobileContentStyle = {
    ...contentStyle,
    fontSize: "14px",
  };

  const statusStyle = {
    fontSize: "20px",
    marginLeft: "16px",
    flexShrink: 0,
  };

  const mobileStatusStyle = {
    ...statusStyle,
    fontSize: "16px",
    marginLeft: "0",
    alignSelf: "flex-end" as const,
  };

  // 模态框样式
  const modalOverlayStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    padding: isMobile ? "16px" : "20px",
  };

  const modalStyle = {
    background: "white",
    borderRadius: "16px",
    padding: "40px",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    position: "relative" as const,
    animation: "fadeIn 0.3s ease-out",
  };

  const mobileModalStyle = {
    ...modalStyle,
    padding: "24px",
    width: "90%",
    maxWidth: "400px",
    margin: "0",
    borderRadius: "12px",
    maxHeight: "80vh",
    overflowY: "auto" as const,
  };

  const modalTitleStyle = {
    fontSize: "24px",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#2d3748",
    textAlign: "center" as const,
  };

  const mobileModalTitleStyle = {
    ...modalTitleStyle,
    fontSize: "20px",
    marginBottom: "16px",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    fontSize: "16px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    marginBottom: "20px",
    transition: "border-color 0.3s ease",
  };

  const inputErrorStyle = {
    ...inputStyle,
    border: "2px solid #e53e3e",
    background: "#fff5f5",
  };

  const errorMessageStyle = {
    color: "#e53e3e",
    fontSize: "14px",
    marginTop: "-16px",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const inputSuccessStyle = {
    ...inputStyle,
    border: "2px solid #48bb78",
    background: "#f0fff4",
  };

  const verificationContainerStyle = {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    marginBottom: "20px",
  };

  const verificationInputStyle = {
    flex: 1,
    padding: "12px 16px",
    fontSize: "16px",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    transition: "border-color 0.3s ease",
  };

  const verificationInputErrorStyle = {
    ...verificationInputStyle,
    border: "2px solid #e53e3e",
    background: "#fff5f5",
  };

  const sendCodeButtonStyle = {
    padding: "12px 20px",
    fontSize: "14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap" as const,
    minWidth: "120px",
  };

  const sendCodeButtonDisabledStyle = {
    ...sendCodeButtonStyle,
    background: "#e2e8f0",
    color: "#a0aec0",
    cursor: "not-allowed",
  };

  const verifyButtonStyle = {
    padding: "12px 24px",
    fontSize: "14px",
    background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    whiteSpace: "nowrap" as const,
    minWidth: "100px",
  };

  const verifyButtonDisabledStyle = {
    ...verifyButtonStyle,
    background: "#e2e8f0",
    color: "#a0aec0",
    cursor: "not-allowed",
  };

  const buttonGroupStyle = {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  };

  const confirmButtonStyle = {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  const cancelButtonStyle = {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "bold",
    background: "#e2e8f0",
    color: "#4a5568",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  };

  // 步骤指示器样式
  const stepIndicatorStyle = {
    display: "flex",
    justifyContent: "center",
    marginBottom: "30px",
    gap: "8px",
  };

  const stepDotStyle = {
    width: "12px",
    height: "12px",
    borderRadius: "50%",
    background: "#e2e8f0",
    transition: "background 0.3s ease",
  };

  const activeStepDotStyle = {
    ...stepDotStyle,
    background: "#667eea",
  };

  const completedStepDotStyle = {
    ...stepDotStyle,
    background: "#48bb78",
  };

  // 步骤标题样式
  const stepTitleStyle = {
    fontSize: "14px",
    color: "#718096",
    textAlign: "center" as const,
    marginBottom: "20px",
  };

  // 头像上传样式
  const avatarUploadStyle = {
    textAlign: "center" as const,
    marginBottom: "20px",
  };

  const avatarOptionsStyle = {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    marginBottom: "20px",
  };

  const mobileAvatarOptionsStyle = {
    ...avatarOptionsStyle,
    flexDirection: "column" as const,
    gap: "12px",
  };

  const avatarOptionButtonStyle = {
    padding: "12px 24px",
    fontSize: "14px",
    background: "#f7fafc",
    color: "#4a5568",
    border: "2px solid #e2e8f0",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minWidth: "120px",
    fontWeight: "500",
  };

  const selectedAvatarOptionStyle = {
    ...avatarOptionButtonStyle,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderColor: "#667eea",
  };

  const avatarPreviewStyle = {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover" as const,
    border: "4px solid #e2e8f0",
    marginBottom: "16px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  };

  const mobileAvatarPreviewStyle = {
    ...avatarPreviewStyle,
    width: "100px",
    height: "100px",
  };

  const avatarUploadAreaStyle = {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    border: "3px dashed #cbd5e0",
    margin: "0 auto 16px auto",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    position: "relative" as const,
  };

  const mobileAvatarUploadAreaStyle = {
    ...avatarUploadAreaStyle,
    width: "100px",
    height: "100px",
  };

  const disabledAvatarUploadAreaStyle = {
    ...avatarUploadAreaStyle,
    opacity: 0.5,
    cursor: "not-allowed",
  };

  const uploadIconStyle = {
    fontSize: "24px",
    color: "#a0aec0",
    marginBottom: "8px",
  };

  const uploadTextStyle = {
    fontSize: "12px",
    color: "#718096",
    textAlign: "center" as const,
    lineHeight: "1.2",
  };

  const avatarUploadButtonStyle = {
    padding: "12px 24px",
    fontSize: "14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginBottom: "12px",
    minWidth: "150px",
    fontWeight: "500",
  };

  const disabledAvatarUploadButtonStyle = {
    ...avatarUploadButtonStyle,
    background: "#e2e8f0",
    color: "#a0aec0",
    cursor: "not-allowed",
  };

  const skipAvatarButtonStyle = {
    padding: "10px 20px",
    fontSize: "14px",
    background: "transparent",
    color: "#718096",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minWidth: "150px",
  };

  // 成功弹窗样式
  const successModalOverlayStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2001,
    padding: "20px",
  };

  const successModalStyle = {
    background: "white",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
    position: "relative" as const,
    textAlign: "center" as const,
    border: "1px solid rgba(255,255,255,0.2)",
    animation: "fadeIn 0.4s ease-out",
  };

  const successIconStyle = {
    fontSize: "60px",
    marginBottom: "20px",
    animation: "bounce 0.6s ease-in-out",
  };

  const successTitleStyle = {
    fontSize: "28px",
    fontWeight: "bold",
    marginBottom: "16px",
    background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
    backgroundClip: "text" as const,
  };

  const successMessageStyle = {
    fontSize: "16px",
    color: "#4a5568",
    lineHeight: "1.6",
    marginBottom: "24px",
    whiteSpace: "pre-line" as const,
  };

  const successButtonStyle = {
    padding: "14px 32px",
    fontSize: "16px",
    fontWeight: "bold",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
  };

  const successDecorationStyle = {
    position: "absolute" as const,
    top: "-10px",
    left: "50%",
    transform: "translateX(-50%)",
    width: "60px",
    height: "4px",
    background: "linear-gradient(90deg, #48bb78 0%, #38a169 100%)",
    borderRadius: "2px",
  };

  const keyframesStyle = `
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
    }
    
    @keyframes twinkle {
      0%, 100% { opacity: 0.3; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }
    
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.6; }
      50% { transform: scale(1.1); opacity: 1; }
    }
    
    @keyframes bounce {
      0%, 20%, 53%, 80%, 100% { transform: translate3d(0,0,0); }
      40%, 43% { transform: translate3d(0,-30px,0); }
      70% { transform: translate3d(0,-15px,0); }
      90% { transform: translate3d(0,-4px,0); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: scale(0.9) translateY(-20px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `;

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

  const handleCreateUser = () => {
    setShowModal(true);
    setStep(1);
    setUsername("");
    setEmail("");
    setAvatar(null);
    setAvatarPreview("");
    setAvatarChoice(null);
    setVerificationCode("");
    setVerificationCodeError("");
    setIsCodeSent(false);
    setIsVerifying(false);
    setCountdown(0);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setStep(1);
    setUsername("");
    setEmail("");
    setAvatar(null);
    setAvatarPreview("");
    setAvatarChoice(null);
    setVerificationCode("");
    setVerificationCodeError("");
    setIsCodeSent(false);
    setIsVerifying(false);
    setCountdown(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (step === 1) {
      setUsername(value);
      const error = validateUsername(value);
      setUsernameError(error);
    } else if (step === 2) {
      setEmail(value);
      const error = validateEmail(value);
      setEmailError(error);
      // 重置验证码相关状态
      if (!error) {
        setVerificationCode("");
        setVerificationCodeError("");
        setIsCodeSent(false);
        setCountdown(0);
      }
    }
  };

  const handleVerificationCodeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setVerificationCode(value);
    const error = validateVerificationCode(value);
    setVerificationCodeError(error);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNextStep();
    }
  };

  const handleNextStep = () => {
    if (step === 1) {
      const error = validateUsername(username);
      if (error) {
        setUsernameError(error);
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const error = validateEmail(email);
      if (error) {
        setEmailError(error);
        return;
      }
      // 邮箱验证通过后，需要发送验证码
      if (!isCodeSent) {
        handleSendVerificationCode();
        return;
      }
      // 如果验证码已发送但未验证，需要先验证
      if (!verificationCode.trim()) {
        setVerificationCodeError(t("verification_code_required"));
        return;
      }
      // 验证验证码
      handleVerifyCode();
    } else if (step === 3) {
      // 创建用户逻辑
      handleCreateUserSubmit();
    }
  };

  const handleCreateUserSubmit = async () => {
    try {
      // 准备用户数据
      const userData = {
        username: username.trim(),
        email: email.trim(),
        avatar: avatar,
        avatarChoice: avatarChoice,
      };

      // TODO: 调用后端API创建用户
      // 示例API调用代码（已注释）：
      /*
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          avatarChoice: userData.avatarChoice
        })
      });
      
      if (userData.avatar && userData.avatarChoice === 'upload') {
        // 上传头像文件
        const formData = new FormData();
        formData.append('avatar', userData.avatar);
        formData.append('userId', response.data.userId);
        
        await fetch('/api/users/upload-avatar', {
          method: 'POST',
          body: formData
        });
      }
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      const result = await response.json();
      */

      // 模拟成功响应
      const result = { success: true, userId: "user_" + Date.now() };

      // 显示成功消息
      const avatarInfo =
        avatarChoice === "upload" && avatar
          ? `\n头像: ${avatar.name}`
          : "\n头像: 未上传";
      const welcomeMessage = `👋 ${t("welcome_to_bondly")}\n\n📝 ${t("username_label")}: ${username}\n📧 ${t("email_label")}: ${email}${avatarInfo}\n\n🚀 ${t("start_exploring")}`;

      setSuccessMessage(welcomeMessage);
      setShowSuccessModal(true);
      handleCloseModal();
    } catch (error) {
      console.error("Error creating user:", error);
      alert(t("user_creation_error"));
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setSuccessMessage("");
  };

  // 用户名验证函数
  const validateUsername = (value: string) => {
    if (!value.trim()) {
      return t("username_required");
    }
    if (value.length < 3) {
      return t("username_too_short");
    }
    if (value.length > 20) {
      return t("username_too_long");
    }
    if (!/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/.test(value)) {
      return t("username_invalid_chars");
    }
    return "";
  };

  // 邮箱验证函数
  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return t("email_required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return t("email_invalid_format");
    }
    return "";
  };

  // 验证码验证函数
  const validateVerificationCode = (value: string) => {
    if (!value.trim()) {
      return t("verification_code_required");
    }
    if (value.length !== 6) {
      return t("verification_code_length");
    }
    if (!/^\d{6}$/.test(value)) {
      return t("verification_code_format");
    }
    return "";
  };

  // 发送验证码
  const handleSendVerificationCode = async () => {
    const emailError = validateEmail(email);
    if (emailError) {
      setEmailError(emailError);
      return;
    }

    try {
      setIsVerifying(true);

      // TODO: 调用后端API发送验证码
      // 示例API调用代码（已注释）：
      /*
      const response = await fetch('/api/auth/send-verification-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to send verification code');
      }
      
      const result = await response.json();
      */

      // 模拟成功响应
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟网络延迟

      setIsCodeSent(true);
      setCountdown(60); // 60秒倒计时

      // 开始倒计时
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
      console.error("Error sending verification code:", error);
      alert(t("send_code_error"));
    } finally {
      setIsVerifying(false);
    }
  };

  // 验证验证码
  const handleVerifyCode = async () => {
    const codeError = validateVerificationCode(verificationCode);
    if (codeError) {
      setVerificationCodeError(codeError);
      return;
    }

    try {
      setIsVerifying(true);

      // TODO: 调用后端API验证验证码
      // 示例API调用代码（已注释）：
      /*
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          code: verificationCode.trim()
        })
      });
      
      if (!response.ok) {
        throw new Error('Invalid verification code');
      }
      
      const result = await response.json();
      */

      // 模拟成功响应
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 模拟网络延迟

      // 验证成功，进入下一步
      setStep(3);
    } catch (error) {
      console.error("Error verifying code:", error);
      setVerificationCodeError(t("verification_code_invalid"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAvatarChoice = (choice: "upload" | "skip") => {
    setAvatarChoice(choice);
    if (choice === "skip") {
      setAvatar(null);
      setAvatarPreview("");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return t("create_username");
      case 2:
        return isCodeSent ? t("verify_email") : t("enter_email");
      case 3:
        return t("upload_avatar");
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (step) {
      case 1:
        return t("username_step_desc");
      case 2:
        return isCodeSent
          ? t("verification_code_step_desc")
          : t("email_step_desc");
      case 3:
        return t("avatar_step_desc");
      default:
        return "";
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return username.trim().length > 0 && !usernameError;
      case 2:
        if (!email.trim() || emailError) return false;
        if (!isCodeSent) return true; // 可以发送验证码
        return verificationCode.trim().length > 0 && !verificationCodeError; // 验证码已输入且无错误
      case 3:
        return avatarChoice !== null; // 必须选择头像选项
      default:
        return false;
    }
  };

  return (
    <div style={isMobile ? mobileContainerStyle : containerStyle}>
      <div style={isMobile ? mobileHeroStyle : heroStyle}>
        <div style={heroDecoration}></div>
        <div style={peaceDecorations}>🕊️ ☮️</div>
        <div style={peaceDecorationsRight}>🌍 🌍</div>
        <div style={heroContent}>
          <h1 style={isMobile ? mobileTitleStyle : titleStyle}>Bondly</h1>
          <p style={isMobile ? mobileSubtitleStyle : subtitleStyle}>
            {t("decentralized_social_value_network")}
          </p>
          <p
            style={{
              fontSize: isMobile ? "16px" : "18px",
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {t("slogan")}
          </p>
          <button
            style={
              isMobile ? mobileCreateUserButtonStyle : createUserButtonStyle
            }
            onClick={(e) => {
              createRipple(e);
              handleCreateUser();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 15px rgba(102, 126, 234, 0.3)";
            }}
          >
            🚀 {t("join_bondly")}
          </button>

          {/* 钱包连接组件 */}
          {/**
          <WalletConnect 
            isMobile={isMobile} 
            onConnect={() => {
              console.log('Wallet connected successfully!');
            }}
          />
          **/}
        </div>
      </div>

      <div style={isMobile ? mobileSectionStyle : sectionStyle}>
        <div
          style={isMobile ? mobileSectionDecoration : sectionDecoration}
        ></div>
        <div style={sectionContent}>
          <h2 style={isMobile ? mobileSectionTitleStyle : sectionTitleStyle}>
            📋 {t("project_intro")}
          </h2>
          <p
            style={{
              fontSize: isMobile ? "16px" : "18px",
              lineHeight: "1.8",
              color: "#4a5568",
            }}
          >
            {t("project_intro_content")}
          </p>
        </div>
      </div>

      <div style={isMobile ? mobileSectionStyle : sectionStyle}>
        <div
          style={isMobile ? mobileSectionDecoration : sectionDecoration}
        ></div>
        <div style={sectionContent}>
          <h2 style={isMobile ? mobileSectionTitleStyle : sectionTitleStyle}>
            ✨ {t("highlights")}
          </h2>
          <div
            style={isMobile ? mobileHighlightsGridStyle : highlightsGridStyle}
          >
            {highlights.map((item, index) => (
              <div
                key={item.label}
                style={isMobile ? mobileHighlightCardStyle : highlightCardStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    "0 20px 40px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={isMobile ? mobileCardDecoration : cardDecoration}
                ></div>
                <div style={cardContent}>
                  <div
                    style={
                      isMobile ? mobileHighlightLabelStyle : highlightLabelStyle
                    }
                  >
                    {item.icon} {t(item.label)}
                  </div>
                  <div
                    style={
                      isMobile ? mobileHighlightValueStyle : highlightValueStyle
                    }
                  >
                    {t(item.value)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={isMobile ? mobileSectionStyle : sectionStyle}>
        <div
          style={isMobile ? mobileSectionDecoration : sectionDecoration}
        ></div>
        <div style={sectionContent}>
          <h2 style={isMobile ? mobileSectionTitleStyle : sectionTitleStyle}>
            🎯 {t("vision")}
          </h2>
          <div
            style={{
              fontSize: isMobile ? "16px" : "18px",
              lineHeight: "1.8",
              color: "#4a5568",
            }}
          >
            <p style={{ marginBottom: "12px" }}>1. {t("vision1")}</p>
            <p style={{ marginBottom: "12px" }}>2. {t("vision2")}</p>
            <p style={{ marginBottom: "12px" }}>3. {t("vision3")}</p>
            <p style={{ marginBottom: "12px" }}>4. {t("vision4")}</p>
          </div>
        </div>
      </div>

      <div style={isMobile ? mobileSectionStyle : sectionStyle}>
        <div
          style={isMobile ? mobileSectionDecoration : sectionDecoration}
        ></div>
        <div style={sectionContent}>
          <h2 style={isMobile ? mobileSectionTitleStyle : sectionTitleStyle}>
            🗺️ {t("roadmap")}
          </h2>
          {roadmap.map((item) => (
            <div
              key={item.stage}
              style={isMobile ? mobileRoadmapItemStyle : roadmapItemStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(4px)";
                e.currentTarget.style.background = "#edf2f7";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0)";
                e.currentTarget.style.background = "#f7fafc";
              }}
            >
              <span style={isMobile ? mobileStageStyle : stageStyle}>
                {t(item.stage)}
              </span>
              <span style={isMobile ? mobileContentStyle : contentStyle}>
                {t(item.content)}
              </span>
              <span style={isMobile ? mobileStatusStyle : statusStyle}>
                {item.status === "completed"
                  ? "✅"
                  : item.status === "in_progress"
                    ? "⏳"
                    : "🔜"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 创建用户模态框 */}
      {showModal && (
        <div style={modalOverlayStyle} onClick={handleCloseModal}>
          <div
            style={isMobile ? mobileModalStyle : modalStyle}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={stepIndicatorStyle}>
              <div style={step === 1 ? activeStepDotStyle : stepDotStyle}></div>
              <div style={step === 2 ? activeStepDotStyle : stepDotStyle}></div>
              <div
                style={
                  step === 2 && isCodeSent
                    ? completedStepDotStyle
                    : stepDotStyle
                }
              ></div>
              <div style={step === 3 ? activeStepDotStyle : stepDotStyle}></div>
            </div>

            <h2 style={isMobile ? mobileModalTitleStyle : modalTitleStyle}>
              {getStepTitle()}
            </h2>

            <p style={stepTitleStyle}>{getStepDescription()}</p>

            {step === 1 && (
              <>
                <input
                  type="text"
                  placeholder={t("username_placeholder")}
                  value={username}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  style={
                    usernameError
                      ? inputErrorStyle
                      : username.trim() && !usernameError
                        ? inputSuccessStyle
                        : inputStyle
                  }
                  autoFocus
                />
                {usernameError && (
                  <div style={errorMessageStyle}>❌ {usernameError}</div>
                )}
              </>
            )}
            {step === 2 && (
              <>
                <input
                  type="email"
                  placeholder={t("email_placeholder")}
                  value={email}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  style={
                    emailError
                      ? inputErrorStyle
                      : email.trim() && !emailError
                        ? inputSuccessStyle
                        : inputStyle
                  }
                  autoFocus
                />
                {emailError && (
                  <div style={errorMessageStyle}>❌ {emailError}</div>
                )}

                {/* 验证码输入区域 */}
                {isCodeSent && (
                  <>
                    <div style={verificationContainerStyle}>
                      <input
                        type="text"
                        placeholder={t("verification_code_placeholder")}
                        value={verificationCode}
                        onChange={handleVerificationCodeChange}
                        onKeyPress={handleKeyPress}
                        style={
                          verificationCodeError
                            ? verificationInputErrorStyle
                            : verificationInputStyle
                        }
                        maxLength={6}
                        autoFocus
                      />
                      <button
                        style={
                          isVerifying
                            ? verifyButtonDisabledStyle
                            : verifyButtonStyle
                        }
                        onClick={handleVerifyCode}
                        disabled={
                          isVerifying ||
                          !verificationCode.trim() ||
                          !!verificationCodeError
                        }
                        onMouseEnter={(e) => {
                          if (
                            !isVerifying &&
                            verificationCode.trim() &&
                            !verificationCodeError
                          ) {
                            e.currentTarget.style.transform =
                              "translateY(-1px)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(72, 187, 120, 0.3)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (
                            !isVerifying &&
                            verificationCode.trim() &&
                            !verificationCodeError
                          ) {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "none";
                          }
                        }}
                      >
                        {isVerifying ? "⏳" : "✅"} {t("verify")}
                      </button>
                    </div>
                    {verificationCodeError && (
                      <div style={errorMessageStyle}>
                        ❌ {verificationCodeError}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
            {step === 3 && (
              <div style={avatarUploadStyle}>
                {/* 头像选择选项 */}
                <div
                  style={
                    isMobile ? mobileAvatarOptionsStyle : avatarOptionsStyle
                  }
                >
                  <button
                    style={
                      avatarChoice === "upload"
                        ? selectedAvatarOptionStyle
                        : avatarOptionButtonStyle
                    }
                    onClick={() => handleAvatarChoice("upload")}
                    onMouseEnter={(e) => {
                      if (avatarChoice !== "upload") {
                        e.currentTarget.style.background = "#edf2f7";
                        e.currentTarget.style.borderColor = "#a0aec0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (avatarChoice !== "upload") {
                        e.currentTarget.style.background = "#f7fafc";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                      }
                    }}
                  >
                    📷 选择头像
                  </button>
                  <button
                    style={
                      avatarChoice === "skip"
                        ? selectedAvatarOptionStyle
                        : avatarOptionButtonStyle
                    }
                    onClick={() => handleAvatarChoice("skip")}
                    onMouseEnter={(e) => {
                      if (avatarChoice !== "skip") {
                        e.currentTarget.style.background = "#edf2f7";
                        e.currentTarget.style.borderColor = "#a0aec0";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (avatarChoice !== "skip") {
                        e.currentTarget.style.background = "#f7fafc";
                        e.currentTarget.style.borderColor = "#e2e8f0";
                      }
                    }}
                  >
                    ⏭️ 跳过头像
                  </button>
                </div>

                {/* 头像上传区域 - 只在选择"选择头像"时显示 */}
                {avatarChoice === "upload" && (
                  <>
                    {avatarPreview ? (
                      <div style={{ position: "relative" as const }}>
                        <img
                          src={avatarPreview}
                          alt="Avatar Preview"
                          style={
                            isMobile
                              ? mobileAvatarPreviewStyle
                              : avatarPreviewStyle
                          }
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = (e) => {
                              const target = e.target as HTMLInputElement;
                              const file = target.files?.[0];
                              if (file) {
                                setAvatar(file);
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  setAvatarPreview(e.target?.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            };
                            input.click();
                          }}
                          onMouseEnter={(e) => {
                            const overlay = e.currentTarget
                              .nextElementSibling as HTMLElement;
                            if (overlay) {
                              overlay.style.opacity = "1";
                            }
                          }}
                          onMouseLeave={(e) => {
                            const overlay = e.currentTarget
                              .nextElementSibling as HTMLElement;
                            if (overlay) {
                              overlay.style.opacity = "0";
                            }
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            background: "rgba(0,0,0,0.7)",
                            color: "white",
                            padding: "8px 12px",
                            borderRadius: "20px",
                            fontSize: "12px",
                            opacity: 0,
                            transition: "opacity 0.3s ease",
                            pointerEvents: "none",
                          }}
                        >
                          点击更换
                        </div>
                      </div>
                    ) : (
                      <div
                        style={
                          isMobile
                            ? mobileAvatarUploadAreaStyle
                            : avatarUploadAreaStyle
                        }
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.onchange = (e) => {
                            const target = e.target as HTMLInputElement;
                            const file = target.files?.[0];
                            if (file) {
                              setAvatar(file);
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setAvatarPreview(e.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#667eea";
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%)";
                          e.currentTarget.style.transform = "scale(1.02)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#cbd5e0";
                          e.currentTarget.style.background =
                            "linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)";
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        <span style={uploadIconStyle}>📷</span>
                        <p style={uploadTextStyle}>点击上传头像</p>
                      </div>
                    )}
                    <button
                      style={avatarUploadButtonStyle}
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e) => {
                          const target = e.target as HTMLInputElement;
                          const file = target.files?.[0];
                          if (file) {
                            setAvatar(file);
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              setAvatarPreview(e.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow =
                          "0 6px 20px rgba(102, 126, 234, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      {avatarPreview ? "🔄 更换头像" : "📤 选择头像"}
                    </button>
                  </>
                )}

                {/* 跳过头像的提示信息 */}
                {avatarChoice === "skip" && (
                  <div
                    style={{
                      padding: "20px",
                      background:
                        "linear-gradient(135deg, #f0fff4 0%, #e6fffa 100%)",
                      borderRadius: "12px",
                      border: "1px solid #9ae6b4",
                      textAlign: "center",
                      color: "#2f855a",
                    }}
                  >
                    <p style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
                      ✅ 已选择跳过头像
                    </p>
                    <p style={{ margin: "0", fontSize: "14px", opacity: 0.8 }}>
                      您可以稍后在个人资料中上传头像
                    </p>
                  </div>
                )}
              </div>
            )}

            <div style={buttonGroupStyle}>
              <button
                style={cancelButtonStyle}
                onClick={(e) => {
                  createRipple(e);
                  handleCloseModal();
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#cbd5e0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#e2e8f0";
                }}
              >
                {t("cancel")}
              </button>
              <button
                style={confirmButtonStyle}
                onClick={(e) => {
                  createRipple(e);
                  handleNextStep();
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(102, 126, 234, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                disabled={!canProceed() || isVerifying}
              >
                {step === 2 && !isCodeSent ? (
                  <>
                    📧 {t("send_verification_code")}
                    {isVerifying && "..."}
                  </>
                ) : step === 2 && isCodeSent ? (
                  <>
                    🔄 {t("resend_code")}
                    {countdown > 0 && ` (${countdown}s)`}
                  </>
                ) : step === 3 ? (
                  t("confirm_create")
                ) : (
                  <>
                    {t("next")}
                    {isVerifying && "..."}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 成功弹窗 */}
      {showSuccessModal && (
        <div style={successModalOverlayStyle} onClick={handleCloseSuccessModal}>
          <div
            style={{
              ...successModalStyle,
              animation: "fadeIn 0.4s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={successDecorationStyle}></div>
            <div style={successIconStyle}>🎉</div>
            <h2 style={successTitleStyle}>{t("user_creation_success")}</h2>
            <p style={successMessageStyle}>{successMessage}</p>
            <button
              style={successButtonStyle}
              onClick={handleCloseSuccessModal}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 20px rgba(102, 126, 234, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 15px rgba(102, 126, 234, 0.3)";
              }}
            >
              🚀 {t("start_exploring")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
