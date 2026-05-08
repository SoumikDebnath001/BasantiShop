import axiosInstance from '../api/axios'
import { API_ENDPOINTS } from '../config/api'
import type { AuthResponse, User } from '../types'

export const authService = {
  async registerInitiate(payload: {
    name: string
    email: string
    password: string
    phone?: string
  }): Promise<{ message: string }> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.REGISTER_INITIATE, payload)
    return data
  },

  async registerVerify(payload: { email: string; otp: string }): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.REGISTER_VERIFY, payload)
    return data
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.LOGIN, payload)
    return data
  },

  async loginSendOtp(email: string): Promise<{ message: string }> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.LOGIN_SEND_OTP, { email })
    return data
  },

  async loginVerifyOtp(payload: { email: string; otp: string }): Promise<AuthResponse> {
    const { data } = await axiosInstance.post<AuthResponse>(API_ENDPOINTS.LOGIN_VERIFY_OTP, payload)
    return data
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.FORGOT_PASSWORD, { email })
    return data
  },

  async resetPassword(payload: {
    email: string
    otp: string
    newPassword: string
  }): Promise<{ message: string }> {
    const { data } = await axiosInstance.post(API_ENDPOINTS.RESET_PASSWORD, payload)
    return data
  },

  async getProfile(): Promise<User> {
    const { data } = await axiosInstance.get<User>(API_ENDPOINTS.ME)
    return data
  },
}
