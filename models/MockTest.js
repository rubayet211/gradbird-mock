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
    moduleType: {
        type: String,
        enum: ['Full', 'Listening', 'Reading', 'Writing', 'Speaking'],
        default: 'Full',
        required: true,
    },
    listening: {
        parts: [{
            partNumber: { type: Number, required: true },
            title: String,
            audioUrl: { type: String, default: '' },
            transcript: String,
            questions: [{
                id: String,
                type: {
                    type: String,
                    enum: ['MCQ', 'GapFill', 'Matching', 'MapLabeling', 'ShortAnswer', 'TrueFalse'],
                },
                text: String,
                options: [String],
                correctAnswer: mongoose.Schema.Types.Mixed, // String or Array for multiple answers
                // For GapFill
                wordLimit: Number,
                // For MapLabeling
                imageUrl: String,
                dropZones: [{
                    id: String,
                    x: Number, // percentage
                    y: Number, // percentage
                    label: String,
                }],
                labels: [String], // draggable labels
            }],
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
                    enum: ['MCQ', 'GapFill', 'TrueFalse', 'Matching', 'ShortAnswer', 'MultipleAnswer', 'DiagramLabeling'],
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
            imageUrls: [String],
        },
    },
    speaking: {
        part1: {
            title: String,
            duration: String,
            description: String,
            interviewTopics: [{
                topic: String,
                questions: [String]
            }]
        },
        part2: {
            title: String,
            duration: String,
            description: String,
            preparationTime: Number,
            speakingTime: Number,
            cueCard: {
                topic: String,
                prompts: [String]
            }
        },
        part3: {
            title: String,
            duration: String,
            description: String,
            discussionTopics: [{
                topic: String,
                questions: [String]
            }]
        }
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
