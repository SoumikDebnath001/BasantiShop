import axiosInstance from '../api/axios'
import { API_ENDPOINTS } from '../config/api'
import { AuthResponse, LoginPayload, RegisterPayload, User } from '../types'

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.LOGIN, payload)
    return data
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.REGISTER, payload)
    return data
  },

  async getProfile(): Promise<User> {
    const { data } = await axiosInstance.get<User>(API_ENDPOINTS.ME)
    return data
  },
}
