export interface Track {
    file: File | null;
    url: string | null;
    start: number;
    duration: number;
}

export interface VideoEditorState {
    trackA: Track;
    trackB: Track;
    playhead: number;
    activeTrack: 'A' | 'B' | null;
    isPlaying: boolean;
    isHovering: boolean;
    timelinePixelWidth: number;
}

export type VideoEditorAction =
    | { type: 'SET_TRACK_A'; payload: Track }
    | { type: 'SET_TRACK_B'; payload: Track }
    | { type: 'SET_PLAYHEAD'; payload: number }
    | { type: 'SET_ACTIVE_TRACK'; payload: 'A' | 'B' | null }
    | { type: 'SET_IS_PLAYING'; payload: boolean }
    | { type: 'SET_IS_HOVERING'; payload: boolean }
    | { type: 'SET_TIMELINE_PIXEL_WIDTH'; payload: number };

export const initialState: VideoEditorState = {
    trackA: { file: null, url: null, start: 0, duration: 5 },
    trackB: { file: null, url: null, start: 0, duration: 5 },
    playhead: 0,
    activeTrack: null,
    isPlaying: false,
    isHovering: false,
    timelinePixelWidth: 800,
}; 