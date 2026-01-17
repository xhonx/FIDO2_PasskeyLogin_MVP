"use client";

import { startRegistration } from '@simplewebauthn/browser';
import { useState } from 'react';
import { getRegistrationOptionsAction, verifyRegistrationAction } from './actionRegister';
import { toast } from 'react-hot-toast';

export default function RegisterPage() {
  const [state, setState] = useState('');

  const onRegisterNewPasskey = async () => {
    // 1) 서버에서 등록 옵션을 조회
    const options = await getRegistrationOptionsAction(state);
    // 2) 등록 옵션을 사용하여 등록 요청
    const attResp = await startRegistration({ optionsJSON: options });
    // 3) 등록 요청을 검증 및 저장
    const isSuccess = await verifyRegistrationAction(attResp, state, options);
    if (isSuccess) {
      toast.success('등록이 완료되었습니다.');
    } else {
      toast.error('등록에 실패했습니다.');
    }
  };

  return (
    <div>
      <input placeholder="m@example.com" id="email" value={state} onChange={(e) => setState(e.target.value)} />
      <button type="button" onClick={onRegisterNewPasskey} disabled={state.length < 3}>
        Register New Passkey
      </button>
    </div>
  );
}