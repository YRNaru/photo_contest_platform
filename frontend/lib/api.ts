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
        } else {
          // リフレッシュトークンがない場合、トークンをクリアして認証なしで再試行
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          delete originalRequest.headers.Authorization;
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
  
  // 審査中のコンテスト一覧
  getJudgingContests: () => api.get('/contests/judging_contests/'),
  
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
  
  // 審査員を追加（作成者のみ）
  addJudge: (slug: string, userId: string) =>
    api.post(`/contests/${slug}/add_judge/`, { user_id: userId }),
  
  // 審査員を削除（作成者のみ）
  removeJudge: (slug: string, userId: string) =>
    api.post(`/contests/${slug}/remove_judge/`, { user_id: userId }),
  
  // 審査員一覧
  getJudges: (slug: string) => api.get(`/contests/${slug}/judges/`),
  
  // コンテスト統計
  getContestStatistics: (slug: string) => api.get(`/contests/${slug}/statistics/`),
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

// 部門API
export const categoryApi = {
  // 部門一覧
  getCategories: (contestId?: number) =>
    api.get('/categories/', { params: contestId ? { contest: contestId } : {} }),
  
  // 部門詳細
  getCategory: (id: number) => api.get(`/categories/${id}/`),
  
  // 部門作成
  createCategory: (data: any) => api.post('/categories/', data),
  
  // 部門更新
  updateCategory: (id: number, data: any) => api.patch(`/categories/${id}/`, data),
  
  // 部門削除
  deleteCategory: (id: number) => api.delete(`/categories/${id}/`),
};

// 審査基準API
export const judgingCriteriaApi = {
  // 審査基準一覧
  getCriteria: (contestId?: number, categoryId?: number) =>
    api.get('/judging-criteria/', {
      params: { contest: contestId, category: categoryId },
    }),
  
  // 審査基準詳細
  getCriterion: (id: number) => api.get(`/judging-criteria/${id}/`),
  
  // 審査基準作成
  createCriterion: (data: any) => api.post('/judging-criteria/', data),
  
  // 審査基準更新
  updateCriterion: (id: number, data: any) =>
    api.patch(`/judging-criteria/${id}/`, data),
  
  // 審査基準削除
  deleteCriterion: (id: number) => api.delete(`/judging-criteria/${id}/`),
};

// 投票API
export const voteApi = {
  // 投票一覧
  getVotes: (params?: any) => api.get('/votes/', { params }),
  
  // 自分の投票一覧
  getMyVotes: () => api.get('/votes/my_votes/'),
  
  // 投票作成
  createVote: (data: { entry: string; category?: number | null }) =>
    api.post('/votes/', data),
  
  // 投票削除
  deleteVote: (id: number) => api.delete(`/votes/${id}/`),
};

// 審査員スコアAPI
export const judgeScoreApi = {
  // スコア一覧
  getScores: (params?: any) => api.get('/judge-scores/', { params }),
  
  // 自分のスコア一覧
  getMyScores: () => api.get('/judge-scores/my_scores/'),
  
  // スコア詳細
  getScore: (id: number) => api.get(`/judge-scores/${id}/`),
  
  // スコア作成
  createScore: (data: {
    entry: string;
    category?: number | null;
    comment?: string;
    detailed_scores: Array<{
      criteria: number;
      score: number;
      comment?: string;
    }>;
  }) => api.post('/judge-scores/', data),
  
  // スコア更新
  updateScore: (id: number, data: any) =>
    api.patch(`/judge-scores/${id}/`, data),
  
  // スコア削除
  deleteScore: (id: number) => api.delete(`/judge-scores/${id}/`),
};


