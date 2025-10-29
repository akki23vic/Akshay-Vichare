import React, { useState, useCallback, Suspense, lazy, useEffect } from 'react';
import { Topic, ActiveTab, QuizItem } from '../types';
import { streamGenerateTopicExplanation, streamGenerateCode, streamExplainCode, generateQuiz, streamGenerateProjectIdeas } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { BrainCircuitIcon, LightbulbIcon, SparklesIcon, RefreshIcon, BookOpenIcon, FolderOpenIcon } from './IconComponents';

const CodeBlock = lazy(() => import('./CodeBlock'));

interface MainContentProps {
  topic: Topic;
}

const ToolTab: React.FC<{
  label: ActiveTab;
  activeTab: ActiveTab;
  onClick: (tab: ActiveTab) => void;
  icon: React.ReactNode;
}> = ({ label, activeTab, onClick, icon }) => (
  <button
    onClick={() => onClick(label)}
    className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all duration-300 focus:outline-none ${
      activeTab === label
        ? 'text-primary-400 border-primary-400'
        : 'text-gray-400 border-transparent hover:text-gray-100 hover:bg-white/5'
    }`}
  >
    {activeTab === label && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-primary-400 shadow-glow-primary"></div>}
    {icon}
    {label}
  </button>
);

export const MainContent: React.FC<MainContentProps> = ({ topic }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(ActiveTab.LEARN);
  const [userInput, setUserInput] = useState('');
  const [language, setLanguage] = useState('JavaScript');
  const [output, setOutput] = useState('');
  const [learningContent, setLearningContent] = useState('');
  const [projectIdeas, setProjectIdeas] = useState('');
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null);
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLearningLoading, setIsLearningLoading] = useState(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExplanation = async () => {
      setIsLearningLoading(true);
      setError(null);
      setLearningContent('');
      try {
        const stream = await streamGenerateTopicExplanation(topic.name, language);
        for await (const chunk of stream) {
            setLearningContent(prev => prev + chunk.text);
        }
      } catch (err) {
        setError('An error occurred while fetching the topic explanation. Please try again.');
        console.error(err);
      } finally {
        setIsLearningLoading(false);
      }
    };
    fetchExplanation();
  }, [topic, language]);

  useEffect(() => {
    setActiveTab(ActiveTab.LEARN);
    setUserInput('');
    setOutput('');
    setQuiz(null);
    setUserAnswers({});
    setShowQuizResults(false);
    setError(null);
    setProjectIdeas('');
  }, [topic]);

    useEffect(() => {
        const fetchProjectIdeas = async () => {
            if (activeTab === ActiveTab.PROJECTS && !projectIdeas && !isProjectsLoading) {
                setIsProjectsLoading(true);
                setError(null);
                setProjectIdeas('');
                try {
                    const stream = await streamGenerateProjectIdeas(topic.name, language);
                    for await (const chunk of stream) {
                        setProjectIdeas(prev => prev + chunk.text);
                    }
                } catch (err) {
                    setError('An error occurred while fetching project ideas. Please try again.');
                    console.error(err);
                } finally {
                    setIsProjectsLoading(false);
                }
            }
        };
        fetchProjectIdeas();
    }, [activeTab, topic, language, projectIdeas, isProjectsLoading]);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
  };
  
  const fetchAndStream = useCallback(async (type: 'explain' | 'generate', text: string) => {
    setIsLoading(true);
    setError(null);
    setOutput('');
    try {
        const stream = type === 'explain'
            ? await streamExplainCode(text, language)
            : await streamGenerateCode(text, language);

        for await (const chunk of stream) {
            setOutput(prev => prev + chunk.text);
        }
    } catch (err) {
        setError('An error occurred while processing your request. Please try again.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [language]);

  const handleExplainRequest = useCallback((codeToExplain: string) => {
    setActiveTab(ActiveTab.EXPLAINER);
    setUserInput(codeToExplain);
    fetchAndStream('explain', codeToExplain);
  }, [fetchAndStream]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput) return;

    const type = activeTab === ActiveTab.EXPLAINER ? 'explain' : 'generate';
    fetchAndStream(type, userInput);
  }, [userInput, activeTab, fetchAndStream]);
  
  const handleGenerateQuiz = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setQuiz(null);
    setUserAnswers({});
    setShowQuizResults(false);

    try {
        const quizData = await generateQuiz(topic.name, language);
        setQuiz(quizData);
    } catch (err) {
        setError('Failed to generate quiz. Please try again.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  }, [topic, language]);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };

  const handleClear = () => {
    setUserInput('');
    setOutput('');
    setError(null);
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case ActiveTab.LEARN:
        return (
            <div className="animate-fade-in">
                {(isLearningLoading && !learningContent) && (
                    <div className="flex justify-center p-8"><LoadingSpinner /></div>
                )}
                {learningContent && (
                    <div className="rounded-lg">
                        <Suspense fallback={<LoadingSpinner />}>
                            <CodeBlock language="markdown" code={learningContent} onExplain={handleExplainRequest} />
                        </Suspense>
                    </div>
                )}
            </div>
        );
      case ActiveTab.PROJECTS:
        return (
            <div className="animate-fade-in">
                {(isProjectsLoading && !projectIdeas) && (
                    <div className="flex justify-center p-8"><LoadingSpinner /></div>
                )}
                {projectIdeas && (
                    <div className="rounded-lg">
                        <Suspense fallback={<LoadingSpinner />}>
                            <CodeBlock language="markdown" code={projectIdeas} onExplain={handleExplainRequest} />
                        </Suspense>
                    </div>
                )}
            </div>
        );
      case ActiveTab.QUIZ:
        const score = quiz ? quiz.reduce((acc, item, index) => acc + (userAnswers[index] === item.correctAnswer ? 1 : 0), 0) : 0;
        return (
          <div className="space-y-6 animate-fade-in">
             {!quiz && !isLoading && (
              <div className="text-center p-8">
                <p className="text-gray-300 mb-6">Test your knowledge on <span className="font-semibold text-primary-400">{topic.name}</span> in <span className="font-semibold text-violet-400">{language}</span>.</p>
                <button onClick={handleGenerateQuiz} disabled={isLoading} className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/40 transform hover:-translate-y-0.5">
                  {isLoading ? 'Generating...' : 'Start Quiz'}
                </button>
              </div>
            )}
            {isLoading && <div className="flex justify-center p-8"><LoadingSpinner /></div>}
            {quiz && (
              <div className="space-y-8">
                {showQuizResults && (
                    <div className="text-center glass-pane p-4 rounded-lg animate-fade-in">
                        <h3 className="text-2xl font-bold text-white">Quiz Complete!</h3>
                        <p className="text-lg text-primary-400 font-bold" style={{textShadow: 'var(--glow-primary)'}}>You scored {score} / {quiz.length}</p>
                    </div>
                )}
                {quiz.map((item, index) => (
                  <div key={index} className="glass-pane p-6 rounded-lg transition-all duration-300">
                    <p className="font-mono text-lg mb-4 text-gray-100">{index + 1}. {item.question}</p>
                    <div className="space-y-3">
                      {item.options.map(option => {
                        const isSelected = userAnswers[index] === option;
                        let optionClass = 'bg-gray-500/20 hover:bg-gray-500/30 border-gray-500/30';
                        if (showQuizResults) {
                            if (option === item.correctAnswer) {
                                optionClass = 'bg-green-500/20 border-green-500 shadow-[0_0_10px_rgba(74,222,128,0.5)]';
                            } else if (isSelected && option !== item.correctAnswer) {
                                optionClass = 'bg-red-500/20 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
                            }
                        } else if (isSelected) {
                            optionClass = 'bg-primary-500/30 border-primary-500 shadow-glow-primary';
                        }
                        return (
                            <button key={option} onClick={() => !showQuizResults && handleAnswerSelect(index, option)}
                                className={`w-full text-left p-3 rounded-md transition-all duration-200 border ${optionClass}`}>
                                <code className="font-mono text-gray-200">{option}</code>
                            </button>
                        );
                      })}
                    </div>
                    {showQuizResults && (
                        <div className="mt-4 p-4 bg-black/30 rounded-md animate-fade-in">
                            <p className="text-sm text-gray-300"><span className="font-semibold text-green-400">Explanation:</span> {item.explanation}</p>
                        </div>
                    )}
                  </div>
                ))}
                <div className="text-center space-x-4">
                    {!showQuizResults ? (
                        <button onClick={() => setShowQuizResults(true)} disabled={Object.keys(userAnswers).length !== quiz.length} className="bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/40 transform hover:-translate-y-0.5">
                            Check Answers
                        </button>
                    ) : (
                        <button onClick={handleGenerateQuiz} disabled={isLoading} className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/40 transform hover:-translate-y-0.5">
                            {isLoading ? 'Generating...' : 'Try Another Quiz'}
                        </button>
                    )}
                </div>
              </div>
            )}
          </div>
        );
      case ActiveTab.EXPLAINER:
      case ActiveTab.GENERATOR:
      default:
        return (
          <div className="animate-fade-in">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="userInput" className="block text-sm font-medium text-gray-300 mb-2">
                  {activeTab === ActiveTab.EXPLAINER ? 'Paste your code here:' : 'Describe what you want to build:'}
                </label>
                <textarea
                  id="userInput"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={activeTab === ActiveTab.EXPLAINER ? `function hello() {\n  console.log('Hello, World!');\n}` : 'e.g., a function to calculate the factorial of a number'}
                  className="w-full h-48 p-3 bg-gray-900/50 border border-gray-500/30 rounded-lg text-gray-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-300 focus:shadow-glow-primary"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={isLoading || !userInput} className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/40 transform hover:-translate-y-0.5">
                  {isLoading ? 'Thinking...' : 'Submit'}
                </button>
              </div>
            </form>
            {(isLoading && !output) && <div className="flex justify-center p-8"><LoadingSpinner /></div>}
            {output && (
                <div className="bg-black/20 border border-gray-500/20 rounded-lg mt-6 animate-fade-in">
                    <div className="flex justify-between items-center p-4 border-b border-gray-500/20">
                      <h3 className="text-lg font-semibold text-gray-100">AI Response</h3>
                      <button onClick={handleClear} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors p-2 rounded-md bg-gray-500/20 hover:bg-gray-500/40">
                        <RefreshIcon className="w-4 h-4"/>
                        Clear
                      </button>
                    </div>
                    <div className="p-4">
                        <Suspense fallback={<LoadingSpinner />}>
                            <CodeBlock 
                                language={activeTab === ActiveTab.GENERATOR ? language.toLowerCase() : 'markdown'}
                                code={output}
                                onExplain={activeTab === ActiveTab.GENERATOR ? handleExplainRequest : undefined}
                            />
                        </Suspense>
                    </div>
                </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 p-6 glass-pane rounded-lg">
        <div className="flex justify-between items-start flex-wrap gap-4">
            <div className="flex-grow">
                <h2 className="text-2xl font-bold text-gray-50 mb-1" style={{textShadow: '0 0 10px rgba(255,255,255,0.3)'}}>{topic.name}</h2>
                <p className="text-gray-400">{topic.description}</p>
            </div>
            <div className="flex-shrink-0">
                  <label htmlFor="language-main" className="block text-sm font-medium text-gray-300 mb-1">Language</label>
                  <select id="language-main" value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full sm:w-48 p-2 bg-gray-800/80 border border-gray-500/30 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition">
                    <option>JavaScript</option>
                    <option>Python</option>
                    <option>Java</option>
                    <option>C++</option>
                    <option>TypeScript</option>
                    <option>Go</option>
                  </select>
            </div>
        </div>
      </div>

      <div className="glass-pane rounded-lg min-h-[500px]">
        <div className="border-b border-gray-500/20 px-4">
          <div className="flex -mb-px overflow-x-auto">
            <ToolTab label={ActiveTab.LEARN} activeTab={activeTab} onClick={handleTabChange} icon={<BookOpenIcon className="w-5 h-5" />} />
            <ToolTab label={ActiveTab.EXPLAINER} activeTab={activeTab} onClick={handleTabChange} icon={<LightbulbIcon className="w-5 h-5" />} />
            <ToolTab label={ActiveTab.GENERATOR} activeTab={activeTab} onClick={handleTabChange} icon={<SparklesIcon className="w-5 h-5" />} />
            <ToolTab label={ActiveTab.QUIZ} activeTab={activeTab} onClick={handleTabChange} icon={<BrainCircuitIcon className="w-5 h-5" />} />
            <ToolTab label={ActiveTab.PROJECTS} activeTab={activeTab} onClick={handleTabChange} icon={<FolderOpenIcon className="w-5 h-5" />} />
          </div>
        </div>
        <div className="p-6">
          {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-lg border border-red-500/50 mb-4">{error}</div>}
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};
