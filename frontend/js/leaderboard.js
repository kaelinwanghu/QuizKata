document
  .getElementById("leaderboard-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    // All the potential queries that can be used for the leaderboard
    const username = document.getElementById("username").value || null;
    const score = document.getElementById("score").value || null;
    const time = document.getElementById("time").value || null;
    const amount = document.getElementById("amount").value || null;
    const category = document.getElementById("category").value || null;
    const difficulty = document.getElementById("difficulty").value || null;
    const type = document.getElementById("type").value || null;

    const query = `
        query GetLeaderboard($input: LeaderboardQuery!) {
            leaderboard(input: $input) {
                id
                score
                time
                username
                amount
                category
                difficulty
                type
            }
        }
    `;

    // Get the variables for the GraphQL type
    const variables = {
      input: {
        username: username || undefined,
        score: score ? parseInt(score) : undefined,
        time: time ? parseFloat(time) : undefined,
        amount: amount ? parseInt(amount) : undefined,
        category: category || undefined,
        difficulty: difficulty || undefined,
        type: type || undefined,
      },
    };

    try {
      const response = await fetch("http://localhost:4000/graphql", {
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
      displayLeaderboard(data.data.leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    }
  });

// Display the leaderboard after fetching it (if it exists)
function displayLeaderboard(leaderboard) {
  const outputDiv = document.getElementById("leaderboard-output");
  outputDiv.innerHTML = "";

  if (!leaderboard || leaderboard.length === 0) {
    outputDiv.innerHTML = "<p>No leaderboard data found.</p>";
    return;
  }

  leaderboard.forEach((entry) => {
    const entryDiv = document.createElement("div");
    entryDiv.classList.add("leaderboard-entry");
    entryDiv.innerHTML = `
      <p>Username: ${entry.username}</p>
      <p>Score: ${entry.score}</p>
      <p>Time: ${entry.time}</p>
      <p>Amount of Questions: ${entry.amount}</p>
      <p>Category: ${entry.category}</p>
      <p>Difficulty: ${entry.difficulty}</p>
      <p>Type: ${entry.type}</p>
      <hr>
    `;
    outputDiv.appendChild(entryDiv);
  });
}
