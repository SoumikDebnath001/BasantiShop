import { v2 as cloudinary } from 'cloudinary'
import { env } from './env.js'

export function initCloudinary() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    const err = new Error('Cloudinary is not configured')
    ;(err as any).status = 500
    throw err
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  })
}

export { cloudinary }

