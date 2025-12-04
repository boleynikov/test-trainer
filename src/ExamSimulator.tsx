import React, { useState, useEffect } from 'react';
import { Container, Typography } from '@mui/material';
import { type Question } from './types';
import { ResultScreen } from './components/ResultScreen';
import { QuizHeader } from './components/QuizHeader';
import { QuestionCard } from './components/QuestionCard';

// --- MOCK DATA ---
const rawQuestions: Question[] = [
    {
        id: 1,
        text: "Який тип компонента PCF слід використовувати для візуалізації?",
        correctOptionId: "opt2",
        options: [
            { id: "opt1", text: "Standard Component" },
            { id: "opt2", text: "Dataset Component" }, // Correct
            { id: "opt3", text: "Field Component" },
            { id: "opt4", text: "Service Component" }
        ]
    },
    {
        id: 2,
        text: "Яка максимальна тривалість Azure Function (Consumption plan)?",
        correctOptionId: "opt3",
        options: [
            { id: "opt1", text: "30 секунд" },
            { id: "opt2", text: "5 хвилин" },
            { id: "opt3", text: "10 хвилин" }, // Correct
            { id: "opt4", text: "60 хвилин" }
        ]
    }
];

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

    // UI State
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState<boolean>(false);
    const [isFinished, setIsFinished] = useState<boolean>(false);

    // Initialize / Reset Logic
    const initializeQuiz = (random: boolean) => {
        let qList = JSON.parse(JSON.stringify(rawQuestions)); // Deep copy to avoid mutating original

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

    // --- RENDER ---

    if (questions.length === 0) return <Typography>Loading...</Typography>;

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