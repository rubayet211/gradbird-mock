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
    // Track time remaining in seconds
    timeRemaining: {
        type: Number,
    },
    // Track when the session was last saved to calculate time drift if needed
    lastSavedAt: {
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
        // Writing can be Number (legacy) or detailed object (new)
        writing: { type: mongoose.Schema.Types.Mixed },
        // Speaking can be Number (legacy) or detailed object (new)
        speaking: { type: mongoose.Schema.Types.Mixed },
        overall: { type: Number },
    },
    // Detailed scoring breakdown for IELTS rubric
    writingDetails: {
        taskAchievement: { type: Number },
        coherenceCohesion: { type: Number },
        lexicalResource: { type: Number },
        grammaticalRange: { type: Number },
    },
    speakingDetails: {
        fluencyCoherence: { type: Number },
        lexicalResource: { type: Number },
        grammaticalRange: { type: Number },
        pronunciation: { type: Number },
    },
    // Detailed feedback per section
    detailedFeedback: {
        writing: {
            taskAchievement: { type: String },
            coherenceCohesion: { type: String },
            lexicalResource: { type: String },
            grammaticalRange: { type: String },
            overall: { type: String },
        },
        speaking: {
            fluencyCoherence: { type: String },
            lexicalResource: { type: String },
            grammaticalRange: { type: String },
            pronunciation: { type: String },
            overall: { type: String },
        },
    },
    feedback: {
        type: String,
    },
    gradedAt: {
        type: Date,
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
});

export default mongoose.models.TestSession || mongoose.model('TestSession', TestSessionSchema);
