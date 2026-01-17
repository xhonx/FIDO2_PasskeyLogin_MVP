'use server';

import { WebAuthnError } from '@simplewebauthn/browser';
import {
  generateRegistrationOptions,
  RegistrationResponseJSON,
  verifyRegistrationResponse,
  type AuthenticatorTransportFuture,
  type Base64URLString,
  type CredentialDeviceType,
} from '@simplewebauthn/server';
import { JsonFileDB } from '../jsondb';

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

const db = new JsonFileDB<Passkey>('passkeys.json');
const rpName = 'My Service'; // 서비스명
const rpID = 'localhost'; // 사이트의 고유 식별자. 로컬 개발 시 'localhost'도 가능
const origin = `http://${rpID}:3000`; // 등록 및 인증 URL. 'http://localhost', 'http://localhost:PORT'도 가능 (후행슬래시 x)

/**
 * 1-1) 기본 등록 정보 옵션 조회
 */
export async function getRegistrationOptionsAction(email: string) {
  const passkeys = await db.readAll();
  const excludeCredentials = passkeys.map((passkey) => ({
    id: passkey.id,
    type: 'public-key',
  }));

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userDisplayName: email,
    userName: email,
    attestationType: 'none', // authenticator 추가 정보 입력 프롬프트 비활성화 (UX 향상 권장)
    excludeCredentials, // 기존 authenticator 재등록 방지
    authenticatorSelection: {
      residentKey: 'preferred', // Default
      userVerification: 'preferred', // Default
      authenticatorAttachment: 'platform', // Optional
    },
  });

  return options;
}

/**
 * 1-2) 인증 정보 검증 및 스토어 저장
 */
export async function verifyRegistrationAction(
  response: RegistrationResponseJSON,
  email: string,
  options: PublicKeyCredentialCreationOptionsJSON,
) {
  try {
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: () => true,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified) {
      throw new Error('Verification failed');
    }

    const registrationInfo = verification.registrationInfo!;

    const newPasskey: Passkey = {
      id: registrationInfo.credential.id,
      publicKey: uint8ArrayToBase64url(registrationInfo.credential.publicKey),
      user: {
        id: email,
      },
      webauthnUserId: options.user.id,
      counter: registrationInfo.credential.counter,
      deviceType: registrationInfo.credentialDeviceType,
      backedUp: registrationInfo.credentialBackedUp,
      transports: registrationInfo.credential.transports,
    };

    await db.append([newPasskey]);
    return true;
  } catch (error) {
    if (error instanceof WebAuthnError) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    return false;
  }
}

function uint8ArrayToBase64url(u8: Uint8Array): string {
  return Buffer.from(u8).toString('base64url');
}