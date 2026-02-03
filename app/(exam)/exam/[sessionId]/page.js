'use client';

import { useSearchParams } from 'next/navigation';
import ExamHeader from '../../components/ExamHeader';
import ExamFooter from '../../components/ExamFooter';
import ReadingInterface from '../../components/ReadingInterface';
import ListeningInterface from '../../components/ListeningInterface';
import WritingInterface from '../../components/WritingInterface';
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
            <div className="flex-1 overflow-hidden exam-font-scale">
                {module === 'reading' && <ReadingInterface />}
                {module === 'listening' && <ListeningInterface />}
                {module === 'writing' && <WritingInterface />}
                {module === 'speaking' && <SpeakingInterface />}
            </div>

            {/* Footer */}
            <ExamFooter />

            {/* Overlays */}
            <ReviewScreen />
        </div>
    );
}
