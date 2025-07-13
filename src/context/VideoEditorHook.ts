import { useContext } from 'react';
import { VideoEditorContext } from './VideoEditorContextInstance';

export function useVideoEditor() {
    const context = useContext(VideoEditorContext);
    if (context === undefined) {
        throw new Error('useVideoEditor must be used within a VideoEditorProvider');
    }
    return context;
} 