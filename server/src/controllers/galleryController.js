import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary using credentials from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

/**
 * Fetch all gallery images uploaded to the "BlueBird-Gallery" folder.
 * Uses the Search API which is optimal for new Cloudinary metadata folders.
 */
export const getGalleryImages = async (req, res) => {
  try {
    // Search for images in folder "BlueBird-Gallery"
    const result = await cloudinary.search
      .expression('folder:BlueBird-Gallery')
      .sort_by('created_at', 'desc')
      .max_results(100)
      .execute();

    // Map fields for client compatibility
    const images = (result.resources || []).map(img => ({
      public_id: img.public_id,
      url: img.url,
      secure_url: img.secure_url,
      format: img.format,
      width: img.width,
      height: img.height,
      aspect_ratio: img.aspect_ratio || (img.width && img.height ? img.width / img.height : 1),
      created_at: img.created_at
    }));

    return res.status(200).json({
      success: true,
      count: images.length,
      images
    });
  } catch (error) {
    console.error('Error fetching gallery images from Cloudinary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery images',
      error: error.message
    });
  }
};
