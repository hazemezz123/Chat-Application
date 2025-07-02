# Real-Time Chat Application

This is a full-stack real-time chat application built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO. It includes user authentication, profile updates, and real-time messaging.

## Tech Stack

### Frontend

*   **Framework:** React
*   **Routing:** React Router
*   **State Management:** Zustand
*   **HTTP Client:** Axios
*   **Styling:** Tailwind CSS with DaisyUI
*   **UI Components:** Lucide React for icons
*   **Build Tool:** Vite

### Backend

*   **Framework:** Express
*   **Database:** MongoDB with Mongoose
*   **Real-time Communication:** Socket.IO
*   **Authentication:** JSON Web Tokens (JWT) and bcryptjs for password hashing
*   **Image Uploads:** Cloudinary
*   **Middleware:** CORS, cookie-parser

## Key Features

*   User authentication (signup, login, logout)
*   Persistent user sessions with JWT
*   Profile updates, including avatar uploads
*   Real-time messaging with Socket.IO
*   View online users in the sidebar
*   Protected routes for authenticated users

## API Endpoints

### Authentication (`/api/auth`)

*   `POST /signup`: Register a new user.
*   `POST /login`: Log in an existing user.
*   `POST /logout`: Log out the current user.
*   `PUT /update-profile`: Update the user's profile information.
*   `GET /check`: Check the current user's authentication status.

### Messages (`/api/messages`)

*   `GET /users`: Get a list of users for the sidebar.
*   `GET /:id`: Get messages for a specific conversation.
*   `POST /send/:id`: Send a message to a specific user.

## Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/chat-application.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd chat-application
    ```
3.  Install server dependencies:
    ```bash
    cd server
    npm install
    ```
4.  Install client dependencies:
    ```bash
    cd ../client
    npm install
    ```
5.  Create a `.env` file in the `server` directory and add the following environment variables:
    ```
    PORT=5000
    MONGO_URI=<your_mongodb_uri>
    JWT_SECRET=<your_jwt_secret>
    CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
    CLOUDINARY_API_KEY=<your_cloudinary_api_key>
    CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
    ```

## Usage

1.  Start the backend and frontend servers concurrently from the root directory:
    ```bash
    npm run dev
    ```
2.  Open your browser and navigate to `http://localhost:5173`

## License

This project is licensed under the MIT License.

## Author

[Your Name](https://github.com/your-username)