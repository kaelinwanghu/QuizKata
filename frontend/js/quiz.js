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

function displayQuiz(questions) {
  const outputDiv = document.getElementById("quiz-output");
  outputDiv.innerHTML = "";

  if (!questions || questions.length === 0) {
    outputDiv.innerHTML = "<p>No quiz data returned.</p>";
    return;
  }

  questions.forEach((question, index) => {
    const questionElement = document.createElement("div");
    questionElement.innerHTML = `<h3>Question ${index + 1}: ${
      question.text
    }</h3>`;

    question.answers.forEach((answer) => {
      const answerElement = document.createElement("p");
      answerElement.innerText = answer.text;
      questionElement.appendChild(answerElement);
    });

    outputDiv.appendChild(questionElement);
  });
}
