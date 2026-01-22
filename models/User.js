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
    mocksAvailable: {
        type: Number,
        default: 0,
    },
    purchasedPackages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
