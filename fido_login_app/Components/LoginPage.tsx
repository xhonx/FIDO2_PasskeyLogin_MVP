'use client';

import { startAuthentication } from '@simplewebauthn/browser';
import { useState } from 'react';
import { getAuthenticationOptionsAction, verifyAuthenticationAction } from "./actionLogin";

export default function LoginPage() {
  const [state, setState] = useState('');

  const onLogin = async () => {
    // 1) 서버에서 등록 옵션을 조회
    const options = await getAuthenticationOptionsAction();
    // 2) 등록 옵션을 사용하여 등록 요청
    const attResp = await startAuthentication({ optionsJSON: options });
    // 3) 등록 요청을 검증 및 저장
    const isSuccess = await verifyAuthenticationAction(attResp, options);
    if (isSuccess) {
      console.log('등록이 완료되었습니다.');
    } else {
      console.log('등록에 실패했습니다.');
    }
  };

  return (
    <div>
      <input placeholder="m@example.com" id="email" value={state} onChange={(e) => setState(e.target.value)} />
      <button type="button" onClick={onLogin} disabled={state.length < 3}>
        Login
      </button>
    </div>
  );
}