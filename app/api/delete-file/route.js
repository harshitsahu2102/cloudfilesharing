import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const { publicId, resourceType } = await request.json();

    if (!publicId) {
      return Response.json({ error: 'Missing publicId' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType || 'image',
      invalidate: true,
    });

    return Response.json({ success: true, result });
  } catch (err) {
    console.error('Cloudinary delete error:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
