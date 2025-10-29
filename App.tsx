import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { Header } from './components/Header';
import { Topic } from './types';

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const topics: Topic[] = useMemo(() => [
    { id: 'variables', name: 'Variables & Data Types', description: 'Learn the fundamentals of storing and using data.' },
    { id: 'operators', name: 'Operators', description: 'Understand how to perform operations on variables.' },
    { id: 'control-flow', name: 'Control Flow', description: 'Master if/else statements and switch cases.' },
    { id: 'loops', name: 'Loops', description: 'Explore for, while, and do-while loops for iteration.' },
    { id: 'functions', name: 'Functions', description: 'Learn to write reusable blocks of code.' },
    { id: 'arrays', name: 'Arrays & Lists', description: 'Work with ordered collections of data.' },
    { id: 'objects', name: 'Objects & Dictionaries', description: 'Understand key-value pair data structures.' },
    { id: 'oop', name: 'Object-Oriented Programming', description: 'Dive into classes, objects, and inheritance.' },
    { id: 'async', name: 'Asynchronous Programming', description: 'Handle operations that take time to complete.' },
    { id: 'data-structures', name: 'Data Structures', description: 'Learn about stacks, queues, trees, and graphs.' },
    { id: 'algorithms', name: 'Algorithms', description: 'Study common algorithms for sorting and searching.' },
  ], []);

  const [selectedTopic, setSelectedTopic] = useState<Topic>(topics[0]);

  return (
    <div className="flex h-screen futuristic-bg text-gray-100 overflow-hidden">
      <Sidebar 
        topics={topics} 
        selectedTopic={selectedTopic} 
        setSelectedTopic={setSelectedTopic} 
        isOpen={isSidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          topicName={selectedTopic.name} 
          toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} 
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <MainContent topic={selectedTopic} />
        </main>
      </div>
    </div>
  );
};

export default App;