import React, { useState, useEffect } from 'react';
import { apiCall, showToast } from '../utils/api';
import './Quiz.css';

const Quiz = ({ user, onLogout }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    let timer;
    if (selectedQuiz && timeLeft > 0 && !quizCompleted) {
      timer = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && selectedQuiz) {
      handleQuizComplete();
    }
    return () => clearInterval(timer);
  }, [selectedQuiz, timeLeft, quizCompleted]);

  const loadQuizzes = async () => {
    try {
      const sampleQuizzes = [
        {
          _id: 'web-dev-quiz',
          title: 'Web Development Quiz',
          description: 'Test your knowledge of HTML, CSS, and JavaScript',
          questions: [
            {
              questionText: 'What does HTML stand for?',
              options: [
                'Hyper Text Markup Language',
                'High Tech Modern Language',
                'Hyper Transfer Markup Language',
                'Home Tool Markup Language'
              ],
              correctAnswer: 0
            },
            {
              questionText: 'Which CSS property is used to change the text color?',
              options: [
                'text-color',
                'font-color',
                'color',
                'text-style'
              ],
              correctAnswer: 2
            },
            {
              questionText: 'Which of the following is a JavaScript framework?',
              options: [
                'React',
                'Laravel',
                'Django',
                'Flask'
              ],
              correctAnswer: 0
            }
          ],
          timeLimit: 5
        }
      ];
      setQuizzes(sampleQuizzes);
    } catch (error) {
      showToast('Error loading quizzes');
    }
  };

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setScore(0);
    setQuizCompleted(false);
    setShowCertificate(false);
    setTimeLeft(quiz.timeLimit * 60);
  };

  const handleAnswerSelect = (answerIndex) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < selectedQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleQuizComplete();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleQuizComplete = async () => {
    let calculatedScore = 0;
    selectedQuiz.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        calculatedScore++;
      }
    });

    setScore(calculatedScore);
    setQuizCompleted(true);

    try {
      await apiCall(`/quizzes/${selectedQuiz._id}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          answers: userAnswers,
          score: calculatedScore,
          totalQuestions: selectedQuiz.questions.length,
          timeSpent: (selectedQuiz.timeLimit * 60) - timeLeft
        })
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const handleTakeAnotherQuiz = () => {
    setSelectedQuiz(null);
    setQuizCompleted(false);
    setShowCertificate(false);
    setUserAnswers([]);
    setScore(0);
    setCurrentQuestion(0);
  };

  const generateCertificate = () => {
    setShowCertificate(true);
  };

  const Certificate = () => {
    const percentage = Math.round((score / selectedQuiz.questions.length) * 100);
    const currentDate = new Date().toLocaleDateString();
    
    return (
      <div className="certificate-overlay">
        <div className="certificate">
          <div className="certificate-header">
            <h1>Certificate of Completion</h1>
            <div className="certificate-logo">
              <i className="fas fa-graduation-cap"></i>
              <span>LearnPro</span>
            </div>
          </div>
          <div className="certificate-body">
            <p>This is to certify that</p>
            <h2>{user.name}</h2>
            <p>has successfully completed the</p>
            <h3>{selectedQuiz.title}</h3>
            <p>with a score of {percentage}%</p>
            <div className="certificate-details">
              <p>Score: {score} out of {selectedQuiz.questions.length}</p>
              <p>Date: {currentDate}</p>
            </div>
          </div>
          <div className="certificate-footer">
            <button className="btn" onClick={() => window.print()}>
              Print Certificate
            </button>
            <button className="btn btn-secondary" onClick={() => setShowCertificate(false)}>
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Show certificate if enabled
  if (showCertificate) {
    return <Certificate />;
  }

  if (selectedQuiz && !quizCompleted) {
    const question = selectedQuiz.questions[currentQuestion];
    const progress = ((currentQuestion) / selectedQuiz.questions.length) * 100;

    return (
      <div className="container">
        <div className="sidebar">
          <div className="logo">
            <i className="fas fa-graduation-cap"></i>
            <h1>LearnPro</h1>
          </div>
          <ul className="nav-links">
            <li>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="nav-link"
              >
                <i className="fas fa-th-large"></i> Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => window.location.href = '/courses'}
                className="nav-link"
              >
                <i className="fas fa-book-open"></i> Courses
              </button>
            </li>
            <li>
              <button className="nav-link active">
                <i className="fas fa-question-circle"></i> Quiz
              </button>
            </li>
            <li className="logout">
              <button onClick={onLogout} className="nav-link logout-btn">
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </li>
          </ul>
        </div>

        <div className="main-content">
          <div className="header">
            <div className="welcome">
              <h2>{selectedQuiz.title}</h2>
              <p>{selectedQuiz.description}</p>
            </div>
            <div className="quiz-timer">
              <i className="fas fa-clock"></i>
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="quiz-container">
            <div className="quiz-progress">
              <div 
                className="quiz-progress-bar" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="question">
              <h3>Question {currentQuestion + 1} of {selectedQuiz.questions.length}</h3>
              <p>{question.questionText}</p>
            </div>

            <div className="options">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`option ${userAnswers[currentQuestion] === index ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(index)}
                >
                  {option}
                </div>
              ))}
            </div>

            <div className="quiz-navigation">
              <button
                className="btn btn-secondary"
                onClick={handlePreviousQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </button>
              <button
                className="btn"
                onClick={handleNextQuestion}
                disabled={userAnswers[currentQuestion] === undefined}
              >
                {currentQuestion === selectedQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const percentage = Math.round((score / selectedQuiz.questions.length) * 100);
    
    return (
      <div className="container">
        <div className="sidebar">
          <div className="logo">
            <i className="fas fa-graduation-cap"></i>
            <h1>LearnPro</h1>
          </div>
          <ul className="nav-links">
            <li>
              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="nav-link"
              >
                <i className="fas fa-th-large"></i> Dashboard
              </button>
            </li>
            <li>
              <button 
                onClick={() => window.location.href = '/courses'}
                className="nav-link"
              >
                <i className="fas fa-book-open"></i> Courses
              </button>
            </li>
            <li>
              <button className="nav-link active">
                <i className="fas fa-question-circle"></i> Quiz
              </button>
            </li>
            <li className="logout">
              <button onClick={onLogout} className="nav-link logout-btn">
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </li>
          </ul>
        </div>

        <div className="main-content">
          <div className="quiz-results">
            <h2>Quiz Completed!</h2>
            <div className={`score ${percentage >= 70 ? 'pass' : 'fail'}`}>
              {percentage}%
            </div>
            <p>You scored {score} out of {selectedQuiz.questions.length} questions correctly.</p>
            
            {percentage >= 70 ? (
              <div className="success-message">
                <i className="fas fa-trophy"></i>
                <p>Congratulations! You passed the quiz and earned a certificate.</p>
              </div>
            ) : (
              <div className="fail-message">
                <i className="fas fa-redo"></i>
                <p>You need 70% or higher to earn a certificate. Try again!</p>
              </div>
            )}

            <div className="result-actions">
              <button className="btn" onClick={handleTakeAnotherQuiz}>
                Take Another Quiz
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => window.location.href = '/dashboard'}
              >
                Back to Dashboard
              </button>
              {percentage >= 70 && (
                <button className="btn btn-success" onClick={generateCertificate}>
                  <i className="fas fa-award"></i> View Certificate
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="sidebar">
        <div className="logo">
          <i className="fas fa-graduation-cap"></i>
          <h1>LearnPro</h1>
        </div>
        <ul className="nav-links">
          <li>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="nav-link"
            >
              <i className="fas fa-th-large"></i> Dashboard
            </button>
          </li>
          <li>
            <button 
              onClick={() => window.location.href = '/courses'}
              className="nav-link"
            >
              <i className="fas fa-book-open"></i> Courses
            </button>
          </li>
          <li>
            <button className="nav-link active">
              <i className="fas fa-question-circle"></i> Quiz
            </button>
          </li>
          <li className="logout">
            <button onClick={onLogout} className="nav-link logout-btn">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <div className="welcome">
            <h2>Available Quizzes</h2>
            <p>Test your knowledge and earn certificates</p>
          </div>
          <div className="user-info">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2a5298&color=fff`} alt={user.name} />
            <div className="user-details">
              <h4>{user.name}</h4>
              <p>{user.role}</p>
            </div>
          </div>
        </div>

        <div className="quizzes-grid">
          {quizzes.map(quiz => (
            <div key={quiz._id} className="quiz-card">
              <div className="quiz-header">
                <h3>{quiz.title}</h3>
                <div className="quiz-meta">
                  <span><i className="fas fa-question"></i> {quiz.questions.length} questions</span>
                  <span><i className="fas fa-clock"></i> {quiz.timeLimit} min</span>
                </div>
              </div>
              <p className="quiz-description">{quiz.description}</p>
              <button className="btn" onClick={() => startQuiz(quiz)}>
                Start Quiz
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quiz;