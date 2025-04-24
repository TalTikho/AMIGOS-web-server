# AMIGOS-web-server

This is the backend server for the **AMIGOS** chat application.

## Authors
- [Tal Tikhonov](https://github.com/TalTikho)
- [Kfir Eitan](https://github.com/Kfir15)

## Links
- [Frontend Repository:]() **NEED TO ADD URL**
- Postman Workspace:[View Endpoints and Parameters](https://taltikhnoov.postman.co/workspace/Amigos-Workspace~8ee052b0-a3aa-4ddb-85a9-b8cd78a2d5f7/overview)

## How to run
1. Make sure that you have **Docker Desktop** and **MongoDB** on your machine, and clone the repository.
    ```
   git clone https://github.com/TalTikho/AMIGOS-web-server
   ```
2. Run **MongoDB server**.
3. Create an **environment file** in the `/config` directory with the following variables:
   
   | Variable       | Description                               | Example                             |
   |----------------|-------------------------------------------|-------------------------------------|
   | `MONGODB_URI`  | MongoDB connection string                 | `mongodb://localhost:27017/DB_name` |
   | `PORT`         | Port for the server to run on             | `3000`                              |
   | `NODE_ENV`     | Node environment (e.g., `local`, `dev`)   | `local`                             |
   | `JWT_SECRET`   | Secret key for JWT authentication         | `your_secret_key_here`              |
   > NOTE: An example env file is available at `config/.env.example` for reference.
4. Run with **Docker** using the next command -   
    ```
   docker-compose --env-file ./config/.env.example up app
   ```
   > IMPORTANT: Make sure to replace `.env.example` with the env file you created.

Now the server will run and you can start send requests.

