'use server';

import {
  AuthenticationResponseJSON,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
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
const rpID = 'localhost'; // 사이트의 고유 식별자. 로컬 개발 시 'localhost'도 가능
const origin = `http://${rpID}:3000`; // 등록 및 인증 URL. 'http://localhost', 'http://localhost:PORT'도 가능 (후행슬래시 x)

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
      throw new Error('Passkey not found');
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
      throw new Error('Verification failed');
    }

    // ... 토큰을 생성

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false };
  }
}

function base64urlToUint8Array(base64url: string): Uint8Array {
  return new Uint8Array(Buffer.from(base64url, 'base64url'));
}