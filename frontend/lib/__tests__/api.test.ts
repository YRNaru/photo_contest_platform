import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { api, contestApi, entryApi, authApi, userApi } from '../api'

describe('API Configuration', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(api)
    localStorage.clear()
  })

  afterEach(() => {
    mock.restore()
  })

  describe('API Instance', () => {
    it('should have correct baseURL', () => {
      // 環境によってbaseURLが異なる可能性があるため、URLが設定されていることを確認
      expect(api.defaults.baseURL).toBeDefined()
      expect(api.defaults.baseURL).toContain('/api')
    })

    it('should add JWT token to request headers', async () => {
      const token = 'test-token'
      localStorage.setItem('access_token', token)

      mock.onGet('/test').reply(config => {
        expect(config.headers?.Authorization).toBe(`Bearer ${token}`)
        return [200, { success: true }]
      })

      await api.get('/test')
    })

    it('should handle requests without token', async () => {
      mock.onGet('/test').reply(config => {
        expect(config.headers?.Authorization).toBeUndefined()
        return [200, { success: true }]
      })

      await api.get('/test')
    })
  })

  describe('Contest API', () => {
    it('should fetch contests list', async () => {
      const mockData = [{ id: 1, title: 'Test Contest' }]
      mock.onGet('/contests/').reply(200, mockData)

      const response = await contestApi.getContests()
      expect(response.data).toEqual(mockData)
    })

    it('should fetch contest detail', async () => {
      const mockData = { id: 1, slug: 'test-contest', title: 'Test Contest' }
      mock.onGet('/contests/test-contest/').reply(200, mockData)

      const response = await contestApi.getContest('test-contest')
      expect(response.data).toEqual(mockData)
    })

    it('should create contest', async () => {
      const formData = new FormData()
      formData.append('title', 'New Contest')

      mock.onPost('/contests/').reply(201, { id: 1, title: 'New Contest' })

      const response = await contestApi.createContest(formData)
      expect(response.status).toBe(201)
    })

    it('should update contest', async () => {
      const formData = new FormData()
      formData.append('title', 'Updated Contest')

      mock.onPatch('/contests/test-contest/').reply(200, { id: 1, title: 'Updated Contest' })

      const response = await contestApi.updateContest('test-contest', formData)
      expect(response.status).toBe(200)
    })

    it('should delete contest', async () => {
      mock.onDelete('/contests/test-contest/').reply(204)

      const response = await contestApi.deleteContest('test-contest')
      expect(response.status).toBe(204)
    })

    it('should fetch contest entries', async () => {
      const mockData = [{ id: 1, title: 'Test Entry' }]
      mock.onGet('/contests/test-contest/entries/').reply(200, mockData)

      const response = await contestApi.getContestEntries('test-contest')
      expect(response.data).toEqual(mockData)
    })
  })

  describe('Entry API', () => {
    it('should fetch entries list', async () => {
      const mockData = [{ id: 1, title: 'Test Entry' }]
      mock.onGet('/entries/').reply(200, mockData)

      const response = await entryApi.getEntries()
      expect(response.data).toEqual(mockData)
    })

    it('should fetch entry detail', async () => {
      const mockData = { id: 1, title: 'Test Entry' }
      mock.onGet('/entries/1/').reply(200, mockData)

      const response = await entryApi.getEntry('1')
      expect(response.data).toEqual(mockData)
    })

    it('should create entry', async () => {
      const formData = new FormData()
      formData.append('title', 'New Entry')

      mock.onPost('/entries/').reply(201, { id: 1, title: 'New Entry' })

      const response = await entryApi.createEntry(formData)
      expect(response.status).toBe(201)
    })

    it('should vote on entry', async () => {
      mock.onPost('/entries/1/vote/').reply(201, { success: true })

      const response = await entryApi.vote('1')
      expect(response.status).toBe(201)
    })

    it('should unvote on entry', async () => {
      mock.onDelete('/entries/1/unvote/').reply(204)

      const response = await entryApi.unvote('1')
      expect(response.status).toBe(204)
    })

    it('should flag entry', async () => {
      mock.onPost('/entries/1/flag/').reply(201, { success: true })

      const response = await entryApi.flag('1', 'Inappropriate content')
      expect(response.status).toBe(201)
    })

    it('should submit judge score', async () => {
      mock.onPost('/entries/1/judge_score/').reply(201, { success: true })

      const response = await entryApi.judgeScore('1', 85, 'Great work!')
      expect(response.status).toBe(201)
    })

    it('should approve entry', async () => {
      mock.onPost('/entries/1/approve/').reply(200, { success: true })

      const response = await entryApi.approve('1')
      expect(response.status).toBe(200)
    })

    it('should reject entry', async () => {
      mock.onPost('/entries/1/reject/').reply(200, { success: true })

      const response = await entryApi.reject('1')
      expect(response.status).toBe(200)
    })

    it('should fetch pending entries', async () => {
      const mockData = [{ id: 1, title: 'Pending Entry', approved: false }]
      mock.onGet('/entries/pending/').reply(200, mockData)

      const response = await entryApi.getPending()
      expect(response.data).toEqual(mockData)
    })
  })

  describe('Auth API', () => {
    it('should login with Google', async () => {
      const mockResponse = { access_token: 'token123', user: { id: 1 } }
      mock.onPost('/auth/google/').reply(200, mockResponse)

      const response = await authApi.googleLogin('google-credential')
      expect(response.data).toEqual(mockResponse)
    })

    it('should logout', async () => {
      mock.onPost('/auth/logout/').reply(200, { success: true })

      const response = await authApi.logout()
      expect(response.status).toBe(200)
    })

    it('should fetch current user', async () => {
      const mockUser = { id: 1, email: 'test@example.com' }
      mock.onGet('/users/me/').reply(200, mockUser)

      const response = await authApi.me()
      expect(response.data).toEqual(mockUser)
    })
  })

  describe('User API', () => {
    it('should fetch users list', async () => {
      const mockData = [{ id: 1, username: 'testuser' }]
      mock.onGet('/users/').reply(200, mockData)

      const response = await userApi.getUsers()
      expect(response.data).toEqual(mockData)
    })

    it('should fetch user detail', async () => {
      const mockUser = { id: 1, username: 'testuser' }
      mock.onGet('/users/1/').reply(200, mockUser)

      const response = await userApi.getUser('1')
      expect(response.data).toEqual(mockUser)
    })

    it('should update profile', async () => {
      const formData = new FormData()
      formData.append('username', 'newusername')

      mock.onPatch('/users/update_me/').reply(200, { id: 1, username: 'newusername' })

      const response = await userApi.updateProfile(formData)
      expect(response.status).toBe(200)
    })

    it('should set Twitter icon', async () => {
      mock.onPost('/users/set_twitter_icon/').reply(200, { success: true })

      const response = await userApi.setTwitterIcon()
      expect(response.status).toBe(200)
    })
  })

  describe('Error Handling', () => {
    it('should handle 401 errors', async () => {
      mock.onGet('/test').reply(401)

      try {
        await api.get('/test')
      } catch (error) {
        expect(axios.isAxiosError(error)).toBe(true)
      }
    })

    it('should handle network errors', async () => {
      mock.onGet('/test').networkError()

      try {
        await api.get('/test')
      } catch (error) {
        expect(axios.isAxiosError(error)).toBe(true)
      }
    })
  })
})
