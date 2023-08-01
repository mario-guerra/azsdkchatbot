import * as vscode from 'vscode';
import * as path from 'path';
import * as net from 'net';
import * as child_process from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "azsdkchatbot" is now active!');

    let client: net.Socket | null = null;

    startPythonScript();

    function connectToPythonScript(callback: (panel: vscode.WebviewPanel) => void, panel: vscode.WebviewPanel) {
        if (client) {
            callback(panel);
            return;
        }

        client = new net.Socket();
        client.connect(65432, '127.0.0.1', () => {
            console.log('Connected to Python script');
            callback(panel);
        });

        client.on('data', (data) => {
            const output = data.toString();
            console.log('Python script output:', output);
            panel.webview.postMessage({ command: 'receiveMessage', text: output });
        });

        client.on('close', () => {
            console.log('Connection to Python script closed');
            client = null;
        });
    }

    function runPythonCode(userInput: string, panel: vscode.WebviewPanel) {
        connectToPythonScript((panel) => {
            if (client) {
                client.write(userInput);
            }
        }, panel);
    }

    function createChatPanel() {
        const panel = vscode.window.createWebviewPanel(
            'azureSDKCopilot',
            'Azure SDK Copilot',
            vscode.ViewColumn.Beside,
            { enableScripts: true }
        );

        panel.webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Azure SDK Copilot</title>
        </head>
        <body>
            <h1>Azure SDK Copilot</h1>
            <input type="text" id="userInput" placeholder="Type your message...">
            <button id="sendButton">Send</button>
            <div id="chatHistory"></div>
            <script>
                const vscode = acquireVsCodeApi();
                const sendButton = document.getElementById('sendButton');
                const userInput = document.getElementById('userInput');
                const chatHistory = document.getElementById('chatHistory');

                function sendMessage() { // Added sendMessage function
                    const text = userInput.value;
                    userInput.value = '';
                    chatHistory.innerHTML += '<p><strong>User:</strong> ' + text + '</p>';
                    vscode.postMessage({ command: 'sendMessage', text });
                }

                sendButton.addEventListener('click', sendMessage);

                userInput.addEventListener('keydown', (event) => { // Added keydown event listener for userInput
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        sendMessage();
                    }
                });

                window.addEventListener('message', (event) => {
                    const message = event.data;
                    switch (message.command) {
                        case 'receiveMessage':
                            chatHistory.innerHTML += '<p><strong>AZSDKBot:</strong> ' + message.text + '</p>';
                            break;
                    }
                });
            </script>
        </body>
        </html>`;

        panel.webview.onDidReceiveMessage(
            (message) => {
                switch (message.command) {
                    case 'sendMessage':
                        const userInput = message.text;
                        runPythonCode(userInput, panel); // Pass the panel as an argument
                        break;
                }
            },
            undefined,
            context.subscriptions
        );
    }

    let disposable2 = vscode.commands.registerCommand('azsdkchatbot.runPython', () => {
        createChatPanel();
    });

    context.subscriptions.push(disposable2);
}

export function deactivate() {}

function startPythonScript() {
    const pythonExecutable = 'python';
    const pythonScriptPath = 'C:\\Users\\marioguerra\\Work\\SDKChat_extension\\azsdkchatbot\\python\\AzureSDKCopilotQdrantLocal.py';

    const pythonProcess = child_process.spawn(pythonExecutable, [pythonScriptPath]);

    pythonProcess.stdout.on('data', (data) => {
        console.log(`Python script output: ${data}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python script error: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Python script exited with code ${code}`);
    });
}