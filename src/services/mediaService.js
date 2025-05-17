const Media = require('../models/mediaModel');
const User = require('../models/userModel');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

/**
 * Upload a new media file to the server
 * 
 * @param {Object} file - The file object from multer middleware
 * @param {String} userId - ID of user uploading the file
 * @param {String|null} relatedTo - ID of the entity this media relates to (Message, Chat, User)
 * @param {String|null} onModel - Type of model the relatedTo references ('Message', 'Chat', 'User')
 * @param {Boolean} isPublic - Whether the media should be publicly accessible
 * @returns {Object} Result object with success status and media data or error message
 */
const uploadMedia = async (file, userId, relatedTo, onModel, isPublic = false) => {
    try {
        // verifing user exists
        const user = await User.findById(userId);// searching for the user
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // generate unique filename to prevent collisions
        const fileExtension = path.extname(file.originalname);
        const filename = `${uuidv4()}${fileExtension}`;
        
        // define upload directory and create it if it doesn't exist
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // define file path
        const filePath = path.join(uploadDir, filename);
        
        // write file to disk
        await fs.promises.writeFile(filePath, file.buffer);
        
        // create and save media record in database
        const media = new Media({
            filename: filename,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size,
            path: filePath,
            url: `/api/media/${filename}`,
            uploadedBy: userId,
            relatedTo: relatedTo,
            onModel: onModel,
            isPublic: isPublic
        });
        
        await media.save();
        return { success: true, media };
    } catch (error) {
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid userId format' };
        }
        return { success: false, message: 'Failed to upload media: ' + error.message };
    }
};

/**
 * Retrieve media by its ID (download file)
 * 
 * @param {String} mediaId - ID of the media to retrieve
 * @param {String} userId - ID of user making the request (for permission check)
 * @returns {Object} Result object with success status and media data or error message
 */
const getMediaById = async (mediaId, userId) => {
    try {
        const media = await Media.findById(mediaId);// searching for the media
        const user = await User.findById(userId);// searching for the user

        if (!media) {
            return { success: false, message: 'Media not found' };
        }
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        // checking that we only allow access if media is public or belongs to the requesting user
        if (!media.isPublic && media.uploadedBy.toString() !== userId) {
            return { success: false, message: 'Unauthorized to access this media' };
        }
        
        return { success: true, media };
    } catch (error) {
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid mediaId or UserId format' };
        }
        return { success: false, message: 'Failed to get media: ' + error.message };
    }
};

/**
 * Get all media uploaded by a specific user
 * 
 * @param {String} userId - ID of user whose media to retrieve
 * @returns {Object} Result object with success status and array of media items or error message
 */
const getUserMedia = async (userId) => {
    try {
        const user = await User.findById(userId);// searching for the user
        
        if (!user) {
            return { success: false, message: 'User not found' };
        }
        
        // get all media uploaded by user, sorted by newest first
        const media = await Media.find({ uploadedBy: userId }).sort({ createdAt: -1 });
        return { success: true, media };
    } catch (error) {
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid userId format' };
        }
        return { success: false, message: 'Failed to get user media: ' + error.message };
    }
};

/**
 * Get media related to a specific shi (chat, message, etc.) needs to check that
 * 
 * @param {String} relatedId - ID of the entity (chat, message, user)
 * @param {String} onModel - Model type ('Chat', 'Message', 'User')
 * @param {String} userId - ID of user making the request (for permission filtering)
 * @returns {Object} Result object with success status and filtered media array or error message
 */
const getRelatedMedia = async (relatedId, onModel, userId) => {
    try {

        const user = await User.findById(userId);// searching for the user
        if (!user) {
            return { success: false, message: 'User not found' };
        }

        //allowing upper&lower case models
        var model = null;

        if(onModel ==="Chat" || onModel === "chat"){
            model = "Chat"
        }

        if(onModel ==="Message" || onModel ==="message"){
            model = "Message"
        }

        if(onModel ==="User" || onModel ==="user"){
            model = "User"
        }

        const media = await Media.find({ relatedTo: relatedId, onModel: model}).sort({ createdAt: -1 });
        
        // filter out non-public media that doesn't belong to the requesting user
        const authorizedMedia = media.filter(item => 
            item.isPublic || item.uploadedBy.toString() === userId
        );
        
        return { success: true, media: authorizedMedia };
    } catch (error) {
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid relatedId format' };
        }
        return { success: false, message: 'Failed to get related media: ' + error.message };
    }
};

/**
 * Delete media file and database record
 * 
 * @param {String} mediaId - ID of media to delete
 * @param {String} userId - ID of user making the delete request
 * @returns {Object} Result object with success status and message
 */
const deleteMedia = async (mediaId, userId) => {
    try {
        const media = await Media.findById(mediaId);// searching for the media
        const user = await User.findById(userId);// searching for the user

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (!media) {
            return { success: false, message: 'Media not found' };
        }
        
        // checking that we only allow delete if user sent the media
        if (media.uploadedBy.toString() !== userId) {
            return { success: false, message: 'Unauthorized to delete this media' };
        }
        
        // delete the actual physical file from disk if it exists
        if (fs.existsSync(media.path)) {
            await fs.promises.unlink(media.path);
        }
        
        // delete record from database
        await Media.findByIdAndDelete(mediaId);
        
        return { success: true, message: 'Media deleted successfully' };
    } catch (error) {
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid mediaId format' };
        }
        return { success: false, message: 'Failed to delete media: ' + error.message };
    }
};

/**
 * Update media metadata
 * 
 * @param {String} mediaId - ID of media to update
 * @param {String} userId - ID of user making the update request
 * @param {Object} updates - Object containing fields to update
 * @returns {Object} Result object with success status, message and updated media
 */
const updateMedia = async (mediaId, userId, updates) => {
    try {
        const media = await Media.findById(mediaId);// searching for the media
        const user = await User.findById(userId);// searching for the user

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (!media) {
            return { success: false, message: 'Media not found' };
        }
        
        // checking that we only allow update if user sent the media
        if (media.uploadedBy.toString() !== userId) {
            return { success: false, message: 'Unauthorized to update this media' };
        }
        
        // updating only the wanted fields
        if (updates.isPublic !== undefined) {
            media.isPublic = updates.isPublic;
        }
        
        if (updates.relatedTo !== undefined) {
            media.relatedTo = updates.relatedTo;
        }
        
        if (updates.onModel !== undefined) {
            media.onModel = updates.onModel;
        }
        
        await media.save();
        
        return { success: true, message: 'Media updated successfully', media };
    } catch (error) {
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid mediaId format' };
        }
        return { success: false, message: 'Failed to update media: ' + error.message };
    }
};

/**
 * Link existing media to a message
 * This new function helps connect uploaded media to a message
 * 
 * @param {String} mediaId - ID of the media to link
 * @param {String} messageId - ID of the message to link to
 * @param {String} userId - ID of user making the request
 * @returns {Object} Result with success status and updated media or error message
 */
const linkMediaToMessage = async (mediaId, messageId, userId) => {
    try {
        const media = await Media.findById(mediaId);// searching for the media
        const user = await User.findById(userId);// searching for the user

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (!media) {
            return { success: false, message: 'Media not found' };
        }
        
        // checking that only the sender can link media
        if (media.uploadedBy.toString() !== userId) {
            return { success: false, message: 'Unauthorized to link this media' };
        }
        
        // update media with message reference
        media.relatedTo = messageId;
        media.onModel = 'Message';
        await media.save();
        
        return { success: true, message: 'Media linked to message', media };
    } catch (error) {
        if (error.name === 'CastError' || error.kind === 'ObjectId') {
            return { success: false, message: 'Invalid ID format' };
        }
        return { success: false, message: 'Failed to link media: ' + error.message };
    }
};

module.exports = {
    uploadMedia,
    getMediaById,
    getUserMedia,
    getRelatedMedia,
    deleteMedia,
    updateMedia,
    linkMediaToMessage // Added new function
};