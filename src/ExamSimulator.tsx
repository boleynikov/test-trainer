import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { type Question } from './types';
import { ResultScreen } from './components/ResultScreen';
import { QuizHeader } from './components/QuizHeader';
import { QuestionCard } from './components/QuestionCard';
import { DataLoadModal } from './components/DataLoadModal';

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

    // Loading/Modal state
    const [isDataLoadModalOpen, setIsDataLoadModalOpen] = useState<boolean>(false);
    const [isLoaded, setIsLoaded] = useState(false); // Prevent saving on initial render

    // Quiz progress state
    const [isRandomMode, setIsRandomMode] = useState<boolean>(false);
    const [currentQIndex, setCurrentQIndex] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [answeredCount, setAnsweredCount] = useState<number>(0);
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [tempSelectedOptionId, setTempSelectedOptionId] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState<boolean>(false);
    const [isFinished, setIsFinished] = useState<boolean>(false);

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
            setAnsweredCount(progress.answeredCount);
            setSelectedOptionId(progress.selectedOptionId);
            setIsAnswered(progress.isAnswered);
            setIsFinished(progress.isFinished);
            setTempSelectedOptionId(progress.tempSelectedOptionId || null);
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
                answeredCount,
                selectedOptionId,
                isAnswered,
                isFinished,
                isRandomMode,
                tempSelectedOptionId,
            };
            localStorage.setItem('examProgress', JSON.stringify(progress));
        }
    }, [isLoaded, currentQIndex, score, answeredCount, selectedOptionId, isAnswered, isFinished, isRandomMode]);


    // --- HANDLERS ---

    const handleOptionSelect = (optionId: string) => {
        if (isAnswered) return;
        setTempSelectedOptionId(optionId);
    };

    const handleSubmitAnswer = () => {
        if (!tempSelectedOptionId || isAnswered) return;

        setSelectedOptionId(tempSelectedOptionId);
        setIsAnswered(true);
        setAnsweredCount(prev => prev + 1);

        if (tempSelectedOptionId === questions[currentQIndex].correctOptionId) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
            setSelectedOptionId(null);
            setTempSelectedOptionId(null);
            setIsAnswered(false);
        }
        else {
            setIsFinished(true);
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
        setAnsweredCount(0);
        setSelectedOptionId(null);
        setTempSelectedOptionId(null);
        setIsAnswered(false);
        setIsFinished(false);
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
        setAnsweredCount(0);
        setSelectedOptionId(null);
        setTempSelectedOptionId(null);
        setIsAnswered(false);
        setIsFinished(false);
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
                totalQuestions={questions.length}
                onRestart={handleRestartQuiz}
            />
        );
    }

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <QuizHeader
                currentQuestionIndex={currentQIndex}
                totalQuestions={questions.length}
                score={score}
                answeredCount={answeredCount}
                isRandomMode={isRandomMode}
                onToggleRandom={handleToggleRandom}
            />

            <QuestionCard
                question={questions[currentQIndex]}
                selectedOptionId={selectedOptionId}
                tempSelectedOptionId={tempSelectedOptionId}
                isAnswered={isAnswered}
                onOptionSelect={handleOptionSelect}
                onSubmitAnswer={handleSubmitAnswer}
                onNext={handleNext}
                isLastQuestion={currentQIndex === questions.length - 1}
            />
        </Container>
    );
};

export default ExamSimulator;