# AI Quiz Competition

 An interactive, real-time AI-powered quiz application that generates unique multiple-choice trivia questions on any topic in seconds, powered by Flask and Groq Cloud LLM inference.

[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0+-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Groq](https://img.shields.io/badge/Groq-Cloud%20LLM-f55036?style=for-the-badge&logo=openai&logoColor=white)](https://groq.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

---

## Features

- **Dynamic AI Generation**: Type any topic (e.g., *Quantum Computing*, *IPL Cricket*, *World History*, *Python*) and receive fresh, custom-crafted questions instantly.
- **Adjustable Difficulty**:
  - **Easy**: 40 seconds per question
  - **Medium**: 30 seconds per question
  - **Hard**: 20 seconds per question
- **Speed-Bonus Scoring**: Earn extra points for answering quickly before the timer runs out.
- **Instant Explanations**: Immediate feedback with correct answer highlights and concise AI-written explanations.
- **Clean & Responsive UI**: Smooth transitions, progress indicator, countdown timers, and end-of-game performance summaries.

---

## Tech Stack

- **Backend**: Python, [Flask](https://flask.palletsprojects.com/)
- **AI Inference**: [Groq Cloud API](https://console.groq.com/) (Fast LLM generation)
- **Frontend**: HTML5, Modern CSS3, Vanilla JavaScript
- **Environment Management**: `python-dotenv`

---

## Project Structure

```text
AI-QUIZ-COMP/
├── static/
│   ├── script.js        # Quiz game logic, timer & API requests
│   └── style.css        # Clean, modern card-based styling
├── templates/
│   └── index.html       # Single-page interface
├── .env.example         # Environment template for API keys
├── .gitignore           # Prevents committing secrets & virtualenv
├── app.py               # Flask backend & Groq API integration
├── requirements.txt     # Python dependencies
└── README.md            # Project documentation
```

---

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Rednarock016/Ai-Quiz-Competition.git
cd Ai-Quiz-Competition
```

### 2. Create and Activate a Virtual Environment
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to a new `.env` file:
```bash
cp .env.example .env
```
Open `.env` and fill in your Groq API key:
```env
groq_api_key=your_groq_api_key_here
groq_model=llama-3.3-70b-versatile
```
*(Get your free API key at [console.groq.com](https://console.groq.com/))*

### 5. Run the Application
```bash
python app.py
```
Open your browser and navigate to:
```
http://127.0.0.1:5000
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Serves the main quiz UI |
| `POST` | `/api/quiz` | Generates a new quiz set for a given topic & difficulty |
| `POST` | `/api/answers` | Validates chosen answer, calculates score & speed bonus |

---

## License

This project is licensed under the MIT License - feel free to use and modify for personal or commercial projects.
