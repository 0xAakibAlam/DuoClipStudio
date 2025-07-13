import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';

interface Track {
    file: File | null;
    url: string | null;
    start: number;
    duration: number;
}

interface VideoEditorState {
    trackA: Track;
    trackB: Track;
    playhead: number;
    activeTrack: 'A' | 'B' | null;
    isPlaying: boolean;
    isHovering: boolean;
    timelinePixelWidth: number;
}

type VideoEditorAction =
    | { type: 'SET_TRACK_A'; payload: Track }
    | { type: 'SET_TRACK_B'; payload: Track }
    | { type: 'SET_PLAYHEAD'; payload: number }
    | { type: 'SET_ACTIVE_TRACK'; payload: 'A' | 'B' | null }
    | { type: 'SET_IS_PLAYING'; payload: boolean }
    | { type: 'SET_IS_HOVERING'; payload: boolean }
    | { type: 'SET_TIMELINE_PIXEL_WIDTH'; payload: number };

const initialState: VideoEditorState = {
    trackA: { file: null, url: null, start: 0, duration: 5 },
    trackB: { file: null, url: null, start: 0, duration: 5 },
    playhead: 0,
    activeTrack: null,
    isPlaying: false,
    isHovering: false,
    timelinePixelWidth: 800,
};

function videoEditorReducer(state: VideoEditorState, action: VideoEditorAction): VideoEditorState {
    switch (action.type) {
        case 'SET_TRACK_A':
            return { ...state, trackA: action.payload };
        case 'SET_TRACK_B':
            return { ...state, trackB: action.payload };
        case 'SET_PLAYHEAD':
            return { ...state, playhead: action.payload };
        case 'SET_ACTIVE_TRACK':
            return { ...state, activeTrack: action.payload };
        case 'SET_IS_PLAYING':
            return { ...state, isPlaying: action.payload };
        case 'SET_IS_HOVERING':
            return { ...state, isHovering: action.payload };
        case 'SET_TIMELINE_PIXEL_WIDTH':
            return { ...state, timelinePixelWidth: action.payload };
        default:
            return state;
    }
}

interface VideoEditorContextType {
    state: VideoEditorState;
    dispatch: React.Dispatch<VideoEditorAction>;
}

const VideoEditorContext = createContext<VideoEditorContextType | undefined>(undefined);

interface VideoEditorProviderProps {
    children: ReactNode;
}

export function VideoEditorProvider({ children }: VideoEditorProviderProps) {
    const [state, dispatch] = useReducer(videoEditorReducer, initialState);

    return (
        <VideoEditorContext.Provider value={{ state, dispatch }}>
            {children}
        </VideoEditorContext.Provider>
    );
}

export function useVideoEditor() {
    const context = useContext(VideoEditorContext);
    if (context === undefined) {
        throw new Error('useVideoEditor must be used within a VideoEditorProvider');
    }
    return context;
} 