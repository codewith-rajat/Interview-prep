
export const generateInterviewQuestions = async (context) => {
  try {
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      console.warn("GROK_API_KEY is not set. Using fallback questions.");
      return getFallbackQuestions(context);
    }

    const prompt = `You are an expert technical interviewer. Based on the following candidate and interview details, generate 8-12 relevant, high-quality interview questions.

Context:
Job Role: ${context.role || "Software Engineer"}
Experience Level: ${context.experience || "Mid-Level"}
Skills: ${context.skills ? context.skills.join(", ") : "General Programming"}
Interview Type: ${context.type || "Technical"}
Difficulty: ${context.difficulty || "Medium"}

Please provide ONLY a JSON array of strings, where each string is a question. Do not include any other text or formatting like markdown blocks.
Example output:
["What is closure in JavaScript?", "How does React handle state?"]`;

    // Standard x.ai endpoint
    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-beta", // Using standard grok-beta or grok-2 depending on what's available
        messages: [
          {
            role: "system",
            content: "You are a helpful AI assistant that generates interview questions in plain JSON array format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Grok API Error (${response.status}):`, errorText);
      throw new Error(`Grok API returned status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (content) {
      try {
        const parsedQuestions = JSON.parse(content.trim());
        if (Array.isArray(parsedQuestions)) {
          return parsedQuestions;
        }
      } catch (e) {
        console.error("Failed to parse Grok response as JSON:", content);
        // Attempt to extract questions if JSON parsing fails but it looks like a list
        return content.split('\n').map(q => q.replace(/^[-\d.]\s*/, '').trim()).filter(q => q.length > 5);
      }
    }
    
    return getFallbackQuestions(context);
  } catch (error) {
    console.error("Error generating questions from Grok:", error);
    return getFallbackQuestions(context);
  }
};

const getFallbackQuestions = (context) => {
  return [
    `Can you explain your experience with ${context.skills ? context.skills[0] : 'the required technologies'}?`,
    "What is the most challenging bug you've recently fixed?",
    "How do you approach system design for scalable applications?",
    "Describe a time you had a disagreement with a team member and how you resolved it.",
    "How do you stay up-to-date with new technologies?",
    "Can you walk me through your typical development workflow?",
    "What are your strategies for testing your code?",
    "Explain a complex technical concept you've recently learned."
  ];
};

export default { generateInterviewQuestions };
