import React from 'react';
import { Topic } from '../types';
import { CodeIcon, XIcon } from './IconComponents';

interface SidebarProps {
  topics: Topic[];
  selectedTopic: Topic;
  setSelectedTopic: (topic: Topic) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ topics, selectedTopic, setSelectedTopic, isOpen, setIsOpen }) => {
  const handleTopicSelect = (topic: Topic) => {
    setSelectedTopic(topic);
    if(window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-60 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsOpen(false)}></div>
      <aside className={`fixed lg:relative inset-y-0 left-0 w-64 glass-pane p-4 flex-shrink-0 transform transition-transform duration-300 ease-in-out z-30 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
             <CodeIcon className="h-8 w-8 text-primary-400" />
             <h1 className="text-xl font-bold text-gray-50" style={{textShadow: '0 0 5px rgba(255,255,255,0.3)'}}>AI Tutor</h1>
           </div>
           <button onClick={() => setIsOpen(false)} className="lg:hidden text-gray-400 hover:text-white p-1 rounded-md">
             <XIcon className="h-6 w-6" />
           </button>
        </div>
        <nav>
          <ul className="space-y-1">
            {topics.map((topic) => (
              <li key={topic.id}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleTopicSelect(topic);
                  }}
                  className={`relative flex items-center p-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    selectedTopic.id === topic.id
                      ? 'bg-primary-500/20 text-white'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {selectedTopic.id === topic.id && <div className="absolute left-0 top-0 h-full w-1 bg-primary-400 rounded-r-full shadow-glow-primary"></div>}
                  {topic.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};