import { uploadImageBuffer } from '../services/upload.service.js';
export const uploadController = {
    async uploadImages(req, res) {
        const files = req.files ?? [];
        if (!files.length) {
            const err = new Error('No files uploaded');
            err.status = 400;
            throw err;
        }
        const urls = await Promise.all(files.map((f) => uploadImageBuffer({ buffer: f.buffer, mimeType: f.mimetype, folder: 'ecommerce/products' })));
        res.json({ urls });
    },
};
//# sourceMappingURL=upload.controller.js.map