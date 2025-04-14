//This is a TESTER we might not need 
const fs = require('fs'); // file system module for file operations
const path = require('path'); // path module for working with file paths
const { v4: uuidv4 } = require('uuid'); // generate unique IDs for filenames

// define upload directory path relative to this file
const uploadDir = path.join(__dirname, '../../uploads'); //to check out of the src folder

// ensure uploads directory exists before trying to write files
if (!fs.existsSync(uploadDir)) {
  // create directory if it doesn't exist
  fs.mkdirSync(uploadDir, { recursive: true });
}

// function to upload media files
const uploadMedia = async (file) => {
  try {
    // generate unique filename to prevent overwrites
    const filename = `${uuidv4()}-${file.originalname}`;
    // create full file path
    const filepath = path.join(uploadDir, filename);
    // write file to disk from memory buffer
    await fs.promises.writeFile(filepath, file.buffer);
    
    // return URL path to access the file
    // in a real app, this would be the URL to your storage service
    const url = `/uploads/${filename}`;
    
    return { success: true, url: url, filename: filename }; // unique filename used for storage
  } catch (error) {
    console.error('Error uploading file:', error);
    return { success: false, message: 'Failed to upload file' };
  }
};
// Delete a file to handle the file removal
const deleteFileFromStorage = async (mediaUrl) => {
  if (!mediaUrl) return;
  
  try {
    // extract filename from the URL (e.g., "/uploads/abc123-file.jpg" -> "abc123-file.jpg")
    const filename = mediaUrl.split('/').pop();
    
    // get path to uploads directory (same as in our fileUpload utility)
    const uploadDir = path.join(__dirname, '../uploads');
    
    // full path to the file
    const filepath = path.join(uploadDir, filename);
    
    // check if file exists before attempting to delete
    if (fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
      console.log(`Deleted file: ${filepath}`);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};
module.exports = {
  uploadMedia,
  deleteFileFromStorage
};