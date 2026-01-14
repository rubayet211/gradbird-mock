'use client';

/**
 * Sticky-note icon shown in the passage margin for notes
 * Positioned absolutely relative to the passage container
 */
export default function NoteMarginIcon({ note, topOffset, onClick }) {
    // Truncate note text for tooltip preview
    const previewText = note.note.length > 80
        ? note.note.substring(0, 80) + '...'
        : note.note;

    return (
        <button
            onClick={() => onClick?.(note)}
            className="absolute -left-8 w-6 h-6 flex items-center justify-center bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded shadow-sm cursor-pointer transition-all hover:scale-110 group z-10"
            style={{ top: topOffset }}
            title={previewText}
            aria-label={`View note: ${previewText}`}
        >
            {/* Sticky note icon */}
            <svg
                className="w-4 h-4 text-amber-600"
                fill="currentColor"
                viewBox="0 0 20 20"
            >
                <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h8.586l3.707-3.707A1 1 0 0016.586 12H17a2 2 0 002-2V6a2 2 0 00-2-2H4z" />
                <path d="M9.707 16.707A1 1 0 0110 16v-3a1 1 0 011-1h3a1 1 0 01.707.293l-5 5z" className="text-amber-400" fill="currentColor" opacity="0.5" />
            </svg>

            {/* Hover tooltip */}
            <div className="absolute left-8 top-0 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 pointer-events-none">
                <div className="mb-1 text-amber-300 font-medium">Note:</div>
                <div className="text-gray-200 leading-relaxed">{previewText}</div>
                <div className="mt-2 pt-2 border-t border-gray-700 text-gray-400 italic text-[10px] line-clamp-1">
                    "{note.text?.substring(0, 40)}..."
                </div>
                {/* Triangle pointer */}
                <div className="absolute -left-1.5 top-3 w-3 h-3 bg-gray-900 rotate-45" />
            </div>
        </button>
    );
}
