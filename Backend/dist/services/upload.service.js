import { cloudinary, initCloudinary } from '../config/cloudinary.js';
export async function uploadImageBuffer(opts) {
    initCloudinary();
    const base64 = opts.buffer.toString('base64');
    const dataUri = `data:${opts.mimeType};base64,${base64}`;
    const res = await cloudinary.uploader.upload(dataUri, {
        folder: opts.folder ?? 'ecommerce',
        resource_type: 'image',
    });
    return res.secure_url;
}
//# sourceMappingURL=upload.service.js.map