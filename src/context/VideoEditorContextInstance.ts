import { createContext } from 'react';
import type { VideoEditorState, VideoEditorAction } from './VideoEditorTypes';

interface VideoEditorContextType {
    state: VideoEditorState;
    dispatch: React.Dispatch<VideoEditorAction>;
}

export const VideoEditorContext = createContext<VideoEditorContextType | undefined>(undefined); 