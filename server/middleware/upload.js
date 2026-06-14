const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = path.join(__dirname, '..', 'uploads');
    
    // Organize uploads by type
    if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadPath, 'avatars');
    } else if (file.fieldname === 'bikePhotos') {
      uploadPath = path.join(uploadPath, 'bikes');
    } else if (file.fieldname === 'ridePhotos') {
      uploadPath = path.join(uploadPath, 'rides');
    } else if (file.fieldname === 'listingPhotos') {
      uploadPath = path.join(uploadPath, 'listings');
    } else if (file.fieldname === 'document') {
      uploadPath = path.join(uploadPath, 'documents');
    } else {
      uploadPath = path.join(uploadPath, 'misc');
    }

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allow images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } 
  // Allow PDFs for documents
  else if (file.mimetype === 'application/pdf' && file.fieldname === 'document') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Upload configurations
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  }
});

// Export different upload handlers
module.exports = {
  uploadAvatar: upload.single('avatar'),
  uploadBikePhotos: upload.array('bikePhotos', 5),
  uploadRidePhotos: upload.array('ridePhotos', 10),
  uploadListingPhotos: upload.array('listingPhotos', 10),
  uploadDocument: upload.single('document'),
  uploadForumImages: upload.array('images', 5)
};
