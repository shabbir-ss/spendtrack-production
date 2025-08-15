import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Create directory structure: uploads/transactionId/
    const transactionId = req.body.transactionId || 'temp';
    const uploadPath = path.join(uploadsDir, transactionId);
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename while preserving extension
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const filename = `invoice_${uniqueId}${extension}`;
    cb(null, filename);
  }
});

// File filter for allowed types
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and images (JPG, PNG, WEBP) are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit (can be adjusted)
  }
});

// Utility function to delete uploaded file
export const deleteUploadedFile = (filePath: string): boolean => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      
      // Also try to remove the directory if it's empty
      const dir = path.dirname(filePath);
      try {
        fs.rmdirSync(dir);
      } catch (e) {
        // Directory not empty, ignore
      }
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Utility function to get file info
export const getFileInfo = (file: Express.Multer.File, transactionId: string) => {
  return {
    fileName: file.originalname,
    filePath: file.path,
    fileType: file.mimetype,
    fileSize: file.size,
    relativePath: path.relative(process.cwd(), file.path)
  };
};

// Utility function to move temp files to final location
export const moveFileToTransaction = (tempPath: string, transactionId: string, originalName: string): string | null => {
  try {
    const finalDir = path.join(uploadsDir, transactionId);
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }
    
    const extension = path.extname(originalName);
    const uniqueId = uuidv4();
    const finalFilename = `invoice_${uniqueId}${extension}`;
    const finalPath = path.join(finalDir, finalFilename);
    
    fs.renameSync(tempPath, finalPath);
    
    // Clean up temp directory if empty
    try {
      const tempDir = path.dirname(tempPath);
      fs.rmdirSync(tempDir);
    } catch (e) {
      // Directory not empty, ignore
    }
    
    return finalPath;
  } catch (error) {
    console.error('Error moving file:', error);
    return null;
  }
};