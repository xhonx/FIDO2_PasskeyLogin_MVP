// 필요한 메타데이터 추툴을 위한 로그인 로그 타입 정의 코드

export type AuthMethod = "FIDO2(passkey)";

export type AuthenticatorType = "platform" | "multiDevice";

export type LoginResult = "success" | "fail";

export type LoginLog = {
  userId: string; // email / username
  timestamp: string; // ISO time
  auth_method: AuthMethod;
  authenticator_type: AuthenticatorType;
  user_verification: boolean;
  credential_id: string;
  rpID: string;
  origin: string;
  result: LoginResult;
  browser?: string;
  os?: string;
  failure_reason?: string;
};
