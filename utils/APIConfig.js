const kycServerAddress = "http://218.50.149.74:8545"
const backendServerAddress = "http://218.50.149.74:18332"
export const RegisterPushTokenAPI = `${kycServerAddress}/apis/escare/n2e/kyc/v1/member/registpushtoken`
export const SendPushAPI = `${kycServerAddress}/apis/escare/push/v1/requestSendPush`
export const CheckPushListAPI = `${kycServerAddress}/apis/escare/push/v1/requestPushMsgList`
export const CheckPushDetailAPI = `${kycServerAddress}/apis/escare/push/v1/requestPushDetailMsg`
export const GetNFTInfoFromBackendAPI = `${backendServerAddress}/getNFTInfoById`
export const EmailVerificationAPI = `${kycServerAddress}/apis/escare/n2e/kyc/v1/email/`  // + ${userEmail}/authcode
export const PinManageAPI = `${kycServerAddress}/apis/escare/n2e/kyc/v1/member/`  // + ${memberId}/pin
export const WalletManageAPI = `${kycServerAddress}/apis/escare/n2e/kyc/v1/member/`  // + ${memberId}/wallet
export const ScanVerificationAPI = `${kycServerAddress}/apis/escare/n2e/vrfccd/v1/verify/verifyVerificationCode`
export const Scan3rdVerificationAPI = `${kycServerAddress}/apis/escare/n2e/vrfccd/v1/verify/verify3rdVerificationCode`
export const acceptNFTRequest = `${kycServerAddress}/apis/escare/n2e/vrfccd/v1/manage/confirmTransfer`
export const rejectNFTRequest = `${kycServerAddress}/apis/escare/n2e/vrfccd/v1/manage/rejectTransfer`

