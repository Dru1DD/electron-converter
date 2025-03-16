const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    selectFile: () => ipcRenderer.invoke("select-file"),
    convertFile: (filePath) => ipcRenderer.invoke("convert-file", filePath),
});
