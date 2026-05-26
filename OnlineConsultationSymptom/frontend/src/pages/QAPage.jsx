import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { consultationApi } from '../utils/api.js';

function QAPage() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [availableAnswers, setAvailableAnswers] = useState([]);
  const [questionHistory, setQuestionHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    startQA();
  }, []);

  const startQA = async () => {
    try {
      const data = await consultationApi.qaStart();
      setQuestion(data.question);
      setAvailableAnswers(data.availableAnswers);
    } catch (error) {
      console.error('开始问答失败:', error);
      alert('加载失败，请刷新页面重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (answer) => {
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const newHistory = [
        ...questionHistory,
        { questionId: question.id, questionText: question.question_text, answer }
      ];

      const data = await consultationApi.qaAnswer(
        question.id,
        answer,
        questionHistory
      );

      if (data.isComplete) {
        navigate('/result', {
          state: {
            result: data.result,
            type: 'qa',
            questionHistory: newHistory
          }
        });
      } else {
        setQuestion(data.question);
        setAvailableAnswers(data.availableAnswers);
        setQuestionHistory(newHistory);
      }
    } catch (error) {
      console.error('提交答案失败:', error);
      alert('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  return (
    <div className="qa-container">
      {questionHistory.length > 0 && (
        <div className="qa-history">
          <h3 style={{ marginBottom: 12, color: '#667eea' }}>📋 问答历史</h3>
          {questionHistory.map((item, index) => (
            <div key={index} className="qa-history-item">
              <span className="qa-history-question">Q: {item.questionText}</span>
              <span className="qa-history-answer">A: {item.answer}</span>
            </div>
          ))}
        </div>
      )}

      <div className="qa-question">
        <div className="qa-question-text">
          <strong>Q{questionHistory.length + 1}:</strong> {question?.question_text}
        </div>
        <div className="qa-answers">
          {availableAnswers.map((answer, index) => (
            <button
              key={index}
              className="qa-answer-btn"
              onClick={() => handleAnswer(answer)}
              disabled={submitting}
            >
              {answer}
            </button>
          ))}
        </div>
      </div>

      <div className="btn-group">
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/')}
        >
          返回首页
        </button>
      </div>

      <div className="disclaimer" style={{ marginTop: 20 }}>
        <strong>⚠️ 免责声明：</strong>本系统提供的诊断结果仅供参考，不能替代专业医疗诊断。如有身体不适，请及时就医。
      </div>
    </div>
  );
}

export default QAPage;
