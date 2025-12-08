import React from 'react';
import { Card, CardContent, Typography, Button, Stack, Box, FormControlLabel, Checkbox, Radio } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { type Question } from '../types';

interface QuestionCardProps {
    question: Question;
    selectedOptionIds: string[];
    tempSelectedOptionIds: string[]; // New prop for selected option before final submission
    isAnswered: boolean;
    onOptionSelect: (id: string) => void;
    onSubmitAnswer: () => void; // New prop for submitting the answer
    onNext: () => void;
    isLastQuestion: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    selectedOptionIds,
    isAnswered,
    onOptionSelect,
    onNext,
    isLastQuestion,
    tempSelectedOptionIds,
    onSubmitAnswer
}) => {
    // Допоміжна функція для визначення кольору та стану контрола
    const getControlState = (optionId: string) => {
        let color: "primary" | "success" | "error" | "secondary" = "primary";
        let icon = undefined;
        let checked = false;

        if (isAnswered) {
            const isCorrect = question.isMultiSelect
                ? (question.correctOptionIds || []).includes(optionId)
                : optionId === question.correctOptionId;

            if (isCorrect) {
                color = "success";
                icon = <CheckCircle />;
            } else if (selectedOptionIds.includes(optionId)) {
                color = "error";
                icon = <Cancel />;
            } else {
                color = "secondary";
            }
            checked = selectedOptionIds.includes(optionId) || isCorrect;
        } else {
            // Before answer is submitted
            checked = tempSelectedOptionIds.includes(optionId);
            color = checked ? "primary" : "secondary";
        }

        return { color, icon, checked };
    };

    const renderOption = (option: any) => {
        const { color, icon, checked } = getControlState(option.id);
        const control = question.isMultiSelect ? (
            <Checkbox
                checked={checked}
                onChange={() => onOptionSelect(option.id)}
                disabled={isAnswered}
                color={color}
                checkedIcon={icon}
            />
        ) : (
            <Radio
                checked={checked}
                onChange={() => onOptionSelect(option.id)}
                disabled={isAnswered}
                color={color}
                checkedIcon={icon}
            />
        );

        return (
            <FormControlLabel
                key={option.id}
                control={control}
                label={option.text}
                sx={(theme) => ({
                    border: 1,
                    borderColor: ['success', 'error'].includes(color) ? `${theme.palette[color].main} !important` : 'divider',
                    borderRadius: 1,
                    p: 1,
                    m: 0,
                    width: '100%',
                    '& .MuiFormControlLabel-label': {
                        width: '100%'
                    },
                    '& .Mui-disabled': {
                        color: ['success', 'error'].includes(color) ? `${theme.palette[color].main} !important` : undefined,
                    }
                })}
            />
        );
    };

    return (
        <Card elevation={3} sx={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3, whiteSpace: 'pre-line' }}>
                    {question.text}
                </Typography>

                <Stack spacing={2}>
                    {question.options.map(renderOption)}
                </Stack>
            </CardContent>

            {/* Футер з кнопкою "Відповісти" або "Далі" */}
            <Box sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                {!isAnswered && tempSelectedOptionIds.length > 0 && (
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