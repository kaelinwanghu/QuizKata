// Leaderboard-specific logic can go here, such as fetching and displaying leaderboard data.
console.log("Leaderboard page loaded");

// Example of how you might fetch the leaderboard data
async function fetchLeaderboard() {
  const query = `
        query GetLeaderboard {
            leaderboard(input: { score: 0 }) {
                id
                score
                username
            }
        }
    `;

  try {
    const response = await fetch("http://localhost:4000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query,
      }),
    });

    const data = await response.json();
    console.log("Leaderboard Data:", data);
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
  }
}

fetchLeaderboard();
