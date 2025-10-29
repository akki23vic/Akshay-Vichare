import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { QuizItem } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = "gemini-2.5-pro";

export async function streamGenerateTopicExplanation(topic: string, language: string): Promise<AsyncGenerator<GenerateContentResponse>> {
    const prompt = `
      You are 'Codey' the friendly robot tutor! 🤖 Your mission is to make learning programming feel like an exciting adventure.
      Your tone should be playful, encouraging, and a little bit quirky. Use plenty of emojis to keep things fun!

      Today's adventure is all about "${topic}" in the wonderful world of ${language}!

      Explain this concept to a brand new coder using the following structure. Remember to use Markdown for formatting!

      ---

      ### 🚀 Welcome to the World of ${topic}!

      Start with a super fun and simple analogy to explain what "${topic}" is. Why should a new coder be excited to learn this?

      ### 💡 What's the Big Idea?

      Break down the core concepts. Use bullet points and **bold text** to highlight the most important parts. Keep the language simple and avoid scary jargon. If you have to use a technical term, explain it like you're explaining it to a 5-year-old.

      ### 💻 Let's Get Our Hands Dirty with Code!

      Provide at least two clear, well-commented code examples.
      1.  **The "Hello, World!" Version:** A super simple example to show the concept in action.
      2.  **Level Up!:** A slightly more complex example that shows a more practical use case.

      Make your code comments fun and helpful!

      ### 👾 Watch Out for These Gremlins!

      Talk about one or two common mistakes or "gremlins" that can trip up new coders when they're working with "${topic}". Frame it as a friendly warning, not a scary lecture.

      ### ✨ Your Quest is Complete!

      End with a super encouraging summary. Recap the key takeaways and cheer the learner on for their next coding adventure!
    `;

    try {
        const response = await ai.models.generateContentStream({
            model,
            contents: prompt
        });
        return response;
    } catch (error) {
        console.error("Gemini API error in streamGenerateTopicExplanation:", error);
        throw new Error("Failed to generate topic explanation from AI.");
    }
}

export async function streamExplainCode(code: string, language: string): Promise<AsyncGenerator<GenerateContentResponse>> {
  const prompt = `
    You are an expert programming tutor for students learning to code.
    Explain the following ${language} code snippet.
    Break it down step-by-step. Explain the purpose of the code, how each part works, and what the expected output is.
    Use simple language and provide analogies if helpful.
    Format your response using Markdown for clarity.

    Code:
    \`\`\`${language}
    ${code}
    \`\`\`
  `;
  
  try {
    const response = await ai.models.generateContentStream({
        model,
        contents: prompt
    });
    return response;
  } catch (error) {
    console.error("Gemini API error in streamExplainCode:", error);
    throw new Error("Failed to get explanation from AI.");
  }
}

export async function streamGenerateCode(description: string, language: string): Promise<AsyncGenerator<GenerateContentResponse>> {
    const prompt = `
    You are an expert code generation assistant.
    Based on the following description, write a clean, efficient, and well-commented code snippet in ${language}.
    Only provide the code itself inside a single markdown code block. Do not add any introductory or concluding text.

    Description: "${description}"
  `;

  try {
    const response = await ai.models.generateContentStream({
        model,
        contents: prompt
    });
    return response;
  } catch (error) {
    console.error("Gemini API error in streamGenerateCode:", error);
    throw new Error("Failed to generate code from AI.");
  }
}


const quizSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: {
          type: Type.STRING,
          description: "The quiz question."
        },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "An array of 4 possible answers."
        },
        correctAnswer: {
          type: Type.STRING,
          description: "The correct answer from the options array."
        },
        explanation: {
          type: Type.STRING,
          description: "A brief explanation of why the answer is correct."
        }
      },
      required: ['question', 'options', 'correctAnswer', 'explanation']
    }
  };

export async function generateQuiz(topic: string, language: string): Promise<QuizItem[]> {
    const prompt = `
    You are a helpful quiz master for programming students.
    Generate a 5-question multiple-choice quiz on the topic of "${topic}" in the context of the ${language} programming language.
    The questions should be suitable for a beginner to intermediate level.
    For each question, provide 4 options, one of which is the correct answer.
    Also, provide a short explanation for the correct answer.
    Ensure the options and correct answer are strings.
    Return the data in the specified JSON format.
  `;

  try {
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: quizSchema,
        },
    });
    
    const jsonString = response.text;
    const quizData = JSON.parse(jsonString);
    return quizData as QuizItem[];
  } catch (error) {
    console.error("Gemini API error in generateQuiz:", error);
    throw new Error("Failed to generate quiz from AI.");
  }
}

export async function streamGenerateProjectIdeas(topic: string, language: string): Promise<AsyncGenerator<GenerateContentResponse>> {
    const prompt = `
      You are an expert programming tutor who inspires students with practical projects.
      Generate 3 to 5 beginner-friendly project ideas for the topic "${topic}" in the ${language} programming language.
      These projects should help a student apply their knowledge in a real-world, tangible way.

      For each project idea, provide:
      1.  **A clear, catchy title.**
      2.  **A brief, one-sentence description** of the project.
      3.  **A list of key concepts** from "${topic}" that will be used.

      Format the entire response using Markdown. Use a main heading for "Project Ideas" and subheadings for each project title.
      For example:
      ### 1. Simple Calculator
      *   **Description**: A console application that can perform basic arithmetic operations.
      *   **Key Concepts**: Functions, User Input, Conditional Statements.
    `;

    try {
        const response = await ai.models.generateContentStream({
            model,
            contents: prompt
        });
        return response;
    } catch (error) {
        console.error("Gemini API error in streamGenerateProjectIdeas:", error);
        throw new Error("Failed to generate project ideas from AI.");
    }
}