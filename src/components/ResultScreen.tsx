import React from 'react';
import { Card, CardContent, Typography, Box, Button, Container } from '@mui/material';
import { Refresh } from '@mui/icons-material';

interface ResultScreenProps {
    score: number;
    totalQuestions: number;
    onRestart: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({ score, totalQuestions, onRestart }) => {
    const successRate = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    const isPassed = successRate >= 70; // Наприклад, поріг 70%

    return (
        <Container maxWidth="sm" sx={{ mt: 8, textAlign: 'center' }}>
            <Card elevation={4}>
                <CardContent sx={{ py: 5 }}>
                    <Typography variant="h4" gutterBottom>
                        Екзамен завершено!
                    </Typography>

                    <Box sx={{ my: 4 }}>
                        <Typography variant="h2" color={isPassed ? 'success.main' : 'error.main'} fontWeight="bold">
                            {successRate}%
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {isPassed ? 'Вітаємо, ви пройшли!' : 'Потрібно ще потренуватися.'}
                        </Typography>
                    </Box>

                    <Typography variant="body1" paragraph>
                        Правильних відповідей: <strong>{score}</strong> з <strong>{totalQuestions}</strong>
                    </Typography>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={onRestart}
                        startIcon={<Refresh />}
                        sx={{ mt: 2 }}
                    >
                        Спробувати ще раз
                    </Button>
                </CardContent>
            </Card>
        </Container>
    );
};