import React from 'react';
import './Toolbar.css';
import penIcon from '../images/pencil.png';
import eraserIcon from '../images/erasor.png';
import fillIcon from '../images/fill.png';
import undoIcon from '../images/undo.png';
import redoIcon from '../images/redo.png';
import clearIcon from '../images/clear.png';
import voiceIconActive from '../images/voice.png';
import voiceIconInactive from '../images/mute.png';
import gif from '../images/Vactive.gif'; // Assuming this is an animated icon for voice
import uploadIcon from '../images/upload.png';
import downloadIcon from '../images/download.png';

const Toolbar = ({
    onErase,
    onUndo,
    onRedo,
    onColorChange,
    onEraserSizeChange,
    isEraserActive,
    onPenToggle,
    isPenActive,
    onPenSizeChange,
    onFill,
    isFillActive,
    eraserSize,
    penSize,
    onClear,
    onVoiceToggle,
    isVoiceActive,
    onUploadFile,
    onDownloadCanvas
}) => {

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;


        const reader = new FileReader();
        reader.onload = (e) => {
            const dataURL = e.target.result;
            // Use dataURL to display on canvas or handle as needed
            // Example: Display image on canvas
            const img = new Image();
            img.onload = () => {
                const canvas = document.getElementById('canvas');
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
            };
            img.src = dataURL;
        };
        reader.readAsDataURL(file);
    };

    const handleDownloadCanvas = () => {
        const canvas = document.getElementById('canvas');
        const url = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = url;
        a.download = 'whiteboard.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="toolbar">
            <img
                src={penIcon}
                alt="Pen"
                onClick={onPenToggle}
                className={isPenActive ? 'active icon' : 'icon'}
            />
            <img
                src={eraserIcon}
                alt="Eraser"
                onClick={onErase}
                className={!isPenActive && !isFillActive ? 'active icon' : 'icon'}
            />
            <img
                src={fillIcon}
                alt="Fill"
                onClick={onFill}
                className={isFillActive ? 'active icon' : 'icon'}
            />
            {(isPenActive  || isFillActive) && (
                <input
                type="color"
                onChange={(e) => onColorChange(e.target.value)}
                style={{ display: (isPenActive || isFillActive)? 'block' : 'none' }}

            />
            )}
            {isPenActive && (
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={penSize}
                    onChange={(e) => onPenSizeChange(parseInt(e.target.value, 10))}
                />
            )}
            {isEraserActive && (
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={eraserSize}
                    onChange={(e) => onEraserSizeChange(parseInt(e.target.value, 10))}
                />
            )}
            <img src={undoIcon} alt="Undo" onClick={onUndo} className="icon" />
            <img src={redoIcon} alt="Redo" onClick={onRedo} className="icon" />
            <img src={clearIcon} alt="Clear" onClick={onClear} className="icon" />

            {/* Upload Button */}
            <label htmlFor="file-upload" >
                <img src={uploadIcon} alt="Upload" className="icon"/>
            </label>
            <input
                id="file-upload"
                type="file"
                accept=".ppt, .pptx, .jpg, .jpeg, .png, .gif, .mp4"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
            />

            {/* Download Button */}
            <img
                src={downloadIcon}
                alt="Download"
                onClick={handleDownloadCanvas}
                className="icon"
            />

            {/* Voice Button */}
            {isVoiceActive ? (
                <img
                    src={gif} 
                    alt="Voice Active"
                    onClick={onVoiceToggle}
                    className="active icon"
                />
            ) : (
                <img
                    src={voiceIconInactive}
                    alt="Voice Inactive"
                    onClick={onVoiceToggle}
                    className="icon"
                />
            )}
        </div>
    );
};

export default Toolbar;