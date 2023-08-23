# ChatGPT for VS Code Extension - Python Backend

This is the Python backend for the ChatGPT extension for Visual Studio Code. It provides a chat-style interface for interacting with the ChatGPT model. This backend communicates with the extension via a socket. 

READMEs for all Azure SDKs [.NET, Java, JavaScript, Python, Rust] were scraped from GitHub and used for embeddings in a Qdrant vector database, in order to implement a [retrieval-augmented generation pattern](https://techcommunity.microsoft.com/t5/fasttrack-for-azure/grounding-llms/ba-p/3843857). 

The script determines when to send queries to Qdrant by analyzing the user input for language-specific patterns. The chat() function defines regular expressions for different languages (Rust, Python, Java, JavaScript, and .NET). It then checks if the user input matches any of these patterns.

If the user input matches exactly one language pattern, the script proceeds to call the query_qdrant() function with the matched language, user input, and collection name ("AzureSDKs"). This function then generates an embedding for the user input and sends a search request to the Qdrant client with the generated embedding. 

The Qdrant query results are parsed to retrieve the relevant README text and a prompt is constructed with the user query plus README content. The prompt is then passed to the chat model, and the chat response is passed back to the UI via socket. 

The script is using the `text-embedding-ada-002` model for generating embeddings and `gpt-35-turbo` for the chat functionality.

## Dependencies

The following dependencies are required to run the Python backend:

1. Python 3.6 or higher
2. `semantic-kernel==0.2.7.dev0`
3. `qdrant-client`
4. `socket`
5. `re`
6. `asyncio`

## Installation

To install the dependencies, run the following commands:

```bash
pip install semantic-kernel==0.2.7.dev0
pip install qdrant-client
```

## Overview of Functions

- `create_socket()`: This function initializes a socket object, binds it to a specified address and port, and sets it to listen for incoming connections.

- `create_embedding(data)`: This asynchronous function generates embeddings for the given data. It includes retry logic to account for rate limit errors.

- `ask_chatbot(input)`: This asynchronous function generates a response to the user's question from relevant README content using the ChatGPT API.

- `query_qdrant(user_input, collection_name, language)`: This asynchronous function queries the Qdrant storage with the user input, collection name, and language to find relevant READMEs.

- `chat(user_input: str, previous_input)`: This asynchronous function processes the user input, checks for language matches, and calls the `query_qdrant()` function. It handles cases where the user input does not match any language and provides the chatbot answer at the end of each iteration.

- `main()`: This asynchronous function sets up the socket server, listens for incoming connections and user inputs, and calls the `chat()` function to generate responses. It sends the responses back to the VS Code extension through the socket connection.

To run the Python backend, simply execute the script:

```bash
python backend.py
```

Make sure to adjust the deployment, API key, and endpoint values in the script to match your own ChatGPT API settings.
