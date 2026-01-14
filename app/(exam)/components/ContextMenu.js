'use client';

import { useEffect, useRef } from 'react';

/**
 * Custom context menu component for text selection actions
 * Displays at cursor position with Highlight and Note options
 */
export default function ContextMenu({ x, y, onHighlight, onNote, onClose }) {
    const menuRef = useRef(null);

    // Handle click outside to close menu
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        // Add listeners with a slight delay to prevent immediate close
        const timeoutId = setTimeout(() => {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }, 10);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    // Adjust position to keep menu within viewport
    const adjustedX = Math.min(x, window.innerWidth - 160);
    const adjustedY = Math.min(y, window.innerHeight - 100);

    return (
        <div
            ref={menuRef}
            className="fixed z-[9999] bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-100"
            style={{ left: adjustedX, top: adjustedY }}
        >
            <button
                onClick={onHighlight}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-yellow-50 hover:text-yellow-700 flex items-center gap-3 transition-colors"
            >
                <span className="text-base">📌</span>
                Highlight
            </button>
            <button
                onClick={onNote}
                className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3 transition-colors"
            >
                <span className="text-base">📝</span>
                Note
            </button>
        </div>
    );
}
