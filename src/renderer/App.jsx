import React, { useState } from "react";

const App = () => {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState("");
    const [progress, setProgress] = useState(0);

    const selectFile = async () => {
        const selectedFile = await window.electronAPI.selectFile();
        if (selectedFile) setFile(selectedFile);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFile = event.dataTransfer.files[0];
        if (droppedFile) setFile(droppedFile.path);
    };

    const convertFile = async () => {
        if (!file) return;
        setMessage("Converting...");
        setProgress(30);
        const response = await window.electronAPI.convertFile(file);
        setProgress(100);
        setMessage(response);
    };

    return (
        <div style={{ textAlign: "center", padding: 20 }}>
            <h1>PDF/FB2 to MOBI Converter</h1>
            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                style={{
                    border: "2px dashed #ccc",
                    padding: "20px",
                    cursor: "pointer",
                }}
            >
                <p>Drag & Drop File Here</p>
            </div>
            <button onClick={selectFile}>Select File</button>
            {file && <p>Selected: {file}</p>}
            <button onClick={convertFile} disabled={!file}>
                Convert
            </button>
            <div
                style={{
                    width: "100%",
                    background: "#eee",
                    borderRadius: "10px",
                    marginTop: "10px",
                }}
            >
                <div
                    style={{
                        width: `${progress}%`,
                        height: "10px",
                        background: "linear-gradient(to right, #4facfe, #00f2fe)",
                        borderRadius: "10px",
                        transition: "width 0.3s",
                    }}
                ></div>
            </div>
            <p>{message}</p>
        </div>
    );
};

export default App;
