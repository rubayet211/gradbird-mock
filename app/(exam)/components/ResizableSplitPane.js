'use client';

import { Group, Panel, Separator, useDefaultLayout } from 'react-resizable-panels';

/**
 * Reusable split-pane component with draggable resize handle.
 * Persists user's preferred panel sizes to localStorage.
 */
const fallbackStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
};

export default function ResizableSplitPane({
    storageKey,
    leftPanel,
    rightPanel,
    defaultSizes = [50, 50],
    minSize = 20,
}) {
    // Use the hook for localStorage persistence
    const storage =
        typeof window !== 'undefined' && window.localStorage
            ? window.localStorage
            : fallbackStorage;
    const { defaultLayout, onLayoutChanged } = useDefaultLayout({
        id: storageKey,
        storage,
    });

    return (
        <Group
            orientation="horizontal"
            defaultLayout={defaultLayout}
            onLayoutChanged={onLayoutChanged}
            className="flex-1 flex"
        >
            {/* Left Panel */}
            <Panel id="left" defaultSize={defaultSizes[0]} minSize={minSize}>
                {leftPanel}
            </Panel>

            {/* Resize Handle */}
            <Separator className="group relative w-1 bg-gray-300 hover:bg-blue-500 transition-colors duration-150 cursor-col-resize">
                {/* Visible drag indicator */}
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col gap-1">
                        <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                        <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                        <span className="w-1 h-1 rounded-full bg-blue-600"></span>
                    </div>
                </div>
            </Separator>

            {/* Right Panel */}
            <Panel id="right" defaultSize={defaultSizes[1]} minSize={minSize}>
                {rightPanel}
            </Panel>
        </Group>
    );
}

