package response

// 成功消息常量
const (
	// 认证相关成功消息
	MsgVerificationCodeSent  = "验证码发送成功"
	MsgVerificationCodeValid = "验证码验证成功"
	MsgLoginSuccess          = "登录成功"
	MsgGetStatusSuccess      = "获取状态成功"

	// 用户相关成功消息
	MsgUserCreated       = "用户创建成功"
	MsgUserUpdated       = "用户更新成功"
	MsgUserRetrieved     = "获取用户成功"
	MsgUserListRetrieved = "获取用户列表成功"
	MsgRankingRetrieved  = "获取排行榜成功"

	// 文件上传相关成功消息
	MsgImageUploaded = "图片上传成功"

	// 系统相关成功消息
	MsgHealthCheckSuccess        = "健康检查成功"
	MsgBlockchainStatusRetrieved = "获取区块链状态成功"
	MsgContractInfoRetrieved     = "获取合约信息成功"
	MsgUserInfoRetrieved         = "获取用户信息成功"
	MsgUserBalanceRetrieved      = "获取用户余额成功"
	MsgContentListRetrieved      = "获取内容列表成功"
	MsgContentDetailRetrieved    = "获取内容详情成功"
	MsgProposalListRetrieved     = "获取提案列表成功"
	MsgProposalDetailRetrieved   = "获取提案详情成功"
	MsgContentCreated            = "创建内容成功"
	MsgProposalCreated           = "创建提案成功"
	MsgVoteSubmitted             = "投票提交成功"
	MsgTokenStaked               = "质押代币成功"
	MsgStatisticsRetrieved       = "获取统计信息成功"
)
