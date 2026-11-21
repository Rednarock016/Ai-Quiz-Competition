import json
import os
import uuid

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from groq import Groq

load_dotenv()

app = Flask(__name__)
client = Groq(api_key=os.getenv("groq_api_key"))
model = os.getenv("groq_model", "openai/gpt-oss-120b")

DIFFICULTIES = {
    "easy": {"time": 40, "points": 5},
    "medium": {"time": 30, "points": 5},
    "hard": {"time": 20, "points": 5},
}
quizzes = {}


def build_prompt(topic, difficulty, count):
    return f"""Create {count} multiple-choice questions about {topic} at {difficulty} difficulty.
Return only a JSON object with this shape:
{{"questions":[{{"question":"...","options":["A","B","C","D"],"answers_index":0,"explanation":"one short sentence"}}]}}
Every question must have exactly four options and answers_index must be 0, 1, 2, or 3. Make questions clear, appropriate, and factually accurate."""


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/quiz", methods=["POST"])
def create_quiz():
    data = request.get_json(silent=True) or {}
    topic = str(data.get("topic") or "general knowledge").strip()[:80]
    difficulty = data.get("difficulty", "easy")
    if difficulty not in DIFFICULTIES:
        return jsonify(error="Invalid difficulty"), 400
    try:
        count = max(3, min(int(data.get("count", 5)), 15))
    except (TypeError, ValueError):
        return jsonify(error="Count must be a number"), 400

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You generate quiz questions and return strict JSON only."},
                {"role": "user", "content": build_prompt(topic, difficulty, count)},
            ],
            temperature=1.0,
            response_format={"type": "json_object"},
        )
        raw = json.loads(response.choices[0].message.content)
        questions = [
            question for question in raw.get("questions", [])
            if isinstance(question, dict)
            and isinstance(question.get("question"), str)
            and isinstance(question.get("options"), list)
            and len(question["options"]) == 4
            and question.get("answers_index") in (0, 1, 2, 3)
        ][:count]
        if not questions:
            raise ValueError("The AI did not return valid questions")

        quiz_id = uuid.uuid4().hex
        quizzes[quiz_id] = {
            "questions": questions,
            "difficulty": difficulty,
            "answered": set(),
            "score": 0,
            "correct_count": 0,
        }
        return jsonify(
            quiz_id=quiz_id,
            topic=topic,
            difficulty=difficulty,
            time_per_question=DIFFICULTIES[difficulty]["time"],
            questions=[{"question": q["question"], "options": q["options"]} for q in questions],
        )
    except Exception as error:
        app.logger.exception("Could not generate quiz")
        return jsonify(error=f"Could not generate quiz: {error}"), 500


@app.route("/api/answers", methods=["POST"])
def check_answer():
    data = request.get_json(silent=True) or {}
    quiz = quizzes.get(data.get("quiz_id"))
    if quiz is None:
        return jsonify(error="Quiz not found"), 404

    try:
        index = int(data.get("index", -1))
        choice = int(data.get("choice", -1))
        time_left = max(0.0, float(data.get("time_left", 0)))
    except (TypeError, ValueError):
        return jsonify(error="Invalid answer data"), 400

    questions = quiz["questions"]
    if index < 0 or index >= len(questions) or index in quiz["answered"]:
        return jsonify(error="Invalid or repeated question"), 400

    quiz["answered"].add(index)
    question = questions[index]
    rules = DIFFICULTIES[quiz["difficulty"]]
    correct = choice == question["answers_index"]
    points = 0
    if correct:
        bonus = round(rules["points"] * 0.5 * min(time_left / rules["time"], 1))
        points = rules["points"] + bonus
        quiz["score"] += points
        quiz["correct_count"] += 1

    complete = len(quiz["answered"]) == len(questions)
    return jsonify(
        correct=correct,
        correct_index=question["answers_index"],
        explanation=question.get("explanation", ""),
        points=points,
        score=quiz["score"],
        is_complete=complete,
        correct_count=quiz["correct_count"],
        total_question=len(questions),
        total_score=quiz["score"],
    )


if __name__ == "__main__":
    app.run(debug=True)
