import React, { useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

interface Message {
  type: 'user' | 'ai';
  text?: string;
  imageUrls?: string[];
}

const Chatbot: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [responses, setResponses] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newMessage: Message = { type: 'user' };
    if (message.trim()) newMessage.text = message;
    if (imagePreviews.length) newMessage.imageUrls = imagePreviews;

    setResponses(responses => [...responses, newMessage]);
    setMessage('');
    setImagePreviews([]);
    setIsTyping(true);

    try {
      const result = await axios.post('/api/chat', { message });
      setTimeout(() => {
        setIsTyping(false);
        setResponses(currentResponses => [...currentResponses, { type: 'ai', text: result.data.completion }]);
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
      setIsTyping(false);
      setResponses(currentResponses => [...currentResponses, { type: 'ai', text: 'An error occurred. Please try again.' }]);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (readEvent) => {
        setImagePreviews(prev => [...prev, readEvent.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageRemove = (index: number) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="chatbot-container">
      <h1>AI Chatbot</h1>
      <div className="message-area">
        {responses.map((res, index) => (
          <div key={index} className={`message-row ${res.type}`}>
            <div className={`message ${res.type}`}>
              {res.text}
              {res.imageUrls?.map((url, idx) => (
                <Image key={idx} src={url} alt="Uploaded" width={100} height={100} className="image-preview" />
              ))}
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
        <div className="image-preview-container">
          {imagePreviews.map((src, index) => (
            <div key={index} className="image-preview-wrapper">
              <Image src={src} alt="Preview" width={100} height={100} className="image-preview" />
              <button type="button" onClick={() => handleImageRemove(index)} className="delete-image"></button>
            </div>
          ))}
        </div>
        <label className="upload-button">
          <input type="file" accept="image/*" onChange={handleImageChange} multiple style={{ display: 'none' }} />
          <span style={{ display: 'flex', background: 'url(upload-icon.png) no-repeat center center', backgroundSize: 'cover', width: '40px', height: '40px' }}></span>
        </label>
        <input
          type="text"
          className="input-box"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message here..."
          required
        />
        <button type="submit" className="send-button"></button>
      </form>
    </div>
  );
};

export default Chatbot;
