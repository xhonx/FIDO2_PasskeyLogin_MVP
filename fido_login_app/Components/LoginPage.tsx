"use client";

import { startAuthentication } from "@simplewebauthn/browser";
import { useState } from "react";
import {
  getAuthenticationOptionsAction,
  verifyAuthenticationAction,
} from "../actions/actionLogin";

export default function LoginPage() {
  const [state, setState] = useState("");

  const onLogin = async () => {
    // 1) 서버에서 등록 옵션을 조회
    const options = await getAuthenticationOptionsAction();
    // 2) 등록 옵션을 사용하여 등록 요청
    const attResp = await startAuthentication({ optionsJSON: options });
    // 3) 등록 요청을 검증 및 저장
    const isSuccess = await verifyAuthenticationAction(attResp, options);
    if (isSuccess) {
      console.log("로그인이 완료되었습니다.");
    } else {
      console.log("로그인에 실패했습니다.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-[33%] flex flex-col gap-2 bg-white/40 border-2 border-gray-600 shadow-gray-600 shadow-lg p-10 rounded-2xl">
        <h1 className="flex text-3xl font-bold justify-center mb-10">
          Login Page
        </h1>
        <input
          placeholder="HSY@gmail.com"
          id="email"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="h-10 border-none bg-gray-100 rounded-lg pl-5"
        />
        <button
          type="button"
          onClick={onLogin}
          disabled={state.length < 3}
          className="border-none bg-gray-300 p-2 rounded-lg hover:scale-102"
        >
          Login
        </button>
      </div>
    </div>
  );
}
