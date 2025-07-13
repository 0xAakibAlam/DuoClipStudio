import { useReducer } from 'react';
import type { ReactNode } from 'react';
import { initialState, type VideoEditorState, type VideoEditorAction } from './VideoEditorTypes';
import { VideoEditorContext } from './VideoEditorContextInstance';

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