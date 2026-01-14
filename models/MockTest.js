import mongoose from 'mongoose';

const MockTestSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please provide a title for this mock test.'],
    },
    type: {
        type: String,
        enum: ['Academic', 'General Training'],
        required: [true, 'Please specify the test type.'],
    },
    listening: {
        audioUrl: String,
        questions: [{
            id: String,
            type: {
                type: String,
                enum: ['MCQ', 'GapFill', 'Matching', 'Map', 'ShortAnswer'], // Extended types
            },
            text: String, // For question stem
            options: [String], // For MCQ
            correctAnswer: String,
        }],
    },
    reading: {
        sections: [{
            title: String,
            passageText: String, // Rich text or HTML
            questions: [{
                id: String,
                type: {
                    type: String,
                    enum: ['MCQ', 'GapFill', 'TrueFalse', 'Matching', 'ShortAnswer', 'MultipleAnswer'],
                },
                text: String,
                options: [String],
                correctAnswer: String,
            }],
        }],
    },
    writing: {
        task1: {
            promptText: String,
            imageUrls: [String],
        },
        task2: {
            promptText: String,
        },
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

export default mongoose.models.MockTest || mongoose.model('MockTest', MockTestSchema);
