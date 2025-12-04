import { Container } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { DataLoadModal } from './components/DataLoadModal';
import { QuestionCard } from './components/QuestionCard';
import { QuizHeader } from './components/QuizHeader';
import { ResultScreen } from './components/ResultScreen';
import { type Question } from './types';

// --- UTILS ---
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const ExamSimulator: React.FC = () => {
    // State
    const [isRandomMode, setIsRandomMode] = useState<boolean>(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQIndex, setCurrentQIndex] = useState<number>(0);
    const [score, setScore] = useState<number>(0);
    const [answeredCount, setAnsweredCount] = useState<number>(0);
    const [isDataLoadModalOpen, setIsDataLoadModalOpen] = useState<boolean>(false);


    // UI State
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState<boolean>(false);
    const [isFinished, setIsFinished] = useState<boolean>(false);

    // Initialize / Reset Logic
    const initializeQuiz = (random: boolean) => {
        const rawQuestions = localStorage.getItem('questions');
        if (!rawQuestions) {
            setIsDataLoadModalOpen(true);
            return;
        }

        let qList = JSON.parse(rawQuestions); // Deep copy to avoid mutating original

        if (random) {
            qList = shuffleArray(qList);
            qList = qList.map((q: Question) => ({
                ...q,
                options: shuffleArray(q.options)
            }));
        } else {
            qList.sort((a: Question, b: Question) => a.id - b.id);
        }

        setQuestions(qList);
        setCurrentQIndex(0);
        setScore(0);
        setAnsweredCount(0);
        setSelectedOptionId(null);
        setIsAnswered(false);
        setIsFinished(false);
    };

    useEffect(() => {
        initializeQuiz(isRandomMode);
    }, [isRandomMode]);

    // Handlers
    const handleOptionSelect = (optionId: string) => {
        if (isAnswered) return;

        setSelectedOptionId(optionId);
        setIsAnswered(true);
        setAnsweredCount(prev => prev + 1);

        if (optionId === questions[currentQIndex].correctOptionId) {
            setScore(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
            setSelectedOptionId(null);
            setIsAnswered(false);
        } else {
            setIsFinished(true);
        }
    };

    const handleCloseDataLoadModal = () => {
        setIsDataLoadModalOpen(false);
        initializeQuiz(isRandomMode);
    };


    // --- RENDER ---

    if (questions.length === 0) {
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
                onRestart={() => initializeQuiz(isRandomMode)}
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
                onToggleRandom={setIsRandomMode}
            />

            <QuestionCard
                question={questions[currentQIndex]}
                selectedOptionId={selectedOptionId}
                isAnswered={isAnswered}
                onOptionSelect={handleOptionSelect}
                onNext={handleNext}
                isLastQuestion={currentQIndex === questions.length - 1}
            />
        </Container>
    );
};

export default ExamSimulator;