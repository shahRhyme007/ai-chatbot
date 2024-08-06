import React, { useState } from 'react';
import axios from 'axios';

const Chatbot: React.FC = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const result = await axios.post('/api/chat', { message });
      setResponse(result.data.completion);
      setMessage('');
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while fetching the response. Please try again.');
    }
  };

  return (
    <div className="chatbot-container">
      <h1>AI Chatbot</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          required
        />
        <button type="submit">Send</button>
      </form>
      {error && <div className="error">{error}</div>}
      {response && (
        <div className="response">
          <h2>Response:</h2>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
};

export default Chatbot;