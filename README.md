# AI-Powered Learning Platform

A full-stack learning platform designed to connect students and teachers, organize learning resources, track student progress, and provide AI-assisted learning support.

## Features

### Student
- Register and log in to the platform.
- Browse courses and access enrolled courses.
- View lessons and learning materials.
- Track learning progress.
- Take quizzes and review quiz attempts.
- Ask questions through the AI learning assistant.

### Teacher
- Create and manage courses and lessons.
- Upload lesson videos and learning materials.
- Support student learning through structured course content.

### Admin
- Manage platform users and learning content.
- Support platform administration and oversight.

### AI-Assisted Learning
- Provide an AI-assisted interface for student questions.
- Designed to support answers based on learning resources.

## Tech Stack

**Frontend**
- React
- Vite
- Material UI

**Backend**
- Python
- Django
- Django REST Framework
- JWT authentication

**Database**
- SQLite for local development

## Project Structure

```text
ai-powered-learning-platform/
├── config/          # Django project configuration
├── users/           # User and authentication features
├── courses/         # Courses, lessons, and related features
├── frontend/        # React frontend
├── manage.py
├── requirements.txt
├── .gitignore
└── README.md
```

*The structure above is illustrative. Adjust it to match the files in your repository.*

## Run Locally

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd ai-powered-learning-platform
```

### 2. Set up the backend

Create and activate a Python virtual environment, then install the dependencies:

```bash
python -m venv venv
```

On Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

The Django development server will normally run at `http://127.0.0.1:8000/`.

### 3. Set up the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local frontend URL in the terminal, usually `http://localhost:5173/`.

## Security Notes

- Do not commit passwords, secret keys, API keys, or private environment files.
- Configure production environment variables before deployment.
- Use an appropriate production database and persistent storage for uploaded videos and documents.

## Project Status

Under development — preparing for deployment.

## Author

Student developer — Artificial Intelligence and Machine Learning
