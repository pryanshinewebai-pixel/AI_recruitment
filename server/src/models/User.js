const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    firstName: { type: String },
    lastName: { type: String },
    profileImageUrl: { type: String },
    username: { type: String },
    isAdmin: { type: Boolean, default: false },
    role: { type: String, enum: ['candidate', 'employer', 'admin'], default: 'candidate' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
