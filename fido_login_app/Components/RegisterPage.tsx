"use client";

import { startRegistration } from "@simplewebauthn/browser";
import { useState } from "react";
import {
  getRegistrationOptionsAction,
  verifyRegistrationAction,
} from "../actions/actionRegister";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
  const [state, setState] = useState("");

  const onRegisterNewPasskey = async () => {
    // 1) 서버에서 등록 옵션을 조회
    const options = await getRegistrationOptionsAction(state);
    // 2) 등록 옵션을 사용하여 등록 요청
    const attResp = await startRegistration({ optionsJSON: options });
    // 3) 등록 요청을 검증 및 저장
    const isSuccess = await verifyRegistrationAction(attResp, state, options);
    if (isSuccess) {
      toast.success("등록이 완료되었습니다.");
    } else {
      toast.error("등록에 실패했습니다.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-[33%] flex flex-col gap-2 bg-white/40 border-2 border-gray-600 shadow-gray-600 shadow-lg p-10 rounded-2xl">
        <h1 className="flex text-3xl font-bold justify-center mb-10">
          Register New Passkey
        </h1>
        <input
          placeholder="m@example.com"
          id="email"
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="h-10 border-none bg-gray-100 rounded-lg pl-5"
        />
        <button
          type="button"
          onClick={onRegisterNewPasskey}
          disabled={state.length < 3}
          className="border-none bg-gray-300 p-2 rounded-lg hover:scale-102"
        >
          Register
        </button>
      </div>
    </div>
  );
}
