const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { exec } = require('child_process');
const pdfParse = require('pdf-parse');
const { XMLParser } = require('fast-xml-parser');

let mainWindow;
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');

app.whenReady().then(() => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
        },
    });
    mainWindow.loadFile("dist/index.html");
});

ipcMain.handle('select-file', async () => {
    const { filePaths } = await dialog.showOpenDialog({
        filters: [
            { name: 'Ebook Files', extensions: ['pdf', 'fb2'] }
        ]
    });
    return filePaths[0] || null;
});

const mobi = require('mobi');

ipcMain.handle('convert-file', async (_, inputPath) => {
    try {
        const ext = path.extname(inputPath).toLowerCase();
        let text = '';
        if (ext === '.pdf') text = await extractTextFromPDF(inputPath);
        else if (ext === '.fb2') text = extractTextFromFB2(inputPath);
        else throw new Error('Unsupported format.');

        const htmlContent = convertToHTML(text);
        const outputDir = path.dirname(inputPath);
        const htmlPath = path.join(outputDir, 'output.html');
        await fs.writeFile(htmlPath, htmlContent);

        const mobiPath = path.join(outputDir, 'output.mobi');
        mobi.convert(htmlPath, mobiPath, (err) => {
            if (err) throw new Error(err);
            console.log('Conversion successful!');
        });

        return 'Conversion successful!';
    } catch (error) {
        return `Error: ${error.message}`;
    }
});

async function extractTextFromPDF(pdfPath) {
    const data = await fs.readFile(pdfPath);
    const pdf = await pdfParse(data);
    return pdf.text;
}

function extractTextFromFB2(fb2Path) {
    const xmlData = fs.readFileSync(fb2Path, 'utf8');
    const parser = new XMLParser();
    const json = parser.parse(xmlData);
    return json.FictionBook?.body?.section?.p?.join('\n') || '';
}

function convertToHTML(text) {
    return `<html><body><p>${text.replace(/\n/g, '</p><p>')}</p></body></html>`;
}
