"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/lib/auth";
import { FaGoogle, FaTwitter } from "react-icons/fa";
import { useState } from "react";

export function LoginButton() {
  const { login, loginWithTwitter } = useAuth();
  const [showOptions, setShowOptions] = useState(false);
  
  // Twitter認証が有効かどうかを環境変数で確認
  const twitterEnabled = process.env.NEXT_PUBLIC_TWITTER_ENABLED === 'true';

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await login(tokenResponse.access_token);
      } catch (error) {
        console.error("Login error:", error);
      }
    },
    onError: () => {
      console.error("Login Failed");
    },
  });

  const handleTwitterLogin = () => {
    // Twitter OAuth2フローを開始
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
    window.location.href = `${apiUrl}/auth/twitter/login/`;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
      >
        ログイン
      </button>

      {showOptions && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border py-2 z-50">
          <button
            onClick={() => {
              googleLogin();
              setShowOptions(false);
            }}
            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-100 transition"
          >
            <FaGoogle className="text-red-500" />
            <span>Googleでログイン</span>
          </button>

          {twitterEnabled && (
            <button
              onClick={() => {
                handleTwitterLogin();
                setShowOptions(false);
              }}
              className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-100 transition"
            >
              <FaTwitter className="text-blue-400" />
              <span>Twitterでログイン</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

