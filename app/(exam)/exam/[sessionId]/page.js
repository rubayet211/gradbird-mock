'use client';

import ExamHeader from '../../components/ExamHeader';
import ExamFooter from '../../components/ExamFooter';
import ReadingInterface from '../../components/ReadingInterface';
import ReviewScreen from '../../components/ReviewScreen';

export default function ExamPage({ params }) {
    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-900">
            {/* Header */}
            <ExamHeader />

            {/* Main Content Area - Reading Interface */}
            <ReadingInterface />

            {/* Footer */}
            <ExamFooter />

            {/* Overlays */}
            <ReviewScreen />
        </div>
    );
}
