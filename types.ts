export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export enum ActiveTab {
  LEARN = 'Learn',
  EXPLAINER = 'Code Explainer',
  GENERATOR = 'Code Generator',
  QUIZ = 'Quiz Master',
  PROJECTS = 'Project Ideas',
}
