import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box, Radio, FormControlLabel, FormControl, Grid, useTheme, RadioGroup } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import type { Question } from '../types';

interface YesNoStatementQuestionProps {
    question: Question;
    onSubmitAnswer: (pointsEarned: number) => void;
    showSubmit: boolean;
}

const YesNoStatementQuestion: React.FC<YesNoStatementQuestionProps> = ({ question, onSubmitAnswer, showSubmit }) => {
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

    const handleRadioChange = (statementId: string, value: string) => {
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

    const getRadioColor = (statementId: string, optionValue: string) => {
        if (!isAnswered) return 'primary';

        const isSelected = selectedStatementAnswers[statementId] === optionValue;
        const isCorrectOptionForStatement = question.correctStatementAnswers &&
            question.correctStatementAnswers[statementId] === optionValue;

        if (isSelected && isCorrectOptionForStatement) {
            return 'success';
        } else if (isSelected && !isCorrectOptionForStatement) {
            return 'error';
        } else if (!isSelected && isCorrectOptionForStatement) {
            return 'success';
        }
        return 'primary';
    };

    const getStatementBoxStyle = (statementId: string) => {
        if (!isAnswered) return { border: '1px solid #ccc' };

        const status = statementStatus[statementId];
        if (status === 'correct') {
            return { border: `1px solid ${theme.palette.success.main}`, backgroundColor: `${theme.palette.success.light}20` }; // Light tint
        } else if (status === 'incorrect') {
            return { border: `1px solid ${theme.palette.error.main}`, backgroundColor: `${theme.palette.error.light}20` }; // Light tint
        } else if (status === 'unanswered') {
            return { border: `1px solid ${theme.palette.warning.main}`, backgroundColor: `${theme.palette.warning.light}20` }; // Light tint
        }
        return { border: '1px solid #ccc' };
    };

    const allStatementsAnswered = question.statements?.every(s => selectedStatementAnswers[s.id] !== '');

    return (
        <Card elevation={3} sx={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3, whiteSpace: 'pre-line' }}>
                    {question.text}
                </Typography>

                <Grid container spacing={2}>
                    {question.statements?.map(statement => (
                        <Grid size={{ xs: 12 }} key={statement.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1 }}>
                            <Box sx={{ width: '50%', p: 1, borderRadius: 1, ...getStatementBoxStyle(statement.id) }}>
                                <Typography sx={{ whiteSpace: 'pre-line' }}>{statement.text}</Typography>
                            </Box>

                            <FormControl disabled={isAnswered} sx={{ width: '50%', display: 'flex', alignItems: 'center' }}>
                                <RadioGroup
                                    value={selectedStatementAnswers[statement.id]}
                                    onChange={(e) => handleRadioChange(statement.id, e.target.value)}
                                    row // Makes radios appear horizontally
                                >
                                    {statement.options?.map(option => (
                                        <FormControlLabel
                                            key={option.id}
                                            value={option.id}
                                            sx={{ margin: { xs: '0px 4px', md: '0px 32px'} }}
                                            control={
                                                <Radio
                                                    color={getRadioColor(statement.id, option.id)}
                                                    checkedIcon={isAnswered && question.correctStatementAnswers &&
                                                        question.correctStatementAnswers[statement.id] === option.id ?
                                                        <CheckCircle /> : undefined}
                                                    icon={isAnswered && selectedStatementAnswers[statement.id] === option.id &&
                                                        question.correctStatementAnswers &&
                                                        question.correctStatementAnswers[statement.id] !== option.id ?
                                                        <Cancel /> : undefined}
                                                />
                                            }
                                            label={option.text}
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>
                        </Grid>
                    ))}
                </Grid>
            </CardContent>

            <Box sx={{ p: 2, bgcolor: 'background.default', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                {!isAnswered && showSubmit && allStatementsAnswered && (
                    <Button variant="contained" size="large" onClick={handleSubmit}>
                        Відповісти
                    </Button>
                )}
            </Box>
        </Card>
    );
};

export default YesNoStatementQuestion;