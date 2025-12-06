"use client";

import { FaGoogle, FaTwitter } from "react-icons/fa";
import { useState } from "react";

export function LoginButton() {
  const [showOptions, setShowOptions] = useState(false);

  const handleGoogleLogin = () => {
    // Google OAuth2フローを開始
    window.location.href = 'http://localhost:18000/accounts/google/login/';
  };

  const handleTwitterLogin = () => {
    // Twitter OAuth2フローを開始
    window.location.href = 'http://localhost:18000/accounts/twitter_oauth2/login/';
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
              handleGoogleLogin();
              setShowOptions(false);
            }}
            className="flex items-center gap-3 px-4 py-3 w-full hover:bg-gray-100 transition"
          >
            <FaGoogle className="text-red-500" />
            <span>Googleでログイン</span>
          </button>

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
        </div>
      )}
    </div>
  );
}

