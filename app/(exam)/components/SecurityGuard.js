'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

export default function SecurityGuard() {
    const [isStarted, setIsStarted] = useState(false);
    const [securityAlert, setSecurityAlert] = useState(null); // null | 'TAB_SWITCH'
    const { sessionId } = useParams();

    // Log security events to server
    const logSecurityEvent = useCallback(async (eventType) => {
        try {
            await fetch('/api/exam/log-security', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sessionId,
                    eventType,
                    timestamp: new Date().toISOString(),
                }),
            });
        } catch (error) {
            console.error('Failed to log security event:', error);
        }
    }, [sessionId]);

    // Handle Page Visibility api
    useEffect(() => {
        if (!isStarted) return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                setSecurityAlert('TAB_SWITCH');
                logSecurityEvent('TAB_SWITCH');
            }
        };

        const handleBlur = () => {
            // Optional: treating window blur as similar to hidden if desired, 
            // but often valid if user just clicks browser chrome? 
            // Strictly asking "switches tabs or minimizes", visibilitychange covers this well.
            // If user clicks outside browser window (e.g. into another app) on dual monitor, visibility might not change, but focus does.
            // Let's stick to visibilitychange for now as it's less intrusive than blur.
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isStarted, logSecurityEvent]);

    // Disable Right Click
    useEffect(() => {
        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        document.addEventListener('contextmenu', handleContextMenu);
        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, []);

    // Prevent Back Button
    useEffect(() => {
        // Push state initially
        window.history.pushState(null, '', window.location.href);

        const handlePopState = () => {
            // Push state again to keep user here
            window.history.pushState(null, '', window.location.href);
            // Optionally warn user?
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    const handleStartTest = async () => {
        try {
            await document.documentElement.requestFullscreen();
            setIsStarted(true);
            logSecurityEvent('TEST_STARTED');
        } catch (err) {
            console.error('Error attempting to enable fullscreen:', err);
            // Allow start even if fullscreen fails (e.g. user denied), but maybe log it?
            setIsStarted(true);
            logSecurityEvent('TEST_STARTED_NO_FULLSCREEN');
        }
    };

    const handleReturnToExam = () => {
        setSecurityAlert(null);
        // Optionally try to re-enter fullscreen
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.error(err));
        }
    };

    if (!isStarted) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-95 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Start?</h2>
                    <p className="text-gray-600 mb-6">
                        The test continues in fullscreen mode. Please do not switch tabs or exit fullscreen until you finish.
                    </p>
                    <button
                        onClick={handleStartTest}
                        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                    >
                        Start Test
                    </button>
                    <div className="mt-4 text-xs text-gray-400">
                        Ensuring a secure testing environment
                    </div>
                </div>
            </div>
        );
    }

    if (securityAlert === 'TAB_SWITCH') {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-red-900 bg-opacity-95 backdrop-blur-md">
                <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center border-4 border-red-500 animate-pulse">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-red-600 mb-2">Security Alert</h2>
                    <p className="text-gray-700 mb-6 font-medium">
                        Please return to the exam immediately. Your activity has been logged.
                    </p>
                    <button
                        onClick={handleReturnToExam}
                        className="w-full py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-lg"
                    >
                        I'm Back - Continue Exam
                    </button>
                </div>
            </div>
        );
    }

    return null; // Render nothing when monitoring normally
}
