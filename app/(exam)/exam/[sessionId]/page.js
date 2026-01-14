'use client';

import { useSearchParams } from 'next/navigation';
import ExamHeader from '../../components/ExamHeader';
import ExamFooter from '../../components/ExamFooter';
import ReadingInterface from '../../components/ReadingInterface';
import SpeakingInterface from '../../components/SpeakingInterface';
import ReviewScreen from '../../components/ReviewScreen';

export default function ExamPage() {
    const searchParams = useSearchParams();
    const module = searchParams?.get('module') || 'reading';

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-900">
            {/* Header */}
            <ExamHeader />

            {/* Main Content Area */}
            {module === 'reading' && <ReadingInterface />}
            {module === 'speaking' && <SpeakingInterface />}
            {/* Add other modules here later */}

            {/* Footer */}
            <ExamFooter />

            {/* Overlays */}
            <ReviewScreen />
        </div>
    );
}
