import React from 'react';
import { Box, Typography, Switch, FormControlLabel, LinearProgress, Chip } from '@mui/material';

interface QuizHeaderProps {
    currentQuestionIndex: number;
    totalQuestions: number;
    score: number;
    answeredCount: number;
    isRandomMode: boolean;
    onToggleRandom: (checked: boolean) => void;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({
    currentQuestionIndex,
    totalQuestions,
    score,
    answeredCount,
    isRandomMode,
    onToggleRandom,
}) => {

    const successRate = answeredCount > 0
        ? Math.round((score / answeredCount) * 100)
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

                <FormControlLabel
                    control={
                        <Switch
                            checked={isRandomMode}
                            onChange={(e) => onToggleRandom(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Random Mode"
                />
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