import React, { useState, useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';

interface Message {
  type: 'user' | 'ai';
  text?: string;
  imageUrl?: string;
}

const Chatbot: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [responses, setResponses] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message && !imagePreview) {
      alert("Please enter a message or upload an image.");
      return;
    }

    const newMessage: Message = { type: 'user', text: message, imageUrl: imagePreview || undefined };
    setResponses(responses => [...responses, newMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const result = await axios.post('/api/chat', { 
        message, 
        image: imagePreview 
      });
      setResponses(currentResponses => [
        ...currentResponses, 
        { type: 'ai', text: result.data.completion }
      ]);
    } catch (error) {
      console.error('Error:', error);
      setResponses(currentResponses => [
        ...currentResponses, 
        { type: 'ai', text: 'An error occurred. Please try again.' }
      ]);
    } finally {
      setIsTyping(false);
      clearImagePreview();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (readEvent) => {
        setImagePreview(readEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImagePreview = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';  // Explicitly clear the file input
    }
  };

  return (
    <div className="chatbot-container">
      <h1>AI Chatbot</h1>
      <div className="message-area">
        {responses.map((res, index) => (
          <div key={index} className={`message-row ${res.type}`}>
            <div className={`message ${res.type}`}>
              {res.text}
              {res.imageUrl && (
                <Image src={res.imageUrl} alt="Uploaded" width={100} height={100} className="image-preview" />
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message-row ai">
            <div className="typing-indicator">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="input-container">
        {imagePreview && (
          <div className="image-preview-container">
            <div className="image-preview-wrapper">
              <Image src={imagePreview} alt="Preview" width={100} height={100} className="image-preview" />
              <button type="button" onClick={clearImagePreview} className="delete-image">X</button>
            </div>
          </div>
        )}
        <label className="upload-button">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
          <span>📷</span>
        </label>
        <input
          type="text"
          className="input-box"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
        />
        <button type="submit" className="send-button"></button>
      </form>
    </div>
  );
};

export default Chatbot;
