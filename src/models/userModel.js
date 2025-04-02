const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const passwordValidator = (password) => {
    if (password.length < 6) return false;
    if (password.includes(' ')) return false;
    if (!password.split('').some(char => char >= 'A' && char <= 'Z')) return false;
    if (!password.split('').some(char => char >= '0' && char <= '9')) return false;
    return true;
}

const UserModel = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: [true, 'Username is already exist']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        validate: {
            validator: passwordValidator,
            message: 'Password must be at least 8 characters, one capital letter and one number.'
        }
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: [true, 'Email is already in use'],
        match: [/\S+@\S+\.\S+/, 'Please use a valid email address.']
    },
    profile_pic: {
        type: String,
        required: [true, 'Profile is required'],
    },
    status: {
        type: String,
        default: '',
    },
    contact: [
        {
            type: Schema.Types.ObjectId,
            ref: 'users',
            default: []
        }
    ],
    chats:[
        {
            type: Schema.Types.ObjectId,
            ref: 'chat',
            default: [],
        }
    ]
});

module.exports = mongoose.model('users', UserModel, 'users');