'use client';

import ExamHeader from '../../components/ExamHeader';
import ReadingInterface from '../../components/ReadingInterface';

export default function ExamPage({ params }) {
    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <ExamHeader />

            {/* Main Content Area - Reading Interface */}
            <ReadingInterface />
        </div>
    );
}
