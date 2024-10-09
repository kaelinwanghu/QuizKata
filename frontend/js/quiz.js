document
  .getElementById("quiz-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the form from submitting the traditional way

    const amount = parseInt(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const difficulty = document.getElementById("difficulty").value;
    const type = document.getElementById("type").value;

    const query = `
        query GenerateQuiz($input: QuizInput!) {
            generateQuiz(input: $input) {
                questions {
                    text
                    answers {
                        text
                        isCorrect
                    }
                    type
                }
            }
        }
    `;

    const variables = {
      input: {
        amount: amount,
        category: category,
        difficulty: difficulty,
        type: type,
      },
    };

    try {
      const response = await fetch("http://localhost:4000/graphql", {
        // Use your backend's URL here
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          variables: variables,
        }),
      });

      const data = await response.json();
      displayQuiz(data.data.generateQuiz.questions);
    } catch (error) {
      console.error("Error fetching the quiz:", error);
      document.getElementById("quiz-output").innerHTML =
        "<p>Error fetching the quiz.</p>";
    }
  });

let score = 0;
let answeredQuestions = 0;
let totalQuestions = 0;
let startTime, endTime;

// Shuffle because other wise the first answer is always front
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function displayQuiz(questions) {
  const outputDiv = document.getElementById("quiz-output");
  outputDiv.innerHTML = ""; // Clear previous output
  score = 0; // Reset score
  answeredQuestions = 0; // Reset answered questions
  totalQuestions = questions.length;

  startTime = new Date();

  if (!questions || questions.length === 0) {
    outputDiv.innerHTML = "<p>No quiz data returned.</p>";
    return;
  }

  questions.forEach((question, index) => {
    const questionElement = document.createElement("div");
    questionElement.classList.add("question-container"); // Spacing class
    questionElement.innerHTML = `<h3>Question ${index + 1}: ${
      question.text
    }</h3>`;

    const shuffledAnswers = shuffleArray([...question.answers]);

    // Create clickable answers
    shuffledAnswers.forEach((answer) => {
      const answerElement = document.createElement("p");
      answerElement.innerText = decodeHTMLEntities(answer.text);
      answerElement.classList.add("answer");
      answerElement.style.cursor = "pointer"; // Make it clickable

      answerElement.addEventListener("click", function () {
        // Check if the answer is correct
        if (answer.isCorrect) {
          answerElement.classList.add("correct");
          score++; // Increase the score
        } else {
          answerElement.classList.add("incorrect");
        }

        // Disable clicking further answers for this question
        const allAnswers = answerElement.parentNode.querySelectorAll("p");
        allAnswers.forEach((ans) => (ans.style.pointerEvents = "none"));

        answeredQuestions++;

        // If all questions have been answered, stop the timer and show score
        if (answeredQuestions === totalQuestions) {
          endTime = new Date(); // Stop the timer
          const timeTaken = Math.round((endTime - startTime) / 1000); // Time in seconds
          displayScore(timeTaken);
        }
      });

      questionElement.appendChild(answerElement);
    });

    outputDiv.appendChild(questionElement);
  });
}

function decodeHTMLEntities(text) {
  let element = document.createElement("div");
  if (text) {
    element.innerHTML = text;
  }
  return element.innerText || element.textContent;
}

function displayScore(timeTaken) {
  const outputDiv = document.getElementById("quiz-output");
  const scoreElement = document.createElement("div");

  scoreElement.innerHTML = `<h2>Your Score: ${score} out of ${totalQuestions}</h2>
                              <p>Time Taken: ${timeTaken} seconds</p>`;

  // Create button to submit score to leaderboard
  const submitButton = document.createElement("button");
  submitButton.innerText = "Submit Score to Leaderboard";
  submitButton.addEventListener("click", function () {
    submitScoreToLeaderboard(timeTaken);
  });

  outputDiv.appendChild(scoreElement);
  outputDiv.appendChild(submitButton);
}

function submitScoreToLeaderboard(timeTaken) {
  const username = prompt("Enter your username to submit your score:");

  if (!username) {
    alert("Username is required to submit your score.");
    return;
  }

  const quizMetadata = {
    amount: totalQuestions,
    category: document.getElementById("category").value,
    difficulty: document.getElementById("difficulty").value,
    type: document.getElementById("type").value,
  };

  // First, check if the user exists
  const checkUserQuery = `
      query GetUser($username: String!) {
        user(username: $username) {
          id
        }
      }
    `;

  const createUserMutation = `
      mutation CreateUser($username: String!) {
        createUser(username: $username) {
          id
        }
      }
    `;

  const submitScoreMutation = `
      mutation SubmitScore($username: String!, $quizData: QuizMetadata!, $score: Int!, $time: Float!) {
        submitScore(username: $username, quizData: $quizData, score: $score, time: $time) {
          success
          message
        }
      }
    `;

  // First, check if the user exists
  fetch("http://localhost:4000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: checkUserQuery,
      variables: { username },
    }),
  })
    .then((response) => response.json())
    .then((responseData) => {
      // If user doesn't exist, create the user
      if (!responseData.data.user) {
        return fetch("http://localhost:4000/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: createUserMutation,
            variables: { username },
          }),
        }).then((res) => res.json());
      }
    })
    .then(() => {
      // Now submit the score
      return fetch("http://localhost:4000/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: submitScoreMutation,
          variables: {
            username: username,
            quizData: quizMetadata,
            score: score,
            time: timeTaken, // Submit time taken
          },
        }),
      });
    })
    .then((response) => response.json())
    .then((responseData) => {
      if (responseData.data.submitScore.success) {
        alert("Score submitted successfully!");
      } else {
        alert(
          "Error submitting score: " + responseData.data.submitScore.message
        );
      }
    })
    .catch((error) => {
      console.error("Error submitting score:", error);
      alert("There was an error submitting your score.");
    });
}
