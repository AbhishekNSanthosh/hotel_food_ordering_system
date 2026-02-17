// Image upload utility using ImgBB free API
// Get your API key from: https://api.imgbb.com/

export async function uploadImageToImgBB(file: File): Promise<string> {
    const API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY || ''; // You'll need to add this to .env.local

    if (!API_KEY) {
        throw new Error('ImgBB API key not configured');
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('key', API_KEY);

    try {
        const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            return data.data.url; // Returns the direct image URL
        } else {
            throw new Error(data.error?.message || 'Upload failed');
        }
    } catch (error) {
        console.error('Image upload error:', error);
        throw error;
    }
}

// Alternative: Upload to Cloudinary (also free)
export async function uploadImageToCloudinary(file: File): Promise<string> {
    const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
    const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error('Cloudinary credentials not configured');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        const data = await response.json();

        if (data.secure_url) {
            return data.secure_url;
        } else {
            throw new Error('Upload failed');
        }
    } catch (error) {
        console.error('Image upload error:', error);
        throw error;
    }
}
