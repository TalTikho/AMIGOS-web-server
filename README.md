# 🚀 AMIGOS-web-server 🚀

This is the backend server for the **AMIGOS** chat application.

---

## 👥 Authors
- 👨‍💻 [Tal Tikhonov](https://github.com/TalTikho)
- 👨‍💻 [Kfir Eitan](https://github.com/Kfir15)

---

## 🔗 Links
- [🧩 Amigos Web Repository](https://github.com/TalTikho/AMIGOS-Web) 
- 🗺️ [UML Diagram (Live View)](https://tinyurl.com/4xwxzh95)

---

## 🧰 Tech Stack

- 🟩 Node.js + Express
- 🐳 Docker
- 🍃 MongoDB
- 📬 Postman (for API testing)

---

## ✨ Features

- User authentication with JWT 🔐
- Media file upload support 📎
- Notifications system 🔔
- Structured modular architecture 🧱
- Dockerized deployment 🐳

---

## 🛠️ How to run

### 🐳 Docker Setup
1. Make sure that you have **Docker Desktop** and **MongoDB** on your machine, and clone the repository. Then:
    ```bash
   git clone https://github.com/TalTikho/AMIGOS-web-server
   ```
2. 🔌 Run **MongoDB server**.
3. 📝 Create an **environment file** in the `/config` directory with the following variables:
   
   | 🏷️ Variable       | 📄 Description                               | 🧪 Example                             |
   |----------------|-------------------------------------------|-------------------------------------|
   | `MONGODB_URI`  | MongoDB connection string                 | `mongodb://localhost:27017/DB_name` |
   | `PORT`         | Port for the server to run on             | `3000`                              |
   | `NODE_ENV`     | Node environment (e.g., `local`, `dev`)   | `local`                             |
   | `JWT_SECRET`   | Secret key for JWT authentication         | `your_secret_key_here`              |
   
   > ✅ **NOTE**: An example env file is available at `config/.env.example` for reference.

4. ▶️ Run with **Docker** using the following command:   
    ```bash
   docker-compose --env-file ./config/.env.example up app
   ```
   > ⚠️ IMPORTANT: Make sure to replace `.env.example` with the env file you created.

Now the server will run and you can start send requests. 🚀

---

## 📬 Postman Collections

Test and explore API features using the following Postman collections:

| 📂 Feature         | 🔗 Collection Link |
|-------------------|--------------------|
| 💬 Chats           | [View Collection](https://www.postman.com/taltikhnoov/workspace/amigos-workspace/collection/43664845-96b2f283-d666-47c8-b73c-0aeea439b6f4?action=share&creator=43664845) |
| 📎 Media           | [View Collection](https://www.postman.com/taltikhnoov/workspace/amigos-workspace/collection/43664845-ad6b3627-22af-47fa-9950-962fa6a44f3f?action=share&creator=43664845) |
| 📨 Messages        | [View Collection](https://www.postman.com/taltikhnoov/workspace/amigos-workspace/collection/43664845-c29b75bb-2c15-4cbb-b028-899273f0222a?action=share&creator=43664845) |
| 🔔 Notifications   | [View Collection](https://www.postman.com/taltikhnoov/workspace/amigos-workspace/collection/43664845-8eaea4c7-e654-4cf0-bbcf-fba7ef374acf?action=share&creator=43664845) |
| 🔐 Tokens / Auth   | [View Collection](https://www.postman.com/taltikhnoov/workspace/amigos-workspace/collection/43664891-6edb232d-4f80-407d-b112-c76896fe1ce8?action=share&creator=43664845) |
| 👤 Users           | [View Collection](https://www.postman.com/taltikhnoov/workspace/amigos-workspace/collection/43664891-f8cd5299-ec22-4a03-a0ce-ed755bfcffdb?action=share&creator=43664845) |


---

## 🧭 UML

<details>
<summary> <strong>📌Click to expand UML explanation 📌</strong></summary>

#### 🧱 Chat Application Architecture:
This project implements a chat application following a clean architecture design pattern. The key components of the system are organized into distinct layers to separate concerns and enhance maintainability.

#### 🗂️ Overview
The architecture consists of the following components:

- **Models** :
Core data structures that represent the application's entities.
- **Services** : 
The business logic layer that interacts with models to process data.
- **Controllers**:
Handle incoming HTTP requests and coordinate with services to generate responses.
- **Routes**:
Define API endpoints and link them to the appropriate controllers.
- **Utilities** :
Helper functions that are used across the application to avoid code duplication.

---

#### 🧩 Key Components
1. **Models** :
    The models represent the primary data structures in the application, including:

   - 👤 `User`: Represents a user in the system. Users can have multiple chats, messages, media uploads, and notifications.

   - 💬 `Chat`: Represents a chat session, which contains multiple messages and can have multiple members.

   - 📨 `Message`: Represents a message within a chat.

   - 📎 `Media`: Represents media (images, files, etc.) that can be attached to messages.

   - 🔔 `Notification`: Represents notifications sent to users for various events.

2. **Services**
   - Services implement the business logic of the application. They interact directly with models to retrieve and manipulate data. Services are invoked by controllers to process incoming requests.

3. **Controllers**
   - Controllers handle the incoming HTTP requests, perform any necessary processing, and interact with the services to obtain or modify data. After processing, controllers send the appropriate response to the client.

4. **Routes**
   - Routes define the API endpoints and associate them with specific controller functions. Routes are the entry points for all HTTP requests in the application.

5. **Utilities**
   - Utilities are helper functions used across various components of the application. These functions are designed to reduce redundancy and improve code maintainability.

---

##### 🔗 Relationship
- **Users** ➡️ Have multiple Chats, Messages, Media, Notifications
- **Chats** ➡️ Have multiple Messages and Members
- **Messages** ➡️ May include Media
- **Services**➡️ Contain the business logic that interacts with the Models.
- **Controllers** ➡️ Use Services ➡️ Use Models
- **Routes** ➡️ Direct requests to Controllers

📎[Full view of the diagram](https://tinyurl.com/4xwxzh95)
</details>


![Architecture Diagram](https://www.mermaidchart.com/raw/b333dae5-01f2-4a1b-a0d8-7cc39bbe65b9?theme=dark&version=v0.1&format=svg)

---






