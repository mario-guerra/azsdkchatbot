# ChatGPT for VS Code Extension - TypeScript UI

This is the TypeScript UI for the ChatGPT extension for Visual Studio Code. It provides a chat-style interface for interacting with the ChatGPT model, which is powered by the Python backend.

## Dependencies

The following dependencies are required to run the TypeScript UI:

1. Visual Studio Code
2. TypeScript
3. vscode
4. path
5. net
6. child_process
7. markdown-it

## Installation

1. Install [Visual Studio Code](https://code.visualstudio.com/).
2. Install [TypeScript](https://www.typescriptlang.org/download) globally using npm:

```bash
npm install -g typescript
```

3. Install the required npm packages:

```bash
npm install vscode path net child_process markdown-it
```

## Overview of Functions

- `activate(context: vscode.ExtensionContext)`: This function is called when the extension is activated, and it sets up the extension's functionality.

- `connectToPythonScript(callback: (panel: vscode.WebviewPanel) => void, panel: vscode.WebviewPanel)`: This function connects the TypeScript UI to the Python script via a socket connection.

- `runPythonCode(userInput: string, panel: vscode.WebviewPanel)`: This function sends the user input to the Python script and waits for the response.

- `createChatPanel()`: This function creates the chat panel UI for the extension.

- `deactivate()`: This function is called when the extension is deactivated.

- `startPythonScript()`: This function starts the Python script as a child process.

To run the TypeScript UI, open the extension project in Visual Studio Code and press `F5`. In the new window that loads, press `Ctrl-Shift-P` to bring up the command window. Select 'Start SDK Copilot' from the options, and the chat panel UI will be displayed, allowing you to interact with the chatbot.
Type 'exit' in the chat window to shut down the backend script. 

###Todo

Enhance the frontend to close the UI panel when a user types 'exit' or 'end' in the chat window.