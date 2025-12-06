import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター（JWT追加 + FormData処理）
api.interceptors.request.use(
  (config) => {
    // JWT トークンを追加
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    // FormDataの場合はContent-Typeを削除（ブラウザが自動設定）
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（トークンリフレッシュ）
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // リフレッシュ失敗時はログアウト
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API関数
export const contestApi = {
  // コンテスト一覧
  getContests: () => api.get('/contests/'),
  
  // 自分のコンテスト一覧
  getMyContests: () => api.get('/contests/my_contests/'),
  
  // コンテスト詳細
  getContest: (slug: string) => api.get(`/contests/${slug}/`),
  
  // コンテスト作成（認証済みユーザー）
  createContest: (data: FormData) => api.post('/contests/', data),
  
  // コンテスト更新（作成者または管理者）
  updateContest: (slug: string, data: FormData) => 
    api.patch(`/contests/${slug}/`, data),
  
  // コンテスト削除（作成者または管理者）
  deleteContest: (slug: string) => api.delete(`/contests/${slug}/`),
  
  // コンテストのエントリー一覧
  getContestEntries: (slug: string, params?: any) => 
    api.get(`/contests/${slug}/entries/`, { params }),
};

export const entryApi = {
  // エントリー一覧
  getEntries: (params?: any) => api.get('/entries/', { params }),
  
  // エントリー詳細
  getEntry: (id: string) => api.get(`/entries/${id}/`),
  
  // エントリー作成
  createEntry: (data: FormData) => api.post('/entries/', data),
  
  // 投票
  vote: (id: string) => api.post(`/entries/${id}/vote/`),
  
  // 投票取消
  unvote: (id: string) => api.delete(`/entries/${id}/unvote/`),
  
  // 通報
  flag: (id: string, reason: string) => 
    api.post(`/entries/${id}/flag/`, { reason }),
  
  // 審査員スコア
  judgeScore: (id: string, score: number, comment: string) =>
    api.post(`/entries/${id}/judge_score/`, { score, comment }),
  
  // 承認（モデレーター）
  approve: (id: string) => api.post(`/entries/${id}/approve/`),
  
  // 非承認（モデレーター）
  reject: (id: string) => api.post(`/entries/${id}/reject/`),
  
  // 承認待ち一覧（モデレーター）
  getPending: () => api.get('/entries/pending/'),
};

export const authApi = {
  // Google OAuth
  googleLogin: (credential: string) =>
    api.post('/auth/google/', { id_token: credential }),
  
  // ログアウト
  logout: () => api.post('/auth/logout/'),
  
  // 現在のユーザー
  me: () => api.get('/users/me/'),
};

export const userApi = {
  // ユーザー一覧
  getUsers: () => api.get('/users/'),
  
  // ユーザー詳細
  getUser: (id: string) => api.get(`/users/${id}/`),
  
  // 現在のユーザー
  me: () => api.get('/users/me/'),
  
  // プロフィール更新
  updateProfile: (data: FormData) => api.patch('/users/update_me/', data),
  
  // Twitterアイコンをプロフィール画像に設定
  setTwitterIcon: () => api.post('/users/set_twitter_icon/'),
};

