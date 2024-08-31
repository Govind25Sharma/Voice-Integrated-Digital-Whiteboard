import React, { useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

/*const VoiceControl = ({ clearBoard, undo, redo, drawShape }) => {
    const { transcript, resetTranscript } = useSpeechRecognition();

    useEffect(() => {
        if (transcript.includes('GS clear')) {
            clearBoard();
            resetTranscript();
        } else if (transcript.includes('GS back')) {
            undo();
            resetTranscript();
        } else if (transcript.includes('GS redo')) {
            redo();
            resetTranscript();
        } else if (transcript.includes('GS shapes')) {
            // You can display shapes options on the UI if required
        } else if (transcript.includes('circle')) {
            drawShape('circle');
            resetTranscript();
        } else if (transcript.includes('rectangle')) {
            resetTranscript();
        } else if (transcript.includes('square')) {
            drawShape('square');
            resetTranscript();
        }
    }, [transcript, clearBoard, undo, redo, drawShape, resetTranscript]);

    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
        return <div>Your browser does not support speech recognition.</div>;
    }

    const startListening = () => {
        SpeechRecognition.startListening({ continuous: true });
    };

    const stopListening = () => {
        SpeechRecognition.stopListening();
    };

    return (
        <div>
            <button onClick={startListening}>Start Voice Control</button>
            <button onClick={stopListening}>Stop Voice Control</button>
            <button onClick={resetTranscript}>Reset</button>
            <p>{transcript}</p>
        </div>
    );
};
export default VoiceControl;*/