import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box, Select, MenuItem, FormControl, Grid, useTheme } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import type { Question } from '../types';

interface SeveralStatementsQuestionProps {
    question: Question;
    onSubmitAnswer: (pointsEarned: number) => void;
    onNext: () => void;
    isLastQuestion: boolean;
}

const SeveralStatementsQuestion: React.FC<SeveralStatementsQuestionProps> = ({ question, onSubmitAnswer, onNext, isLastQuestion }) => {
    const [selectedStatementAnswers, setSelectedStatementAnswers] = useState<Record<string, string>>({});
    const [isAnswered, setIsAnswered] = useState(false);
    const [statementStatus, setStatementStatus] = useState<Record<string, 'correct' | 'incorrect' | 'unanswered'>>({});
    const theme = useTheme();

    useEffect(() => {
        // Initialize state when question changes
        const initialAnswers: Record<string, string> = {};
        question.statements?.forEach(statement => {
            initialAnswers[statement.id] = ''; // No selection
        });
        setSelectedStatementAnswers(initialAnswers);
        setIsAnswered(false);
        setStatementStatus({});
    }, [question]);

    const handleSelectChange = (statementId: string, value: string) => {
        if (isAnswered) return;
        setSelectedStatementAnswers(prev => ({
            ...prev,
            [statementId]: value,
        }));
    };

    const handleSubmit = () => {
        if (isAnswered) return;

        setIsAnswered(true);
        let pointsEarned = 0;
        const newStatementStatus: Record<string, 'correct' | 'incorrect' | 'unanswered'> = {};

        const correctAnswers = question.correctStatementAnswers || {};

        question.statements?.forEach(statement => {
            const selectedOptionId = selectedStatementAnswers[statement.id];
            const isCorrect = correctAnswers[statement.id] === selectedOptionId;

            if (selectedOptionId === '') {
                newStatementStatus[statement.id] = 'unanswered';
            } else if (isCorrect) {
                pointsEarned++;
                newStatementStatus[statement.id] = 'correct';
            } else {
                newStatementStatus[statement.id] = 'incorrect';
            }
        });

        setStatementStatus(newStatementStatus);
        onSubmitAnswer(pointsEarned);
    };

    const getMenuItemStyle = (statementId: string, optionId: string) => {
        if (!isAnswered) return {};

        const isSelected = selectedStatementAnswers[statementId] === optionId;
        const isCorrectOptionForStatement = question.correctStatementAnswers && question.correctStatementAnswers[statementId] === optionId;

        if (isSelected && isCorrectOptionForStatement) {
            return { backgroundColor: theme.palette.success.light, color: theme.palette.success.contrastText };
        } else if (isSelected && !isCorrectOptionForStatement) {
            return { backgroundColor: theme.palette.error.light, color: theme.palette.error.contrastText };
        } else if (!isSelected && isCorrectOptionForStatement) {
            return { backgroundColor: theme.palette.success.light, color: theme.palette.success.contrastText };
        }
        return {};
    };

    const getStatementBoxStyle = (statementId: string) => {
        if (!isAnswered) return { border: '1px solid #ccc' };

        const status = statementStatus[statementId];
        if (status === 'correct') {
            return { border: `1px solid ${theme.palette.success.main}` };
        } else if (status === 'incorrect') {
            return { border: `1px solid ${theme.palette.error.main}` };
        } else if (status === 'unanswered') {
            return { border: `1px solid ${theme.palette.warning.main}` };
        }
        return { border: '1px solid #ccc' };
    };

    const allStatementsAnswered = question.statements?.every(s => selectedStatementAnswers[s.id] !== '');

    return (
        <Card elevation={3} sx={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                    {question.text}
                </Typography>

                <Grid container spacing={2}>
                    {question.statements?.map(statement => (
                        <Grid size={{ xs: 12 }} key={statement.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            <Box sx={{ width: '40%', p: 1, borderRadius: 1, ...getStatementBoxStyle(statement.id) }}>
                                <Typography>{statement.text}</Typography>
                            </Box>
                            <FormControl sx={{ minWidth: 200, width: '60%' }} size="small" disabled={isAnswered}>
                                <Select
                                    labelId={`select-label-${statement.id}`}
                                    value={selectedStatementAnswers[statement.id]}
                                    onChange={(e) => handleSelectChange(statement.id, e.target.value as string)}
                                    sx={{
                                        '.MuiSelect-select': {
                                            textWrap: 'auto',
                                            whiteSpace: 'normal !important',
                                        }
                                    }}
                                >
                                    {statement.options?.map(option => (
                                        <MenuItem
                                            key={option.id}
                                            value={option.id}
                                            sx={getMenuItemStyle(statement.id, option.id)}
                                        >
                                            {option.text}
                                            {isAnswered && question.correctStatementAnswers && question.correctStatementAnswers[statement.id] === option.id && (
                                                <CheckCircle sx={{ ml: 1, color: theme.palette.success.main, fontSize: '1rem' }} />
                                            )}
                                            {isAnswered && selectedStatementAnswers[statement.id] === option.id && question.correctStatementAnswers && question.correctStatementAnswers[statement.id] !== option.id && (
                                                <Cancel sx={{ ml: 1, color: theme.palette.error.main, fontSize: '1rem' }} />
                                            )}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>

            <Box sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                {!isAnswered && allStatementsAnswered && (
                    <Button variant="contained" size="large" onClick={handleSubmit}>
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
};

export default SeveralStatementsQuestion;