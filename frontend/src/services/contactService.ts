import axiosInstance from '../api/axios'
import { API_ENDPOINTS } from '../config/api'
import { ContactPayload } from '../types'

export const contactService = {
  async sendContact(payload: ContactPayload): Promise<void> {
    await axiosInstance.post(API_ENDPOINTS.CONTACT, payload)
  },
}
