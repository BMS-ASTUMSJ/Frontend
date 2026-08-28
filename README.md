# ASTU MSJ Bootcamp Management System


A full-stack web application for managing an ASTU MSJ bootcamp, covering admin, mentor, and student workflows. The platform supports applicant management, batch coordination, attendance tracking, progress monitoring, submissions, announcements, AI-assisted documentation, and role-based access.


## Project Overview


This project is split into two main parts:


- Backend: Node.js + Express.js + MongoDB
- Frontend: React + Vite + Tailwind CSS


It is designed to support multiple user roles:


- Admin
- Mentor
- Student


## Features


### Admin


- Manage applicants and users
- Create and manage batches and teams
- Monitor mentoring and academic progress
- Review attendance and session records
- Publish announcements
- Manage assignments and submissions
- View AI-generated documentation and assistant tools


### Mentor


- Track assigned students and teams
- Review student attendance and progress
- Manage mentorship assignments and submission review
- Access mentor-specific announcements and batch history


### Student


- View personal dashboard and progress
- Track attendance and assignment status
- Access announcements and submissions
- Update profile information


### Additional Features


- JWT authentication and refresh-token handling
- Role-based protected routes
- Google OAuth login support
- Cloudinary-based media handling
- Email notifications
- AI-powered document retrieval and chat support


---


## Tech Stack


### Backend


- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Cloudinary
- Nodemailer
- Multer
- CORS / Cookie Parser
- Google OAuth
- Gemini and Voyage AI integrations


### Frontend


- React
- Vite
- React Router
- Axios
- Tailwind CSS
- Framer Motion
- React Hot Toast
- Lucide Icons


---


## Project Structure


```bash
BMS ATSUMSJ/
├── Backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── Frontend/
│   ├── src/
│   ├── public/
│   ├── .env
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── README.md
└── .gitignore
```


---


## Prerequisites


Before running the project, ensure you have the following installed:


- Node.js (v18 or later recommended)
- npm or yarn
- MongoDB instance or MongoDB Atlas connection string
- Cloudinary account
- Email SMTP credentials
- Google OAuth Client ID
- Gemini API key and/or Voyage API key


---


## Environment Setup


### 1) Backend Environment


Create a `.env` file inside the `Backend` folder:


```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173


MONGO_URI=mongodb://localhost:27017/astu-msj


JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret


GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret


CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret


EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=your_email@example.com


GEMINI_API_KEY=your_gemini_api_key
VOYAGE_API_KEY=your_voyage_api_key
```


### 2) Frontend Environment


Create a `.env` file inside the `Frontend` folder:


```env
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```


> The frontend uses the Google OAuth provider and sends authenticated requests to the backend API at `http://localhost:5000/api`.


---


## Installation


### Backend


```bash
cd Backend
npm install
```


### Frontend


```bash
cd Frontend
npm install
```


---


## Running the Project


### Start the backend


```bash
cd Backend
npm run dev
```


This starts the Express server, usually on:


```bash
http://localhost:5000
```


### Start the frontend


```bash
cd Frontend
npm run dev
```


This starts the React app, usually on:


```bash
http://localhost:5173
```


---


## Production Build


### Frontend build


```bash
cd Frontend
npm run build
```


### Backend production server


```bash
cd Backend
npm start
```


---


## API Notes


The backend exposes a REST API under:


```bash
http://localhost:5000/api
```


Main API groups include:


- `/api/auth`
- `/api/users`
- `/api/batches`
- `/api/applicants`
- `/api/teams`
- `/api/announcements`
- `/api/assignments`
- `/api/submissions`
- `/api/attendance`
- `/api/progress`
- `/api/sessions`
- `/api/chat`
- `/api/rag`
- `/api/retrieval`
- `/api/documents`


---


## Authentication and Roles


The app uses a role-based access model:


- `admin`
- `mentor`
- `student`


Protected routes are enforced in the frontend and the backend middleware to restrict access based on the logged-in user role.


---


## Common Development Workflow


1. Start MongoDB
2. Set your environment variables
3. Run backend in development mode
4. Run frontend in development mode
5. Open the frontend in your browser
6. Log in as admin, mentor, or student depending on your seeded or registered account


---


## Scripts


### Backend


```bash
npm run dev   # runs the server with nodemon
npm start     # runs the server in production mode
```


### Frontend


```bash
npm run dev    # starts the Vite dev server
npm run build  # builds the frontend for production
npm run preview # previews the production build
npm run lint   # runs ESLint checks
```


---


## Notes


- The backend serves uploaded files from the `uploads` directory.
- The frontend is configured to talk to the backend via `http://localhost:5000/api`.
- Make sure your backend and frontend `.env` files are properly configured before running the app.
- This project may require valid external API credentials for file processing, AI features, and email delivery.


---


## License


This project is currently for internal or educational use unless otherwise specified by the project owner.


---


## Contributors




```bash
Project Owner: Quantum Queens TEAM
```


---


## Support


For setup issues or environment problems, make sure to verify:


- MongoDB connection string
- JWT secrets are set
- Cloudinary credentials are valid
- Google OAuth Client ID is configured in both backend and frontend
- API keys for Gemini/Voyage are available


If needed, you can also update the CORS settings in the backend if your frontend runs on a different port or domain.


---


## Screenshots


 ## --Landing Page--

<img width="1280" height="610" alt="image" src="https://github.com/user-attachments/assets/0ab93c8a-0c99-46d4-b290-b48b6594a575" />


 ## --Login Page--

https://drive.google.com/file/d/1cDThwrF59XrEVoHh_lZh8GdFOXap2YCX/view?usp=sharing

 ## --Admin Dashboard--
 
https://drive.google.com/file/d/1HRu7scZa78AHJIHnLvMY2MpPetblP-28/view?usp=sharing


 ## --Responsive Mentor Side--

https://drive.google.com/file/d/1nlvUb4w-Y_wtp5vGmSX1Ghall0gOS2ai/view?usp=sharing

 ## --Responsive Dark-mode Student Dashboard--

https://drive.google.com/file/d/1b3I4AxPEVwAL7QTJtI1wo1x1cNkYAYTH/view?usp=sharing

 ## --Mentor Dashboard--

 https://drive.google.com/file/d/1FueQkM1C8IRBsAcNkn5IXcbLZ46aym--/view?usp=sharing

