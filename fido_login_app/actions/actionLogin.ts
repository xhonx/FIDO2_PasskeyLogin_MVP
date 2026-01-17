"use server";

import {
  AuthenticationResponseJSON,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type AuthenticatorTransportFuture,
  type Base64URLString,
  type CredentialDeviceType,
} from "@simplewebauthn/server";
import { JsonFileDB } from "../lib/jsondb";
import { LoginLog } from "../lib/authType";

type Passkey = {
  id: Base64URLString;
  publicKey: string;
  user: {
    id: string;
  };
  webauthnUserId: Base64URLString;
  counter: number;
  deviceType: CredentialDeviceType;
  backedUp: boolean;
  transports?: AuthenticatorTransportFuture[];
};

const db = new JsonFileDB<Passkey>("passkeys.json"); // 인증 정보 담는 디비 생성
const loginLogDB = new JsonFileDB<LoginLog>("login_logs.json"); // 로그인 로그 담는 디비 생성

const rpID = "localhost"; // 사이트의 고유 식별자. 로컬 개발 시 'localhost'
const origin = `http://${rpID}:3000`; // 등록 및 인증 URL.

/**
 * 2-1) 기본 인증 정보 옵션 조회
 */
export async function getAuthenticationOptionsAction() {
  const data = await db.readAll();
  const allowCredentials = data.map((item) => ({
    id: item.id,
    transports: item.transports,
  }));

  const options = await generateAuthenticationOptions({
    rpID,
    allowCredentials,
  });

  return options;
}

/**
 * 2-2) 인증 정보 검증
 */
export async function verifyAuthenticationAction(
  response: AuthenticationResponseJSON,
  options: PublicKeyCredentialRequestOptionsJSON,
) {
  try {
    const data = await db.readAll();
    const savedPasskey = data.find((item) => item.id === response.id);
    if (!savedPasskey) {
      throw new Error("Passkey not found");
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: options.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: savedPasskey.id,
        publicKey: base64urlToUint8Array(savedPasskey.publicKey),
        counter: savedPasskey.counter,
        transports: savedPasskey.transports,
      },
    });

    if (!verification.verified) {
      throw new Error("Verification failed");
    }

    // 디비에 로그 기록
    const log: LoginLog = {
      userId: savedPasskey.user.id,
      timestamp: new Date().toISOString(),
      auth_method: "FIDO2(passkey)",
      authenticator_type: savedPasskey.deviceType,
      user_verification: verification.authenticationInfo.userVerified,
      credential_id: savedPasskey.id,
      rpID,
      origin,
      result: "success",
    };
    await loginLogDB.append([log]);

    return { success: true };
  } catch (error) {
    console.error(error);

    // 디비에 로그 기록
    const failLog: LoginLog = {
      userId: "unknown",
      timestamp: new Date().toISOString(),
      auth_method: "FIDO2(passkey)",
      authenticator_type: "platform",
      user_verification: false,
      credential_id: response?.id ?? "unknown",
      rpID,
      origin,
      result: "fail",
      failure_reason: error instanceof Error ? error.name : "UnknownError",
    };

    await loginLogDB.append([failLog]);

    return { success: false };
  }
}

function base64urlToUint8Array(base64url: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64url, "base64url"));
}
