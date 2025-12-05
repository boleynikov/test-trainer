import React from 'react';
import { Card, CardContent, Typography, Button, Stack, Box } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { type Question } from '../types';

interface QuestionCardProps {
    question: Question;
    selectedOptionId: string | null;
    tempSelectedOptionId: string | null; // New prop for selected option before final submission
    isAnswered: boolean;
    onOptionSelect: (id: string) => void;
    onSubmitAnswer: () => void; // New prop for submitting the answer
    onNext: () => void;
    isLastQuestion: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    selectedOptionId,
    isAnswered,
    onOptionSelect,
    onNext,
    isLastQuestion,
    tempSelectedOptionId,
    onSubmitAnswer
}) => {

    // Допоміжна функція для визначення кольору кнопки
    const getButtonState = (optionId: string) => {
        let color: "primary" | "success" | "error" | "info" = "primary";
        let variant: "outlined" | "contained" = "outlined";
        let icon = null;

        if (isAnswered) {
            if (optionId === question.correctOptionId) {
                color = "success";
                variant = "contained";
                icon = <CheckCircle />;
            } else if (optionId === selectedOptionId) {
                color = "error";
                variant = "contained";
                icon = <Cancel />;
            } else {
                // Other non-selected, non-correct options after answer
                variant = "outlined";
                color = "primary";
            }
        } else {
            // Before answer is submitted
            if (optionId === tempSelectedOptionId) {
                color = "info"; // Highlight temporarily selected option
                variant = "contained";
            } else {
                variant = "outlined";
                color = "primary";
            }
        }

        return { color, variant, icon };
    };

    return (
        <Card elevation={3} sx={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                    {question.text}
                </Typography>

                <Stack spacing={2}>
                    {question.options.map((option) => {
                        const { color, variant, icon } = getButtonState(option.id);

                        return (
                            <Button
                                key={option.id}
                                variant={variant}
                                onClick={() => onOptionSelect(option.id)}
                                disabled={isAnswered}
                                fullWidth
                                endIcon={icon}
                                sx={(theme) => ({
                                    justifyContent: 'flex-start',
                                    textAlign: 'left',
                                    py: 1.5,
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    borderColor: isAnswered && variant === 'outlined' ? theme.palette.divider : undefined,
                                    color: `${theme.palette[color].main} !important`,
                                })}
                            >
                                {option.text}
                            </Button>
                        );
                    })}
                </Stack>
            </CardContent>

            {/* Футер з кнопкою "Відповісти" або "Далі" */}
            <Box sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                {!isAnswered && tempSelectedOptionId && (
                    <Button variant="contained" size="large" onClick={onSubmitAnswer}>
                        Відповісти
                    </Button>
                )}
                {isAnswered && (
                    <Button variant="contained" size="large" onClick={onNext}>
                        {isLastQuestion ? "Завершити тест" : "Наступне питання"}
                    </Button>
                )}
            </Box>
        </Card>
    );
}