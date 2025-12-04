import React from 'react';
import { Card, CardContent, Typography, Button, Stack, Box } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { type Question } from '../types';

interface QuestionCardProps {
    question: Question;
    selectedOptionId: string | null;
    isAnswered: boolean;
    onOptionSelect: (id: string) => void;
    onNext: () => void;
    isLastQuestion: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    selectedOptionId,
    isAnswered,
    onOptionSelect,
    onNext,
    isLastQuestion
}) => {

    // Допоміжна функція для визначення кольору кнопки
    const getButtonState = (optionId: string) => {
        let color: "primary" | "success" | "error" = "primary";
        let variant: "outlined" | "contained" = "outlined";
        let icon = null;

        if (isAnswered) {
            if (optionId === question.correctOptionId) {
                // Це правильна відповідь (завжди зелена)
                color = "success";
                variant = "contained";
                icon = <CheckCircle />;
            } else if (optionId === selectedOptionId) {
                // Це вибрана нами відповідь, і вона неправильна (бо правильна оброблена вище)
                color = "error";
                variant = "contained";
                icon = <Cancel />;
            }
        } else {
            // Поки не відповіли - підсвічуємо при наведенні або виборі (якщо потрібно)
            if (selectedOptionId === optionId) variant = "outlined";
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
                                // color={color}
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
                                    borderColor: isAnswered && variant === 'outlined' ? '#eee' : undefined,
                                    color: `${theme.palette[color].main} !important`,
                                })}
                            >
                                {option.text}
                            </Button>
                        );
                    })}
                </Stack>
            </CardContent>

            {/* Футер з кнопкою "Далі" з'являється тільки після відповіді */}
            {isAnswered && (
                <Box sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" size="large" onClick={onNext}>
                        {isLastQuestion ? "Завершити тест" : "Наступне питання"}
                    </Button>
                </Box>
            )}
        </Card>
    );
};