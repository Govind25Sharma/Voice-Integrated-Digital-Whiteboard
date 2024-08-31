import React, { useRef, useEffect, useState } from 'react';
import './Whiteboard.css';
import Toolbar from './Toolbar';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import 'whatwg-fetch';

const Whiteboard = () => {
    const canvasRef = useRef(null);
    const [context, setContext] = useState(null);
    const [color, setColor] = useState('#000'); // default color is black
    const [brushSize, setBrushSize] = useState(5); // default brush size
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [eraserSize, setEraserSize] = useState(5); // default eraser size
    const [isEraserActive, setIsEraserActive] = useState(false);
    const [isPenActive, setIsPenActive] = useState(false);
    const [penSize, setPenSize] = useState(5); // default pen size
    const [isFillActive, setIsFillActive] = useState(false);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const [shapes, setShapes] = useState([]);
    const [selectedShapeIndex, setSelectedShapeIndex] = useState(-1);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandleIndex, setResizeHandleIndex] = useState(-1);
    const [showColorPicker, setShowColorPicker] = useState(false);


    const { transcript, resetTranscript } = useSpeechRecognition();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctx.lineWidth = penSize;
        setContext(ctx);
        saveDrawingToHistory(ctx); // Save initial blank state to history

        // Start listening for "GS" command when component mounts
        startListening();

        // Cleanup: Stop listening when component unmounts
        return () => {
            stopListening();
        };
    }, []);

    useEffect(() => {
        // Handle voice commands in response to transcript changes
        handleVoiceCommands();
    }, [transcript]);

    const startListening = () => {
        SpeechRecognition.startListening({ continuous: true });
    };

    const stopListening = () => {
        SpeechRecognition.stopListening();
    };

    const toggleVoiceActivation = () => {
        setIsVoiceActive(!isVoiceActive);
        if (!isVoiceActive) {
            setTimeout(() => {
                setIsVoiceActive(false);
            }, 5000);
        }
    };

    const handleVoiceCommands = () => {
        if (transcript.toLowerCase().includes('gs')) {
            toggleVoiceActivation();
            resetTranscript();
            speak("yes");
        } else if (isVoiceActive) {
            // Handle specific commands when voice is active
            if (transcript.toLowerCase().includes('clear')) {
                clearBoard();
                resetTranscript();
                speak('Board cleared');
            } else if (transcript.toLowerCase().includes('pencil')) {
                togglePen();
                resetTranscript();
                speak('pencil');
            } else if (transcript.toLowerCase().includes('eraser')) {
                toggleEraser();
                resetTranscript();
                speak('eraser');
            } else if (transcript.toLowerCase().includes('filler')) {
                toggleFill();
                resetTranscript();
                speak('fill');
            } else if (transcript.toLowerCase().includes('back')) {
                undoDrawing();
                resetTranscript();
                speak('undo');
            } else if (transcript.toLowerCase().includes('front')) {
                redoDrawing();
                resetTranscript();
                speak('redo');
            } else if (transcript.includes('circle')) {
                drawShape('circle');
                resetTranscript();
                speak('circle');
            } else if (transcript.includes('rectangle')) {
                drawShape('rectangle');
                resetTranscript();
                speak('rectangle');
            } else if (transcript.includes('square')) {
                drawShape('square');
                resetTranscript();
                speak('square');
            }
        }
    };

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    };

    const startDrawing = (event) => {
        if (!context || isFillActive || (!isPenActive && !isEraserActive)) return;
        const { offsetX, offsetY } = event.nativeEvent;
        context.beginPath();
        context.moveTo(offsetX, offsetY);
        context.strokeStyle = isEraserActive ? '#fff' : color;
        context.lineWidth = isEraserActive ? eraserSize : penSize;
        setIsDrawing(true);
    };

    const draw = (event) => {
        if (!context || !isDrawing) return;
        const { offsetX, offsetY } = event.nativeEvent;
        context.lineTo(offsetX, offsetY);
        context.stroke();
    };

    const stopDrawing = () => {
        if (!context || !isDrawing) return;
        context.closePath();
        setIsDrawing(false);
        saveDrawingToHistory(context); // Save drawing state after drawing is completed
    };

    const clearBoard = () => {
        if (!context) return;
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        setHistory([]); // Clear the history
        setHistoryIndex(-1); // Reset the history index
        setShapes([]); // Clear shapes
        setSelectedShapeIndex(-1); // Reset selected shape index
    };

    const changeColor = (newColor) => {
        setColor(newColor);
        setIsEraserActive(false); // Exit eraser mode when changing color
    };

    const changeBrushSize = (newSize) => {
        setBrushSize(newSize);
        if (isPenActive) {
            context.lineWidth = newSize;
        }
    };

    const toggleEraser = () => {
        setIsEraserActive(true);
        setIsPenActive(false);
        setIsFillActive(false);
    };

    const changeEraserSize = (newSize) => {
        setEraserSize(newSize);
        if (isEraserActive) {
            context.lineWidth = newSize;
        }
    };

    const togglePen = () => {
        setIsPenActive(true);
        setIsEraserActive(false);
        setIsFillActive(false);
    };

    const changePenSize = (newSize) => {
        setPenSize(newSize);
        if (isPenActive) {
            context.lineWidth = newSize;
        }
    };

    const toggleFill = () => {
        setIsFillActive(true);
        setIsPenActive(false);
        setIsEraserActive(false);
    };

    const saveDrawingToHistory = (ctx) => {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const historyCopy = history.slice(0, historyIndex + 1); // Discard redo history
        historyCopy.push(imageData);
        setHistory(historyCopy);
        setHistoryIndex(historyCopy.length - 1);
    };

    const undoDrawing = () => {
        if (historyIndex <= 0) return;
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const prevImageData = history[newIndex];
        context.putImageData(prevImageData, 0, 0);
    };

    const redoDrawing = () => {
        if (historyIndex === history.length - 1) return;
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        const nextImageData = history[newIndex];
        context.putImageData(nextImageData, 0, 0);
    };

    const fillArea = (x, y, fillColor) => {
        const canvas = canvasRef.current; // Get canvas reference
        const context = canvas.getContext('2d');
        const width = context.canvas.width; // Define width correctly
        const height = context.canvas.height; // Define height correctly
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;
        const stack = [[x, y]];
        const targetColor = getPixelColor(data, x, y, width);
        const fillColorArray = hexToRgbA(fillColor);

        if (colorsMatch(targetColor, fillColorArray)) return;

        while (stack.length) {
            const [currentX, currentY] = stack.pop();
            const currentColor = getPixelColor(data, currentX, currentY, width);

            if (colorsMatch(currentColor, targetColor)) {
                setPixelColor(data, currentX, currentY, width, fillColorArray);
                if (currentX + 1 < width) stack.push([currentX + 1, currentY]);
                if (currentX - 1 >= 0) stack.push([currentX - 1, currentY]);
                if (currentY + 1 < height) stack.push([currentX, currentY + 1]);
                if (currentY - 1 >= 0) stack.push([currentX, currentY - 1]);
            }
        }

        context.putImageData(imageData, 0, 0);
        saveDrawingToHistory(context);
    };

    const getPixelColor = (data, x, y, width) => {
        const index = (y * width + x) * 4;
        return [data[index], data[index + 1], data[index + 2], data[index + 3]];
    };

    const setPixelColor = (data, x, y, width, fillColorArray) => {
        const index = (y * width + x) * 4;
        data[index] = fillColorArray[0];
        data[index + 1] = fillColorArray[1];
        data[index + 2] = fillColorArray[2];
        data[index + 3] = fillColorArray[3];
    };

    const colorsMatch = (color1, color2) => {
        return color1[0] === color2[0] &&
               color1[1] === color2[1] &&
               color1[2] === color2[2] &&
               color1[3] === color2[3];
    };
    const handleFill = (event) => {
        if (!context || !isFillActive) return;
        const { offsetX, offsetY } = event.nativeEvent;
        const fillColor = color; // Get the fill color from the state
        fillArea(offsetX, offsetY, fillColor);
    };
    const hexToRgbA = (hex) => {
        let c;
        if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c = hex.substring(1).split('');
            if (c.length === 3) {
                c = [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c = '0x' + c.join('');
            return [(c >> 16) & 255, (c >> 8) & 255, c & 255, 255];
        }
        throw new Error('Bad Hex');
    };

    
    const drawShape = (shapeType) => {
        if (!context) return;
    
        // Define initial shape properties
        let shape = {
            x: context.canvas.width / 2 - 50,
            y: context.canvas.height / 2 - 50,
            width: 100,
            height: 100,
            type: shapeType, // Add type to distinguish shapes
        };
    
        // Adjust shape properties based on type
        switch (shapeType) {
            case 'circle':
                shape.width = 100; // Diameter of the circle
                shape.height = 100;
                break;
            case 'rectangle':
                shape.width = 100;
                shape.height = 50;
                break;
            case 'square':
                shape.width = 100;
                shape.height = 100;
                break;
            default:
                return;
        }
    
        // Draw shape on canvas
        context.beginPath();
        if (shapeType === 'circle') {
            context.arc(shape.x + shape.width / 2, shape.y + shape.height / 2, shape.width / 2, 0, 2 * Math.PI);
        } else {
            context.rect(shape.x, shape.y, shape.width, shape.height);
        }
        context.stroke();
    
        // Update shapes state with new shape
        setShapes([...shapes, shape]);
    };

    const handleCanvasClick = (event) => {
        // Handle click on shapes for selection or resizing
        const { offsetX, offsetY } = event.nativeEvent;
        const selectedShape = shapes.findIndex(shape => {
            return (
                offsetX >= shape.x && offsetX <= shape.x + shape.width &&
                offsetY >= shape.y && offsetY <= shape.y + shape.height
            );
        });

        if (selectedShape !== -1) {
            setSelectedShapeIndex(selectedShape);
            setIsResizing(false);
        } else {
            setSelectedShapeIndex(-1);
        }
    };

    const handleCanvasMouseDown = (event) => {
        // Handle resizing of selected shape
        if (selectedShapeIndex !== -1) {
            const { offsetX, offsetY } = event.nativeEvent;
            const shape = shapes[selectedShapeIndex];

            // Check if mouse down on resize handle
            if (
                offsetX >= shape.x + shape.width - 10 &&
                offsetX <= shape.x + shape.width &&
                offsetY >= shape.y + shape.height - 10 &&
                offsetY <= shape.y + shape.height
            ) {
                setIsResizing(true);
                setResizeHandleIndex(1); // 1 represents bottom right corner
            }
        }
    };

    const handleCanvasMouseMove = (event) => {
        // Handle shape resizing
        if (selectedShapeIndex !== -1 && isResizing) {
            const { movementX, movementY } = event.nativeEvent;
            const shape = shapes[selectedShapeIndex];
            let newWidth = shape.width;
            let newHeight = shape.height;

            // Resize shape based on resize handle
            if (resizeHandleIndex === 1) {
                newWidth += movementX;
                newHeight += movementY;
            }

            // Update shape dimensions
            const updatedShape = {
                ...shape,
                width: newWidth,
                height: newHeight,
            };

            // Update shapes state with resized shape
            setShapes(shapes.map((item, index) => index === selectedShapeIndex ? updatedShape : item));
        }
    };

    const handleCanvasMouseUp = () => {
        // End shape resizing
        if (isResizing) {
            setIsResizing(false);
            setResizeHandleIndex(-1);
        }
    };

    return (
        <div>
            <Toolbar
                onErase={toggleEraser}
                onUndo={undoDrawing}
                onRedo={redoDrawing}
                onColorChange={changeColor}
                onEraserSizeChange={changeEraserSize}
                isEraserActive={isEraserActive}
                onPenToggle={togglePen}
                isPenActive={isPenActive}
                onPenSizeChange={changePenSize}
                onFill={toggleFill}
                isFillActive={isFillActive}
                eraserSize={eraserSize}
                penSize={penSize}
                onClear={clearBoard}
                onVoiceToggle={toggleVoiceActivation}
                isVoiceActive={isVoiceActive}
            />
              {showColorPicker && ( // Conditionally render color picker
                <div className="color-picker">
                    <input type="color" value={color} onChange={(e) => changeColor(e.target.value)} />
                </div>
            )}
            <canvas
                  ref={canvasRef}
                  onMouseDown={isFillActive ? handleFill : startDrawing} // Highlighted Changes: Corrected event handling
                  onMouseMove={isPenActive || isEraserActive ? draw : undefined}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className="whiteboard"
            />
            {isVoiceActive && (
                <div className="voice-indicator">
                    <p>Voice Command: Active</p>
                    <p>{transcript}</p>
                </div>
            )}
        </div>
    );
};

export default Whiteboard;


    
