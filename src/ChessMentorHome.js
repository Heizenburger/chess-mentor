import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Cpu, Book } from 'lucide-react';

const ChessMentorHome = () => {
  const options = [
    { title: 'Play Puzzles', icon: Play, color: 'text-blue-500', link: '/puzzle' },
    { title: 'Play with Computer', icon: Cpu, color: 'text-green-500', link: '/' },
    { title: 'Explorer', icon: Book, color: 'text-purple-500', link: '/' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">ChessMentor</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {options.map((option, index) => (
          <Link
            key={index}
            to={option.link}
            className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-center justify-center transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <option.icon className={`w-16 h-16 ${option.color} mb-4`} />
            <span className="text-xl font-semibold text-gray-700">{option.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChessMentorHome;