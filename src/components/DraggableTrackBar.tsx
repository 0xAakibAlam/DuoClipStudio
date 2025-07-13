import { useDraggable } from '@dnd-kit/core';

interface Track {
  file: File | null;
  url: string | null;
  start: number;
  duration: number;
}

interface DraggableTrackBarProps {
  id: string;
  track: Track;
  color: string;
  timelineScale: number;
  timelinePixelWidth: number;
  showTextInside: boolean;
}

export function DraggableTrackBar({
  id,
  track,
  color,
  timelineScale,
  timelinePixelWidth,
  showTextInside,
}: DraggableTrackBarProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const leftPx = track.start * timelineScale;
  const widthPx = track.duration * timelineScale;
  let left = leftPx;
  if (transform) {
    left = leftPx + transform.x;
    left = Math.max(0, Math.min(timelinePixelWidth - widthPx, left));
  }

  return (
    <div className="relative h-16 flex flex-col group w-full">
      {track.url && (
        <div
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          className={`absolute top-0 flex items-center h-12 w-full ${isDragging ? 'z-20' : 'z-10'}`}
          style={{ left: `${left}px`, width: `${widthPx}px`, cursor: 'grab' }}
          tabIndex={0}
        >
          <div
            className={`h-12 w-full ${color} rounded-lg cursor-pointer transition-all duration-300 shadow-lg ${
              isDragging 
                ? 'ring-4 ring-white/50 shadow-2xl scale-105' 
                : 'group-hover:ring-2 group-hover:ring-white/30 group-hover:shadow-xl group-hover:scale-[1.02]'
            } hover:brightness-110 flex items-center px-2 border border-white/20 backdrop-blur-sm overflow-hidden`}
          >
            {showTextInside && (
              <div className="flex items-center justify-between w-full min-w-0">
                <div className="flex items-center min-w-0">
                  <div className="w-2 h-2 bg-white/80 rounded-full mr-2 flex-shrink-0"></div>
                  <div className="truncate text-white text-sm min-w-0" style={{maxWidth: 'calc(100% - 50px)'}}>
                    {track.file?.name || 'Video File'}
                  </div>
                </div>
                <div className="text-white/80 text-xs font-medium flex-shrink-0 ml-2">
                  {track.duration.toFixed(1)}s
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 