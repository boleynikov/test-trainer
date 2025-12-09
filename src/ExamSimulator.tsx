import React, { useState, useEffect } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { type Question } from './types';
import { ResultScreen } from './components/ResultScreen';
import { QuizHeader } from './components/QuizHeader';
import { QuestionCard } from './components/QuestionCard';
import { DataLoadModal } from './components/DataLoadModal';
import DragAndDropQuestion from './components/DragAndDropQuestion';
import SeveralStatementsQuestion from './components/SeveralStatementsQuestion';

// --- UTILS ---
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const shuffleQuestionsAndOptions = (qList: Question[], random: boolean): Question[] => {
    if (random) {
        let newQList = shuffleArray([...qList]);
        newQList = newQList.map((q: Question) => ({
            ...q,
            options: shuffleArray(q.options)
        }));
        return newQList;
    } else {
        // Deep copy and sort by ID to ensure original order
        return [...qList].sort((a, b) => (a.id > b.id ? 1 : -1));
    }
};


const ExamSimulator: React.FC = () => {
    // Core state
    const [originalQuestions, setOriginalQuestions] = useState<Question[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]); // The shuffled/sorted list in use

    const totalPoints = questions.reduce((acc, question) => {
        if (question.isMultiSelect) {
            return acc + (question.correctOptionIds?.length || 0);
        }

        if (question.correctZoneAnswers && Object.keys(question.correctZoneAnswers).length > 0) {
            return acc + Object.keys(question.correctZoneAnswers).length;
        }

        if (question.type === 'statements-match' && question.statements) {
            return acc + question.statements.length;
        }

        return acc + 1;
    }, 0);

    // Loading/Modal state
    const [isDataLoadModalOpen, setIsDataLoadModalOpen] = useState<boolean>(false);
    const [isLoaded, setIsLoaded] = useState(false); // Prevent saving on initial render

    // Quiz progress state
    const [isRandomMode, setIsRandomMode] = useState<boolean>(false);
    const [currentQIndex, setCurrentQIndex] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [answeredQuestions, setAnsweredQuestions] = useState<Question[]>([]);
    const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
    const [tempSelectedOptionIds, setTempSelectedOptionIds] = useState<string[]>([]);
    const [isAnswered, setIsAnswered] = useState<boolean>(false);
    const [isFinished, setIsFinished] = useState<boolean>(false);
    const [showSubmit, setShowSubmit] = useState<boolean>(true); // New state for submit button visibility


    // --- EFFECTS ---

    // 1. Initial load effect (runs once on mount)
    useEffect(() => {
        const storedQuestions = localStorage.getItem('questions');
        if (!storedQuestions) {
            setIsDataLoadModalOpen(true);
            return; // No questions, wait for user to upload
        }

        const parsedQuestions = JSON.parse(storedQuestions);
        setOriginalQuestions(parsedQuestions);

        const storedProgress = localStorage.getItem('examProgress');
        if (storedProgress) {
            const progress = JSON.parse(storedProgress);
            // Restore all progress state
            setIsRandomMode(progress.isRandomMode);
            setCurrentQIndex(progress.currentQIndex);
            setScore(progress.score);
            setAnsweredQuestions(progress.answeredQuestions);
            setSelectedOptionIds(progress.selectedOptionIds || []);
            setIsAnswered(progress.isAnswered);
            setIsFinished(progress.isFinished);
            setTempSelectedOptionIds(progress.tempSelectedOptionIds || []);
            setShowSubmit(progress.showSubmit ?? true); // Restore or default to true
            // Set the questions list based on the restored mode
            setQuestions(shuffleQuestionsAndOptions(parsedQuestions, progress.isRandomMode));
        } else {
            // No progress, start a fresh quiz (default non-random)
            setQuestions(shuffleQuestionsAndOptions(parsedQuestions, false));
        }

        setIsLoaded(true); // Signal that loading is complete
    }, []);

    // 2. Save progress effect
    useEffect(() => {
        // Only save after initial load is complete to avoid wiping storage
        if (isLoaded) {
            const progress = {
                currentQIndex,
                score,
                answeredQuestions,
                selectedOptionIds,
                isAnswered,
                isFinished,
                isRandomMode,
                tempSelectedOptionIds,
                showSubmit,
            };
            localStorage.setItem('examProgress', JSON.stringify(progress));
        }
    }, [isLoaded, currentQIndex, score, answeredQuestions, selectedOptionIds, isAnswered, isFinished, isRandomMode, tempSelectedOptionIds, showSubmit]);


    // --- HANDLERS ---

    const handleOptionSelect = (optionId: string) => {
        if (isAnswered) return;

        const currentQuestion = questions[currentQIndex];
        if (currentQuestion.isMultiSelect) {
            // Toggle selection for multiselect
            setTempSelectedOptionIds(prev =>
                prev.includes(optionId)
                    ? prev.filter(id => id !== optionId)
                    : [...prev, optionId]
            );
        } else {
            // Single select behavior
            setTempSelectedOptionIds([optionId]);
        }
    };

    const handleSubmitAnswer = () => {
        if (tempSelectedOptionIds.length === 0 || isAnswered) return;

        const currentQuestion = questions[currentQIndex];

        setSelectedOptionIds(tempSelectedOptionIds);
        setIsAnswered(true);
        setShowSubmit(false); // Hide submit button after answering

        // Variable to track how many points to add
        let pointsToAdd = 0;

        if (currentQuestion.isMultiSelect) {
            const correctIds = currentQuestion.correctOptionIds || [];
            pointsToAdd = tempSelectedOptionIds.filter(id => correctIds.includes(id)).length;
        } else {
            if (tempSelectedOptionIds[0] === currentQuestion.correctOptionId) {
                pointsToAdd = 1;
            }
        }
        handleQuestionSubmit(pointsToAdd);
    };

    const handleQuestionSubmit = (pointsEarned: number) => {
        setIsAnswered(true);
        setAnsweredQuestions(prev => [...prev, questions[currentQIndex]]);
        if (pointsEarned > 0) {
            setScore(prev => prev + pointsEarned);
        }
        setShowSubmit(false); // Ensure submit button is hidden after any question submission
    };

    const handleNext = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
            setSelectedOptionIds([]);
            setTempSelectedOptionIds([]);
            setIsAnswered(false);
            setShowSubmit(true); // Show submit button for the new question
        }
        else {
            setIsFinished(true);
        }
    };

    const handlePrevious = () => {
        if (currentQIndex > 0) {
            setCurrentQIndex(prev => prev - 1);
            setSelectedOptionIds([]);
            setTempSelectedOptionIds([]);
            setIsAnswered(false);
            setShowSubmit(true); // Show submit button for the previous question
        }
    };

    // 3. Handle toggling random mode (user action)
    const handleToggleRandom = (newIsRandom: boolean) => {
        setIsRandomMode(newIsRandom);

        // Reset the quiz when mode is toggled
        const shuffled = shuffleQuestionsAndOptions(originalQuestions, newIsRandom);
        setQuestions(shuffled);
        setCurrentQIndex(0);
        setScore(0);
        setAnsweredQuestions([]);
        setSelectedOptionIds([]);
        setTempSelectedOptionIds([]);
        setIsAnswered(false);
        setIsFinished(false);
        setShowSubmit(true);
    };

    const handleCloseDataLoadModal = () => {
        setIsDataLoadModalOpen(false);
        // Reloading the page is a simple way to trigger the load effect again
        window.location.reload();
    };

    const handleRestartQuiz = () => {
        localStorage.removeItem('examProgress');
        // Reset state, re-shuffle if needed
        const shuffled = shuffleQuestionsAndOptions(originalQuestions, isRandomMode);
        setQuestions(shuffled);
        setCurrentQIndex(0);
        setScore(0);
        setAnsweredQuestions([]);
        setSelectedOptionIds([]);
        setTempSelectedOptionIds([]);
        setIsAnswered(false);
        setIsFinished(false);
        setShowSubmit(true);
    };

    const handleSubmitDndAnswer = (pointsEarned: number) => {
        handleQuestionSubmit(pointsEarned);
        setShowSubmit(false); // Ensure submit button is hidden after any question submission
    };


    // --- RENDER ---

    if (!isLoaded && !isDataLoadModalOpen) {
        return <Typography>Loading...</Typography>;
    }

    if (isDataLoadModalOpen) {
        return (
            <DataLoadModal
                open={isDataLoadModalOpen}
                handleClose={handleCloseDataLoadModal}
                mode="light"
            />
        );
    }


    if (isFinished) {
        return (
            <ResultScreen
                score={score}
                totalPoints={totalPoints}
                onRestart={handleRestartQuiz}
            />
        );
    }

    const currentQuestion = questions[currentQIndex];
    const isFirstQuestion = currentQIndex === 0;
    const isLastQuestion = currentQIndex === questions.length - 1;

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <QuizHeader
                currentQuestionIndex={currentQIndex}
                totalQuestions={questions.length}
                score={score}
                answeredQuestions={answeredQuestions}
                isRandomMode={isRandomMode}
                onToggleRandom={handleToggleRandom}
            />

            {currentQuestion.type === 'dnd' || currentQuestion.type === 'dnd-zones' ? (
                <DragAndDropQuestion
                    question={currentQuestion}
                    onSubmitAnswer={handleSubmitDndAnswer}
                    showSubmit={showSubmit}
                />
            ) : currentQuestion.type === 'statements-match' ? (
                <SeveralStatementsQuestion
                    question={currentQuestion}
                    onSubmitAnswer={handleQuestionSubmit}
                    showSubmit={showSubmit}
                />
            ) : (
                <QuestionCard
                    question={currentQuestion}
                    selectedOptionIds={selectedOptionIds}
                    tempSelectedOptionIds={tempSelectedOptionIds}
                    isAnswered={isAnswered}
                    onOptionSelect={handleOptionSelect}
                    onSubmitAnswer={handleSubmitAnswer}
                    showSubmit={showSubmit}
                />
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handlePrevious}
                    disabled={isFirstQuestion}
                >
                    Попереднє питання
                </Button>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleNext}
                    disabled={!isAnswered && showSubmit} // Disable next if not answered and submit is visible
                >
                    {isLastQuestion ? "Завершити тест" : "Наступне питання"}
                </Button>
            </Box>
        </Container>
    );
};

export default ExamSimulator;