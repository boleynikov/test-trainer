import React from 'react';
import {
    Box, Typography,
    // Switch, FormControlLabel, 
    LinearProgress, Chip
} from '@mui/material';
import type { Question } from '../types';

interface QuizHeaderProps {
    currentQuestionIndex: number;
    totalQuestions: number;
    score: number;
    answeredQuestions: Question[];
    isRandomMode: boolean;
    onToggleRandom: (checked: boolean) => void;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({
    currentQuestionIndex,
    totalQuestions,
    score,
    answeredQuestions = [],
    // isRandomMode,
    // onToggleRandom,
}) => {

    const answeredPoints = answeredQuestions.reduce((acc, question) => {
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

    const successRate = answeredPoints > 0
        ? Math.round((score / answeredPoints) * 100)
        : 0;

    const progress = totalQuestions > 0
        ? ((currentQuestionIndex) / totalQuestions) * 100
        : 0;

    return (
        <Box sx={{ mb: 4 }}>
            {/* Верхня панель */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" color="text.secondary">
                    Питання {currentQuestionIndex + 1} / {totalQuestions}
                </Typography>

                {/* <FormControlLabel
                    control={
                        <Switch
                            checked={isRandomMode}
                            onChange={(e) => onToggleRandom(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Random Mode"
                /> */}
            </Box>

            {/* Статистика та Прогрес */}
            <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2" color="text.secondary">Прогрес тесту</Typography>
                <Chip
                    label={`Поточна точність: ${successRate}%`}
                    color={successRate >= 70 ? "success" : "default"}
                    size="small"
                    variant="outlined"
                />
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
    );
};