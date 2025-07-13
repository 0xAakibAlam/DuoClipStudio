import { useRef, useEffect, useCallback } from 'react';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { DraggableTrackBar } from './components/DraggableTrackBar';
import { useVideoEditor } from './context/VideoEditorHook';
import type { Track } from './context/VideoEditorTypes';

export function VideoEditor() {
    const { state, dispatch } = useVideoEditor();
    const { trackA, trackB, playhead, activeTrack, isPlaying, isHovering, timelinePixelWidth } = state;
    
    const videoRefA = useRef<HTMLVideoElement>(null);
    const videoRefB = useRef<HTMLVideoElement>(null);
    const fileInputA = useRef<HTMLInputElement>(null);
    const fileInputB = useRef<HTMLInputElement>(null);
    const timelineAreaRef = useRef<HTMLDivElement>(null);

    const updateTimelineWidth = useCallback(() => {
        if (timelineAreaRef.current) {
            const areaWidth = timelineAreaRef.current.offsetWidth;
            dispatch({ type: 'SET_TIMELINE_PIXEL_WIDTH', payload: areaWidth });
        }
    }, [dispatch]);

    let timelineLength: number = 0;
    if (trackA.url && !trackB.url) {
        timelineLength = trackA.duration;
    } else if (!trackA.url && trackB.url) {
        timelineLength = trackB.duration;
    } else if (trackA.url && trackB.url) {
        timelineLength = trackA.duration + trackB.duration;
    }
    const TIMELINE_SCALE = timelinePixelWidth / timelineLength;

    useEffect(() => {
        updateTimelineWidth();
    }, [trackA, trackB, updateTimelineWidth]);

    useEffect(() => {
        const handleResize = () => {
            updateTimelineWidth();
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [updateTimelineWidth]);

    const togglePlayPause = () => {
        if (isPlaying) {
            if (videoRefA.current) videoRefA.current.pause();
            if (videoRefB.current) videoRefB.current.pause();
            dispatch({ type: 'SET_IS_PLAYING', payload: false });
        } else {
            if (activeTrack) {
                const videoRef = activeTrack === 'A' ? videoRefA : videoRefB;
                const video = videoRef.current;
                if (video) {
                    video.play();
                    dispatch({ type: 'SET_IS_PLAYING', payload: true });
                }
            } else {
                if (trackB.url && playhead >= trackB.start && playhead < trackB.start + trackB.duration) {
                    dispatch({ type: 'SET_ACTIVE_TRACK', payload: 'B' });
                    const videoB = videoRefB.current;
                    if (videoB) {
                        videoB.currentTime = 0;
                        videoB.play();
                        dispatch({ type: 'SET_IS_PLAYING', payload: true });
                    }
                } else if (trackA.url && playhead >= trackA.start && playhead < trackA.start + trackA.duration) {
                    dispatch({ type: 'SET_ACTIVE_TRACK', payload: 'A' });
                    const videoA = videoRefA.current;
                    if (videoA) {
                        videoA.currentTime = 0;
                        videoA.play();
                        dispatch({ type: 'SET_IS_PLAYING', payload: true });
                    }
                }
            }
        }
    };

    useEffect(() => {
        const videoA = videoRefA.current;
        const videoB = videoRefB.current;

        const isTrackBAvailable = trackB.url && playhead >= trackB.start && playhead < trackB.start + trackB.duration;
        const isTrackAAvailable = trackA.url && playhead >= trackA.start && playhead < trackA.start + trackA.duration;

        if (isTrackBAvailable && activeTrack !== 'B') {
            dispatch({ type: 'SET_ACTIVE_TRACK', payload: 'B' });
            if (isPlaying && videoRefB.current) {
                videoRefB.current.play();
                videoRefB.current.currentTime = playhead - trackB.start;
            }
        } else if (!isTrackBAvailable && isTrackAAvailable && activeTrack !== 'A') {
            dispatch({ type: 'SET_ACTIVE_TRACK', payload: 'A' });
            if (isPlaying && videoRefA.current) {
                videoRefA.current.play();
                videoRefA.current.currentTime = playhead - trackA.start;
            }
        } else if (!isTrackBAvailable && !isTrackAAvailable && activeTrack !== null) {
            dispatch({ type: 'SET_ACTIVE_TRACK', payload: null });
        }

        const handleTimeUpdate = (video: HTMLVideoElement, track: Track) => {
            if (isPlaying && activeTrack) {
                const videoTime = video.currentTime;
                const timelineTime = track.start + videoTime;
                dispatch({ type: 'SET_PLAYHEAD', payload: timelineTime });
            }
        };

        const handleEnded = () => {
            console.log(isTrackBAvailable, isTrackAAvailable, isPlaying);
            if (isTrackBAvailable) {
                dispatch({ type: 'SET_IS_PLAYING', payload: true });
                dispatch({ type: 'SET_ACTIVE_TRACK', payload: 'B' });
                if (videoRefB.current) {
                    videoRefB.current.play();
                    videoRefB.current.currentTime = playhead - trackB.start;
                }
            } else if (isTrackAAvailable) {
                dispatch({ type: 'SET_IS_PLAYING', payload: true });
                dispatch({ type: 'SET_ACTIVE_TRACK', payload: 'A' });
                if (videoRefA.current) {
                    videoRefA.current.play();
                    videoRefA.current.currentTime = playhead - trackA.start;
                }
            } else {
                dispatch({ type: 'SET_ACTIVE_TRACK', payload: null });
            }
        };

        const handlePlay = () => dispatch({ type: 'SET_IS_PLAYING', payload: true });
        const handlePause = () => dispatch({ type: 'SET_IS_PLAYING', payload: false });

        if (videoA) {
            videoA.addEventListener('timeupdate', () => handleTimeUpdate(videoA, trackA));
            videoA.addEventListener('play', handlePlay);
            videoA.addEventListener('pause', handlePause);
            videoA.addEventListener('ended', handleEnded);
        }
        if (videoB) {
            videoB.addEventListener('timeupdate', () => handleTimeUpdate(videoB, trackB));
            videoB.addEventListener('play', handlePlay);
            videoB.addEventListener('pause', handlePause);
            videoB.addEventListener('ended', handleEnded);
        }

        return () => {
            if (videoA) {
                videoA.removeEventListener('timeupdate', () => handleTimeUpdate(videoA, trackA));
                videoA.removeEventListener('play', handlePlay);
                videoA.removeEventListener('pause', handlePause);
                videoA.removeEventListener('ended', handleEnded);
            }
            if (videoB) {
                videoB.removeEventListener('timeupdate', () => handleTimeUpdate(videoB, trackB));
                videoB.removeEventListener('play', handlePlay);
                videoB.removeEventListener('ended', handleEnded);
            }
        };
    }, [trackA, trackB, isPlaying, playhead, activeTrack, dispatch]);

    const handleLoadVideo = (track: 'A' | 'B', file: File) => {
        const url = URL.createObjectURL(file);
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.src = url;
        video.onloadedmetadata = () => {
            const duration = video.duration;
            if (track === 'A') {
                dispatch({ type: 'SET_TRACK_A', payload: { file, url, start: 0, duration } });
            } else {
                dispatch({ type: 'SET_TRACK_B', payload: { file, url, start: 0, duration } });
            }
        };
    };

    const handlePlayheadChange = (t: number) => {
        dispatch({ type: 'SET_PLAYHEAD', payload: t });

        const isTrackBAvailable = trackB.url && t >= trackB.start && t < trackB.start + trackB.duration;
        const isTrackAAvailable = trackA.url && t >= trackA.start && t < trackA.start + trackA.duration;

        if (isTrackBAvailable) {
            dispatch({ type: 'SET_ACTIVE_TRACK', payload: 'B' });
            if (videoRefB.current) {
                const videoTime = t - trackB.start;
                videoRefB.current.currentTime = Math.max(0, videoTime);
            }
        } else if (isTrackAAvailable) {
            dispatch({ type: 'SET_ACTIVE_TRACK', payload: 'A' });
            if (videoRefA.current) {
                const videoTime = t - trackA.start;
                videoRefA.current.currentTime = Math.max(0, videoTime);
            }
        } else {
            dispatch({ type: 'SET_IS_PLAYING', payload: false });
            dispatch({ type: 'SET_ACTIVE_TRACK', payload: null });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, delta } = event;
        if (!active) return;
        const secondsDelta = delta.x / TIMELINE_SCALE;
        if (active.id === 'trackA' && trackA.url) {
            let newStart = trackA.start + secondsDelta;
            newStart = Math.max(0, Math.min(timelineLength - trackA.duration, newStart));
            dispatch({ type: 'SET_TRACK_A', payload: { ...trackA, start: newStart } });
        } else if (active.id === 'trackB' && trackB.url) {
            let newStart = trackB.start + secondsDelta;
            newStart = Math.max(0, Math.min(timelineLength - trackB.duration, newStart));
            dispatch({ type: 'SET_TRACK_B', payload: { ...trackB, start: newStart } });
        }
    };

    const playheadPosPx = playhead * TIMELINE_SCALE - 1;

    const minBarWidthForText = 90;
    const getShowTextInside = (track: Track) => {
        if (!track.url) return true;
        const duration = track.duration;
        const widthPx = duration * TIMELINE_SCALE;
        return widthPx > minBarWidthForText;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
            {/* Header */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
                <div className="relative z-10 px-6 py-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-center mb-2">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                                <span className="text-2xl">🎬</span>
                            </div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                DuoClip Studio
                            </h1>
                        </div>
                        <p className="text-center text-slate-300 text-lg">Professional Two-Track Video Editor</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-8">
                {/* File Upload Section */}
                <div className="my-8">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <div className="flex-1">
                            <input
                                ref={fileInputA}
                                type="file"
                                accept="video/mp4"
                                className="hidden"
                                onClick={e => e.stopPropagation()}
                                onChange={e => {
                                    if (e.target.files && e.target.files[0]) handleLoadVideo('A', e.target.files[0]);
                                }}
                            />
                            <button
                                className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-blue-400/30"
                                onClick={e => {
                                    e.stopPropagation();
                                    fileInputA.current?.click();
                                }}
                                tabIndex={-1}
                            >
                                <div className="flex items-center justify-center">
                                    <span className="text-xl mr-2">📹</span>
                                    <span>Load Track A</span>
                                </div>
                            </button>
                        </div>
                        <div className="flex-1">
                            <input
                                ref={fileInputB}
                                type="file"
                                accept="video/mp4"
                                className="hidden"
                                onClick={e => e.stopPropagation()}
                                onChange={e => {
                                    if (e.target.files && e.target.files[0]) handleLoadVideo('B', e.target.files[0]);
                                }}
                            />
                            <button
                                className="w-full px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl border border-emerald-400/30"
                                onClick={e => {
                                    e.stopPropagation();
                                    fileInputB.current?.click();
                                }}
                                tabIndex={-1}
                            >
                                <div className="flex items-center justify-center">
                                    <span className="text-xl mr-2">🎥</span>
                                    <span>Load Track B</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Video Preview Section */}
                <div className="mb-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Video Preview</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                    </div>
                    <div className="flex justify-center">
                        <div
                            className="relative w-full max-w-2xl aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-white/20 shadow-2xl"
                            onMouseEnter={() => dispatch({ type: 'SET_IS_HOVERING', payload: true })}
                            onMouseLeave={() => dispatch({ type: 'SET_IS_HOVERING', payload: false })}
                        >
                            {trackA.url && (
                                <video
                                    ref={videoRefA}
                                    src={trackA.url}
                                    className="w-full h-full object-cover"
                                    controls
                                    style={{ display: activeTrack === 'A' ? 'block' : 'none' }}
                                />
                            )}
                            {trackB.url && (
                                <video
                                    ref={videoRefB}
                                    src={trackB.url}
                                    className="w-full h-full object-cover"
                                    controls
                                    style={{ display: activeTrack === 'B' ? 'block' : 'none' }}
                                />
                            )}
                            {!activeTrack && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4 opacity-50">🎬</div>
                                        <p className="text-slate-400 text-lg">Load videos to start editing</p>
                                    </div>
                                </div>
                            )}

                            {activeTrack && (!isPlaying || isHovering) && (
                                <button
                                    onClick={togglePlayPause}
                                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm text-white rounded-full w-20 h-20 flex items-center justify-center hover:bg-black/90 transition-all duration-300 shadow-2xl border border-white/20 hover:scale-110"
                                    disabled={!activeTrack}
                                >
                                    <span className="text-3xl">
                                        {isPlaying ? '⏸️' : '▶️'}
                                    </span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Timeline Section */}
                <div>
                    <DndContext onDragEnd={handleDragEnd}>
                        <div className="space-y-6">
                            {trackA.url && (
                                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                    <div className="flex items-center mb-2">
                                        <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full mr-3"></div>
                                        <span className="text-white font-semibold">Track A</span>
                                        {!getShowTextInside(trackA) && (
                                            <span className="ml-2 text-xs font-semibold text-white/90 flex items-center truncate overflow-hidden whitespace-nowrap max-w-[140px]">
                                                <span className="truncate overflow-hidden whitespace-nowrap max-w-[90px]">{trackA.file?.name || 'Video File'}</span>
                                                <span className="ml-2 text-white/60 font-normal flex-shrink-0">{trackA.duration.toFixed(1)}s</span>
                                            </span>
                                        )}
                                    </div>
                                    <div ref={timelineAreaRef} className="relative h-10 bg-slate-800/50 rounded-lg border border-white/10">
                                        <DraggableTrackBar
                                            id="trackA"
                                            track={trackA}
                                            color="bg-gradient-to-r from-blue-500 to-blue-600"
                                            timelineScale={TIMELINE_SCALE}
                                            timelinePixelWidth={timelinePixelWidth}
                                            showTextInside={getShowTextInside(trackA)}
                                        />
                                    </div>
                                </div>
                            )}
                            {trackB.url && (
                                <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                    <div className="flex items-center mb-2">
                                        <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full mr-3"></div>
                                        <span className="text-white font-semibold">Track B</span>
                                        {!getShowTextInside(trackB) && (
                                            <span className="ml-2 text-xs font-semibold text-white/90 flex items-center truncate overflow-hidden whitespace-nowrap max-w-[140px]">
                                                <span className="truncate overflow-hidden whitespace-nowrap max-w-[90px]">{trackB.file?.name || 'Video File'}</span>
                                                <span className="ml-2 text-white/60 font-normal flex-shrink-0">{trackB.duration.toFixed(1)}s</span>
                                            </span>
                                        )}
                                    </div>
                                    <div ref={!trackA.url ? timelineAreaRef : undefined} className="relative h-10 bg-slate-800/50 rounded-lg border border-white/10">
                                        {!trackA.url && (
                                            <div
                                                className="absolute top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-purple-400 z-20 rounded-full shadow-lg"
                                                style={{ left: `${playheadPosPx}px` }}
                                            />
                                        )}
                                        <DraggableTrackBar
                                            id="trackB"
                                            track={trackB}
                                            color="bg-gradient-to-r from-emerald-500 to-emerald-600"
                                            timelineScale={TIMELINE_SCALE}
                                            timelinePixelWidth={timelinePixelWidth}
                                            showTextInside={getShowTextInside(trackB)}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            {/* Playhead Control */}
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                <div className="relative">
                                    <input
                                        type="range"
                                        min={0}
                                        max={timelineLength}
                                        step={0.01}
                                        value={playhead}
                                        onChange={e => handlePlayheadChange(Number(e.target.value))}
                                        className="w-full h-3 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                                        style={{
                                            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(playhead / timelineLength) * 100}%, #475569 ${(playhead / timelineLength) * 100}%, #475569 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                                        <span>0:00</span>
                                        <span>{Math.floor(timelineLength / 60)}:{(timelineLength % 60).toFixed(0).padStart(2, '0')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DndContext>
                </div>
            </div>

            <style>{`
                .slider::-webkit-slider-thumb {
                    appearance: none;
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    cursor: pointer;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    border: 2px solid white;
                }
                
                .slider::-moz-range-thumb {
                    height: 20px;
                    width: 20px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
                    cursor: pointer;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
                    border: 2px solid white;
                }
            `}</style>
        </div>
    );
}