import * as vscode from 'vscode';
import * as path from 'path';
import * as net from 'net';
import * as child_process from 'child_process';
import MarkdownIt from 'markdown-it';

let pythonScriptRunning = false;

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "azsdkchatbot" is now active!');

    let client: net.Socket | null = null;
    const md = new MarkdownIt();

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
            const markdownText = md.render(output);
            panel.webview.postMessage({ command: 'receiveMessage', markdownText });
        });

        client.on('close', () => {
            console.log('Connection to Python script closed');
            client = null;
        });
    }

    function runPythonCode(userInput: string, panel: vscode.WebviewPanel) {
        if (userInput === 'exit') {
          if (client) {
            client.write(userInput);
          }
          panel.dispose();
        } else {
          connectToPythonScript((panel) => {
            if (client) {
              client.write(userInput);
            }
          }, panel);
        }
      }

    function createChatPanel() {
        // Check if the Python script is running and start it if it's not
        if (!pythonScriptRunning) {
            startPythonScript();
        }
        const panel = vscode.window.createWebviewPanel(
            'azureSDKCopilot',
            'Azure SDK Copilot',
            vscode.ViewColumn.Beside,
            { enableScripts: true }
        );

        const stylesPath = panel.webview.asWebviewUri(vscode.Uri.file(path.join(context.extensionPath, 'media', 'markdown.css')));

        panel.webview.html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Azure SDK Copilot</title>
            <link href="${stylesPath}" rel="stylesheet">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
            <style>
                body, html {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    width: 100%;
                }
                .container {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                .header-pane {
                    background-color: var(--vscode-editor-background); /* Use the editor background color */
                    padding: 10px;
                }
                .header-pane h1 {
                    color: var(--vscode-editor-foreground);
                }
                .input-pane {
                    display: flex;
                    align-items: center;
                    padding: 10px;
                    background-color: var(--vscode-editor-background); /* Use the editor background color */
                }
                #userInput {
                    flex-grow: 1;
                    margin-right: 10px;
                    border: 1px solid var(--vscode-editor-background); /* Use the editor background color */
                }
                .chat-pane {
                    flex-grow: 1;
                    overflow-y: auto;
                    padding: 10px;
                    background-color: var(--vscode-editor-background); /* Use the editor background color */
                }
                .message {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                }
        </style>
        </head>
        <body>
            <div class="container">
                <div class="header-pane">
                    <h1>Azure SDK Copilot</h1>
                </div>
                <div class="input-pane">
                    <input type="text" id="userInput" placeholder="Type your message...">
                    <button id="sendButton">Send</button>
                </div>
                <div class="chat-pane" id="chatHistory">
                </div>
            </div>
            <script>
                const vscode = acquireVsCodeApi();
                const sendButton = document.getElementById('sendButton');
                const userInput = document.getElementById('userInput');
                const chatHistory = document.getElementById('chatHistory');

                // Add the scrollChatToBottom function here
                function scrollChatToBottom() {
                    chatHistory.scrollTop = chatHistory.scrollHeight;
                }

                function sendMessage() {
                    const text = userInput.value.trim();
                    userInput.value = '';

                    if (text === 'exit' || text === 'end') {
                      vscode.postMessage({ command: 'exit' });
                    } else {
                      chatHistory.insertAdjacentHTML('beforeend', '<p><strong><i class="fas fa-user"></i></p></strong><div><p>' + text + '</p></div></div>');
                      vscode.postMessage({ command: 'sendMessage', text });
                    }

                    scrollChatToBottom();
                  }

                sendButton.addEventListener('click', sendMessage);

                userInput.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter') {
                        event.preventDefault();
                        sendMessage();
                    }
                });

                window.addEventListener('message', (event) => {
                    const message = event.data;
                    switch (message.command) {
                      case 'receiveMessage':
                        const renderedMarkdown = message.markdownText;
                        chatHistory.insertAdjacentHTML('beforeend', '<div class="message"><strong><i class="fas fa-robot"></i></strong><div>' + renderedMarkdown + '</div></div>');
                        scrollChatToBottom();
                        break;
                    }
                  });                

                window.addEventListener('DOMContentLoaded', () => {
                    userInput.focus();
                });
            </script>
        </body>
        </html>`;
        panel.webview.onDidReceiveMessage(
            (message) => {
              switch (message.command) {
                case 'sendMessage':
                  const userInput = message.text;
                  runPythonCode(userInput, panel);
                  break;
                case 'exit':
                  runPythonCode('exit', panel);
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
        // Set pythonScriptRunning to false when the script exits
        pythonScriptRunning = false;
    });
    pythonScriptRunning = true;
}    