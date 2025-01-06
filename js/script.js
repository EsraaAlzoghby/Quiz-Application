let chooseCategory = document.getElementById('chooseCategory');
let chooseDifficulty = document.getElementById('chooseDifficulty');
let numberOfQuestion = document.getElementById('numberOfQuestion');
let buttonStart = document.getElementById('buttonStart');
let formQuiz = document.getElementById('formQuiz');
let dataRow = document.getElementById('dataRow');
let totalQuestion = [];
let myQuiz = {};
let currentQuestionIndex = 0;
let score = 0; 
buttonStart.addEventListener("click", async function () {
    myQuiz = new Quiz(chooseCategory.value, numberOfQuestion.value, chooseDifficulty.value);
    totalQuestion = await myQuiz.getAllQuestion();
    formQuiz.classList.add("d-none");
    console.log(totalQuestion);
    score = 0;  
    currentQuestionIndex = 0;  
    let newQuestion = new questionsApp(currentQuestionIndex);
    newQuestion.displayQuestion();
});
class Quiz {
    constructor(Category, number, difficulty) {
        this.Category = Category;
        this.number = number;
        this.difficulty = difficulty;
        this.score = 0;
    }
    getApi() {
        return `https://opentdb.com/api.php?amount=${this.number}&category=${this.Category}&difficulty=${this.difficulty}`;
    }
    async getAllQuestion() {
        try {
            let response = await fetch(this.getApi());
            if (response.status === 429) {
                throw new Error("Too Many Requests. Please wait before retrying.");
            }
            let data = await response.json();
            return data.results || [];  
        } catch (error) {
            if (error.message === "Too Many Requests. Please wait before retrying.") {
                console.log("Too many requests. Waiting 5 seconds before retrying...");
                await this.wait(5000); 
                return await this.getAllQuestion(); 
            } else {
                console.error("Failed to fetch questions:", error);
                return [];
            }
        }
    }
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

class questionsApp {
    constructor(i) {
        this.index = i;
        this.difficulty = totalQuestion[i].difficulty;
        this.Category = totalQuestion[i].category;
        this.question = totalQuestion[i].question;
        this.correctAnswer = totalQuestion[i].correct_answer;
        this.incorrectAnswers = totalQuestion[i].incorrect_answers;
        this.AllAnswers = this.getAllAnswers();
    }

    displayQuestion() {
        dataRow.innerHTML = `
        <div class="stats m-auto mb-4">
            <button id="questionCount" class="mx-1 px-2">${this.index + 1} of ${totalQuestion.length} Questions</button>
            <button id="categoryAndScore1" class="mx-1 px-3">Category: ${this.Category}</button>
            <button id="categoryAndScore" class="mx-1 px-3"> Score: ${score}</button>
        </div>

        <!-- Question Card -->
        <div class="card m-auto">
            <h4 id="question-text">${this.question}</h4>
            <div class="answers">
                ${this.AllAnswers.map((answer, i) => 
                    `<button class="answer-btn" onclick="checkAnswer('${answer}')">${String.fromCharCode(65 + i)}. ${answer}</button>`
                ).join('')}
            </div>
            <button class="next-btn" onclick="nextQuestion()">Next Question</button>
        </div>`;
    }

    getAllAnswers() {
        let totalAnswer = [];
        totalAnswer = [...this.incorrectAnswers, this.correctAnswer].sort();
        return totalAnswer;
    }
}

function checkAnswer(selectedAnswer) {
    if (selectedAnswer === totalQuestion[currentQuestionIndex].correct_answer) {
        score++;
    }
    document.querySelectorAll('.answer-btn').forEach(button => {
        button.disabled = true;  
        if (button.textContent.includes(selectedAnswer)) {
            button.style.backgroundColor = '#28a745'; 
        } else if (button.textContent.includes(totalQuestion[currentQuestionIndex].correct_answer)) {
            button.style.backgroundColor = '#dc3545';  
        }
    });
    updateScore();
}

function updateScore() {
    let questionCount = document.getElementById('questionCount');
    questionCount.innerHTML = `${currentQuestionIndex + 1} of ${totalQuestion.length} Questions`;
    let scoreBtn = document.getElementById('categoryAndScore');
    scoreBtn.innerHTML = `Score: ${score}`;
}
function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < totalQuestion.length) {
        let newQuestion = new questionsApp(currentQuestionIndex);
        newQuestion.displayQuestion();
    } else {
        // Finish quiz logic
        displayResult();
    }
}
function displayResult() {
    dataRow.innerHTML = `
        <div class="stats m-auto mb-4">
            <button id="questionCountFinal" class="mx-1">You finished the quiz!</button>
            <button id="categoryAndScoreFinal" class="mx-1 ">Your Score: ${score} out of ${totalQuestion.length}</button>
        </div>

        <!-- Result Card -->
        <div class="card m-auto">
            <h4 id="result-text">${score === totalQuestion.length ? "Congratulations! You got all the answers correct!" : "Quiz Finished!"}</h4>
            <button class="try-again-btn" onclick="restartQuiz()">Try Again</button>
        </div>`;
}
function restartQuiz() {
    window.location.reload(); 
}
