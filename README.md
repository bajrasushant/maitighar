# Maitighar: Smart Grievance Redressal System

Maitighar is a web application designed to revolutionize how residents communicate with their local authorities. It provides a platform for efficient issue reporting, community suggestions, and administrative oversight.

## Project Structure

```
/maitighar
  /maitighar-backend
  /maitighar-frontend
```

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js
- npm
- MongoDB or MongoAtlas

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/maitighar.git
   cd maitighar
   ```

2. Set up the backend:

   ```
   cd maitighar-backend
   npm install
   ```

3. Set up the frontend:

   ```
   cd ../maitighar-frontend
   npm install
   ```

4. Create a `.env` file in the `maitighar-backend` directory and add your MongoDB connection string, port for the backend and JWT secret similarly as .env.example file:

   ```
   MONGODB_URI=your_mongodb_connection_string
   SECRET=your_secret_for_jwt
   PORT=3003
   ```

## Usage

1. Start the backend server:

   ```
   cd maitighar-backend
   npm run start
   ```

2. In a new terminal, start the frontend development server:

   ```
   cd maitighar-frontend
   npm run start
   ```

3. Open your browser and navigate to `http://localhost:5173` to view the application.

## Features

- User registration and authentication
- Map visualization for issue reporting
- Upvoting mechanism for community engagement
- Admin dashboard for local authorities

<!--## Contributing-->
<!---->
<!--We welcome contributions to Maitighar! Please read our contributing guidelines before submitting pull requests.-->
<!---->
<!--## License-->
<!---->
<!--This project is licensed under the MIT License - see the LICENSE file for details.-->

## Acknowledgments

- This project was developed as part of the 7th semester project for BSc. CSIT at Tribhuvan University, Institute of Science and Technology, Prime College.

## Todos

- ML-powered sentiment analysis and text summarization
