# Azure SDK Copilot Extension for VS Code (Proof-of-Concept)

This project provides a Visual Studio Code extension for interacting with an Azure OpenAI GPT model in a chat-style interface. It consists of a TypeScript UI and a Python backend that communicate with each other via a socket. 

The [Python backend](https://github.com/mario-guerra/azsdkchatbot/tree/main/python#readme) implements a chat connection with Azure OpenAI models using connectors from the [Semantic Kernel SDK](https://github.com/microsoft/semantic-kernel). It's currently designed to answer questions by querying a Qdrant vector database embedded with READMEs scraped from Azure SDK GitHub repos. 

The [TypeScript front end](https://github.com/mario-guerra/azsdkchatbot/blob/main/src/README.md) implements a VS Code webpanel with a chat interface UI that can be used to interact with the chat backend.

This is strictly a proof-of-concept demonstrating the use of retrieval-augmented generation (RAG) for surfacing content from our GitHub repos.

## Dependencies

### Python Backend

The following dependencies are required to run the Python backend:

1. Python 3.6 or higher
2. `semantic-kernel==0.2.7.dev0`
3. `qdrant-client`
4. `socket`
5. `re`
6. `asyncio`

### TypeScript UI

The following dependencies are required to run the TypeScript UI:

1. Visual Studio Code
2. TypeScript
3. vscode
4. path
5. net
6. child_process
7. markdown-it

## Installation

### Python Backend

To install the dependencies for the Python backend, run the following commands:

```bash
pip install semantic-kernel==0.2.7.dev0
pip install qdrant-client
```

### TypeScript UI

1. Install [Visual Studio Code](https://code.visualstudio.com/).
2. Install [TypeScript](https://www.typescriptlang.org/download) globally using npm:

```bash
npm install -g typescript
```

3. Install the required npm packages:

```bash
npm install vscode path net child_process markdown-it
```

## Running the Extension

To run the TypeScript UI, open the extension project in Visual Studio Code and press `F5`. In the new window that loads, press `Ctrl-Shift-P` to bring up the command window. Select 'Start SDK Copilot' from the options, and the chat panel UI will be displayed, allowing you to interact with the chatbot.

## Overview of Functions

### Python Backend

- `create_socket()`: This function initializes a socket object, binds it to a specified address and port, and sets it to listen for incoming connections.

- `create_embedding(data)`: This asynchronous function generates embeddings for the given data. It includes retry logic to account for rate limit errors.

- `ask_chatbot(input)`: This asynchronous function generates a response to the user's question from relevant README content using the ChatGPT API.

- `query_qdrant(user_input, collection_name, language)`: This asynchronous function queries the Qdrant storage with the user input, collection name, and language to find relevant READMEs.

- `chat(user_input: str, previous_input)`: This asynchronous function processes the user input, checks for language matches, and calls the `query_qdrant()` function. It handles cases where the user input does not match any language and provides the chatbot answer at the end of each iteration.

- `main()`: This asynchronous function sets up the socket server, listens for incoming connections and user inputs, and calls the `chat()` function to generate responses. It sends the responses back to the VS Code extension through the socket connection.

### TypeScript UI

- `activate(context: vscode.ExtensionContext)`: This function is called when the extension is activated, and it sets up the extension's functionality.

- `connectToPythonScript(callback: (panel: vscode.WebviewPanel) => void, panel: vscode.WebviewPanel)`: This function connects the TypeScript UI to the Python script via a socket connection.

- `runPythonCode(userInput: string, panel: vscode.WebviewPanel)`: This function sends the user input to the Python script and waits for the response.

- `createChatPanel()`: This function creates the chat panel UI for the extension.

- `deactivate()`: This function is called when the extension is deactivated.

- `startPythonScript()`: This function starts the Python script as a child process.

## Usage

Once you have installed the dependencies and set up the extension, you can start using the ChatGPT extension for Visual Studio Code. Follow these steps to interact with the chatbot:

1. Open the extension project in Visual Studio Code and press `F5`. A new window will load with the extension activated.
2. Press `Ctrl-Shift-P` to bring up the command window.
3. Select 'Start SDK Copilot' from the options. The chat panel UI will be displayed.
4. Type your questions or messages in the input field and press 'Enter' or click the 'Send' button to send them to the chatbot.
5. Use '/\<language\>' triggers in your question to trigger a query into the backing Qdrant db memory store. Supported languages are: [`/rust`, `/net`, `/javascript`, `/java`]
      Example query: "/rust sdk for service bus"
6. The chatbot will respond with relevant answers, and you can continue the conversation by asking follow-up questions or entering new queries.

The ChatGPT extension is designed to provide information about Azure SDKs and can answer questions based on the context provided in the prompts. It prioritizes content from the prompts and falls back on its own knowledge only when there is no relevant information in the prompt. The chatbot provides concise and clear answers, formatted using markdown syntax for better readability.
