
import React from 'react';

const TailwindTest = () => {
  return (
    <div className="p-4 bg-blue-100 rounded-lg">
      <h1 className="text-2xl font-bold text-blue-800">Tailwind Test</h1>
      <p className="mt-2 text-gray-700"> styled text</p>
      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Test Button
      </button>
    </div>
  );
};

export default TailwindTest;