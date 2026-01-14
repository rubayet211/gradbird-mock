'use client';

import ExamHeader from '../../components/ExamHeader';
import ExamFooter from '../../components/ExamFooter';
import ReadingInterface from '../../components/ReadingInterface';

export default function ExamPage({ params }) {
    return (
        <div className="h-screen flex flex-col overflow-hidden">
            {/* Header */}
            <ExamHeader />

            {/* Main Content Area - Reading Interface */}
            <ReadingInterface />

            {/* Footer */}
            <ExamFooter />
        </div>
    );
}

