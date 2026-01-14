import mongoose from 'mongoose';

const TestSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    mockTest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MockTest',
        required: true,
    },
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'abandoned'],
        default: 'in_progress',
    },
    startedAt: {
        type: Date,
        default: Date.now,
    },
    completedAt: {
        type: Date,
    },
    answers: {
        reading: { type: mongoose.Schema.Types.Mixed, default: {} },
        listening: { type: mongoose.Schema.Types.Mixed, default: {} },
        writing: { type: mongoose.Schema.Types.Mixed, default: {} },
    },
    scores: {
        reading: { type: Number },
        listening: { type: Number },
        writing: { type: Number },
        overall: { type: Number },
    },
});

export default mongoose.models.TestSession || mongoose.model('TestSession', TestSessionSchema);
