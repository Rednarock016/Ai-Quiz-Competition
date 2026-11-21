const screens = ["screen-start", "screen-loading", "screen-quiz", "screen-result"];

function show(id) {
    screens.forEach((screen) => {
        document.getElementById(screen).classList.toggle("hidden", screen !== id);
    });
}

let selectedDifficulty = "easy";
let quizQuestions = [];
let quizId = "";
let currentIndex = 0;
let timePerQuestion = 30;
let timeleft = 30;
let timerId = null;
let currentScore = 0;
let activeTopic = "";
let answerInProgress = false;

document.querySelectorAll(".diff-btn").forEach((button) => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".diff-btn").forEach((item) => item.classList.remove("active"));
        button.classList.add(".diff-btn .active");
        selectedDifficulty = button.dataset.diff;
    });
});

document.getElementById("start-btn").addEventListener("click", startQuiz);
document.getElementById("play-again-btn").addEventListener("click", () => {
    clearInterval(timerId);
    show("screen-start");
});

async function startQuiz() {
    activeTopic = document.getElementById("topic").value.trim() || "Kolkata";
    show("screen-loading");

    try {
        const response = await fetch("/api/quiz", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic: activeTopic, difficulty: selectedDifficulty, count: 5 }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not create the quiz");

        quizId = data.quiz_id;
        quizQuestions = data.questions;
        timePerQuestion = data.time_per_question || 30;
        currentIndex = 0;
        currentScore = 0;
        answerInProgress = false;
        show("screen-quiz");
        renderQuestion();
    } catch (error) {
        alert(`Error fetching quiz questions: ${error.message}`);
        show("screen-start");
    }
}

function renderQuestion() {
    clearInterval(timerId);
    const question = quizQuestions[currentIndex];
    if (!question) return showResult({ total_score: currentScore, correct_count: 0, total_question: quizQuestions.length });

    const explanation =document.getElementById("answer-explanation");
    explanation.textContent="";
    explanation.classList.add("hidden");

    document.getElementById("question-progress").textContent = `${currentIndex + 1}/${quizQuestions.length}`;
    document.getElementById("quiz-score").textContent = `Score: ${currentScore}`;
    document.getElementById("question-text").textContent = question.question;
    document.getElementById("progress-bar").style.width = `${(currentIndex / quizQuestions.length) * 100}%`;

    const optionsBox = document.getElementById("options-box");
    optionsBox.innerHTML = "";
    question.options.forEach((option, index) => {
        const button = document.createElement("button");
        button.textContent = option;
        button.addEventListener("click", () => submitAnswer(index));
        optionsBox.appendChild(button);
    });

    answerInProgress = false;
    timeleft = timePerQuestion;
    updateTimerUI();
    timerId = setInterval(() => {
        timeleft = Math.max(0, timeleft - 1);
        updateTimerUI();
        if (timeleft === 0) submitAnswer(-1);
    }, 1000);
}

function updateTimerUI() {
    document.getElementById("timer").textContent = timeleft;
}

async function submitAnswer(selectedIndex) {
    if (answerInProgress) return;
    answerInProgress = true;
    clearInterval(timerId);

    const buttons = document.querySelectorAll("#options-box button");
    buttons.forEach((button) => { button.disabled = true; });

    try {
        const response = await fetch("/api/answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                quiz_id: quizId,
                index: currentIndex,
                choice: selectedIndex,
                time_left: timeleft,
            }),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not submit your answer");

        currentScore = result.score;
        document.getElementById("quiz-score").textContent = `Score: ${currentScore}`;
        if (selectedIndex >= 0 && buttons[selectedIndex]) {
            buttons[selectedIndex].classList.add(result.correct ? "correct" : "wrong");
        }
        if (buttons[result.correct_index]) buttons[result.correct_index].classList.add("correct");
        const explanation = document.getElementById("answer-explanation");
        explanation.textContent=result.explanation || "";
        explanation.classList.remove("hidden");

        setTimeout(() => {
            if (result.is_complete) {
                document.getElementById("progress-bar").style.width = "100%";
                showResult(result);
            } else {
                currentIndex += 1;
                renderQuestion();
            }
        }, 1200);
    } catch (error) {
        alert(`Error submitting answer: ${error.message}`);
        buttons.forEach((button) => { button.disabled = false; });
        answerInProgress = false;
        if (timeleft > 0) {
            timerId = setInterval(() => {
                timeleft = Math.max(0, timeleft - 1);
                updateTimerUI();
                if (timeleft === 0) submitAnswer(-1);
            }, 1000);
        }
    }
}

function showResult(result) {
    document.getElementById("final-score").textContent = result.total_score ?? currentScore;
    document.getElementById("result-summary").textContent =
        `${result.correct_count ?? 0} of ${result.total_question ?? quizQuestions.length} correct • ${selectedDifficulty} • ${activeTopic}`;
    show("screen-result");
}
