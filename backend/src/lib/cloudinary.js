import { v2 as cloudinary } from 'cloudinary';
const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
};

export const isCloudinaryConfigured = Object.values(cloudinaryConfig)
    .every(value => typeof value === 'string' && value.trim().length > 0);

if (isCloudinaryConfigured) {
    cloudinary.config(cloudinaryConfig);
}

export default cloudinary;
    