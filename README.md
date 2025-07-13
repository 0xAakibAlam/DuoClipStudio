# DuoClip Studio

A professional two-track video editor built with React, TypeScript, and modern web technologies. Create stunning video compositions with an intuitive drag-and-drop interface.

## Features

- **Dual Track Editing**: Load and edit two video tracks simultaneously
- **Real-time Preview**: See your edits in real-time with synchronized playback
- **Drag & Drop Timeline**: Intuitive timeline interface with draggable track bars
- **Professional UI**: Modern, gradient-based design with smooth animations
- **Responsive Design**: Works seamlessly across different screen sizes
- **Video Controls**: Standard video playback controls with custom playhead

## Prerequisites

- **Node.js**: Version 20 or higher
- **npm** or **yarn** package manager

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DuoClipStudio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
DuoClipStudio/
├── src/
│   ├── components/
│   │   └── DraggableTrackBar.tsx    # Timeline track component
│   ├── context/
│   │   └── VideoEditorContext.tsx    # State management
│   ├── App.tsx                      # Main app component
│   ├── VideoEditor.tsx              # Core video editor
│   └── main.tsx                     # Entry point
├── index.html                       # HTML template
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
└── vite.config.ts                   # Vite build configuration
```

## Usage

1. **Load Videos**: Click "Load Track A" or "Load Track B" to upload video files
2. **Preview**: Videos will appear in the preview area with playback controls
3. **Timeline Editing**: Drag track bars on the timeline to adjust timing
4. **Playhead Control**: Use the slider to scrub through the timeline
5. **Playback**: Use the play/pause button or video controls to preview your composition

## Technologies Used

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **@dnd-kit**: Drag and drop functionality
- **HTML5 Video API**: Video playback and manipulation

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Key Components

- **VideoEditor**: Main editor component with timeline and preview
- **DraggableTrackBar**: Timeline track with drag functionality
- **VideoEditorContext**: Global state management for editor state