"use client";

import { useRouter } from 'next/navigation';

export default function StartPage() {
    const router = useRouter(); // useRouter는 client단에서만 사용 가능. 

    const  handleLogin = () => {
        router.push('/login'); // router는 useRouter(next/navigation)에서 가져옴.
    }
    const handleRegister = () => {
        router.push('/register');
    }

    return (
        <div>
            <div>
                <h1>Welcome to Fido Login App</h1>
                <h3>Dev by Hannah</h3>  
                <div className="">
                    <button onClick={handleRegister}>패스키 등록</button>
                    <button onClick={handleLogin}>패스키 로그인</button>
                </div>
            </div>
        </div>
    );
}