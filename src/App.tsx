import React, { useState } from 'react';
import logo from './logo.svg';
import './App.css';
import reflex from './reflex';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState('');
  const result = reflex.evaluate(userInput);
  return (
    <div className="App">
      <header className="App-header">
         Reflex Harness 
      </header>
      <main className="App-main">
        <h2>welcome</h2>
        <p>let's get started</p>
        <input
          type="text"
          onChange={(e)=>setUserInput(e.target.value)}
          placeholder="Object.new()"
        />
        <div className="Reflex-result">
          {result}
        </div>
      </main>
    </div>
  );
}

export default App;
