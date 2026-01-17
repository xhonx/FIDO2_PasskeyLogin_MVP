"use client";

import { useRouter } from "next/navigation";

export default function MainPage() {
  const router = useRouter(); // useRouter는 client단에서만 사용 가능.

  const handleLogin = () => {
    router.push("/login"); // router는 useRouter(next/navigation)에서 가져옴.
  };
  const handleRegister = () => {
    router.push("/register");
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-[33%] bg-white/40 border-2 border-gray-600 shadow-gray-600 shadow-lg p-10 rounded-2xl">
        <h1 className="flex text-3xl font-bold justify-center">
          Welcome to PassKey Login
        </h1>
        <div className="flex justify-center align-center items-center my-10">
          PassKey를 통해 간편하게 로그인하실 수 있습니다
        </div>

        <div className="flex flex-col gap-2 justify-center">
          <button
            onClick={handleRegister}
            className="border-none bg-gray-300 p-2 rounded-lg hover:scale-102"
          >
            패스키 등록
          </button>
          <button
            onClick={handleLogin}
            className="border-none bg-gray-300 p-2 rounded-lg hover:scale-102"
          >
            패스키 로그인
          </button>
        </div>
      </div>
    </div>
  );
}
