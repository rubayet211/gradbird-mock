import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please provide an email for this user.'],
        unique: true,
    },
    name: {
        type: String,
    },
    image: {
        type: String,
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
