import api from './axios'

export interface UserProfile {
  id: number
  email: string
  nickname: string
  bio: string | null
  role: string
  profileImageKey: string | null
  createdAt: string
}

export const getMyProfile = (): Promise<UserProfile> =>
  api.get('/api/users/me')

export const updateMyProfile = (data: { nickname?: string; bio?: string }): Promise<UserProfile> =>
  api.put('/api/users/me', data)

export const updatePassword = (data: { currentPassword: string; newPassword: string }): Promise<void> =>
  api.put('/api/users/me/password', data)
