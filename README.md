# alx-files_manager
## Description
**alx-files_manager** is a file management API built with Node.js and Express. It provides endpoints to upload, download, and manage files.

## Features
- User authentication
- File upload and download
- File listing and deletion
- Folder creation and management

## Installation
1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/alx-files_manager.git
    ```
2. Navigate to the project directory:
    ```sh
    cd alx-files_manager
    ```
3. Install dependencies:
    ```sh
    npm install
    ```

## Usage
1. Start the server:
    ```sh
    npm run start-server
    ```
2. Access the API at `http://localhost:5000`.

## Endpoints
- `POST /users` - Create a new user
- `POST /auth` - Authenticate a user
- `POST /files` - Upload a file
- `GET /files/:id` - Download a file
- `GET /files` - List all files
- `DELETE /files/:id` - Delete a file

## Contributing
Contributions are welcome! Please open an issue or submit a pull request.

## License
This project is licensed under the MIT License.
