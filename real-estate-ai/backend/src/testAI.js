require("dotenv").config();

const { generateAIResponse } = require("./services/aiService");

async function run() {
  try {
    const result = await generateAIResponse(
      "Give investment insight for condo in Bukit Jalil RM480k"
    );

    console.log("AI test result:");
    console.log(result);
  } catch (error) {
    console.error("AI test failed:", error.message);
    process.exitCode = 1;
  }
}

run();
