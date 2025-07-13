import { VideoEditorProvider } from './context/VideoEditorContext';
import { VideoEditor } from './VideoEditor';

function App() {
    return (
        <VideoEditorProvider>
            <VideoEditor />
        </VideoEditorProvider>
    );
}

export default App;