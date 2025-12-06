import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, Typography, Button, Stack, Box, Grid, useTheme } from '@mui/material';
import type { AnswerOption, Question } from '../types';

interface DragAndDropQuestionProps {
    question: Question;
    onSubmitAnswer: (pointsEarned: number) => void;
    onNext: () => void;
    isLastQuestion: boolean;
}

const DragAndDropQuestion: React.FC<DragAndDropQuestionProps> = ({ question, onSubmitAnswer, onNext, isLastQuestion }) => {
    const [unassignedOptions, setUnassignedOptions] = useState<AnswerOption[]>([]);
    const [zoneAnswers, setZoneAnswers] = useState<Record<string, AnswerOption[]>>({});
    const [isAnswered, setIsAnswered] = useState(false);
    const [optionStatus, setOptionStatus] = useState<Record<string, 'correct' | 'incorrect'>>({});

    const theme = useTheme();

    useEffect(() => {

        // Initialize state when question changes
        setUnassignedOptions(question.dndOptions || []);

        const initialZoneAnswers: Record<string, AnswerOption[]> = {};
        if (question.zones) {
            question.zones.forEach(zone => {
                initialZoneAnswers[zone.id] = [];
            });
        } else if (question.type === 'dnd') {
            // For simple dnd, we can use a single zone for placed items
            initialZoneAnswers['dnd-list'] = [];
        }

        setZoneAnswers(initialZoneAnswers);
        setIsAnswered(false);
        setOptionStatus({});
    }, [question]);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination || isAnswered) {
            return;
        }

        const { source, destination } = result;
        const sourceId = source.droppableId;
        const destinationId = destination.droppableId;

        // Create copies of state arrays
        const newZoneAnswers = JSON.parse(JSON.stringify(zoneAnswers));
        let newUnassignedOptions = [...unassignedOptions];

        // Find the dragged item
        let draggedItem: AnswerOption | undefined;
        if (sourceId === 'unassigned') {
            draggedItem = newUnassignedOptions.splice(source.index, 1)[0];
        } else {
            draggedItem = newZoneAnswers[sourceId].splice(source.index, 1)[0];
        }

        // If item is not found, do nothing.
        if (!draggedItem) return;

        // Handle case where destination zone already has an item for 'dnd-zones' type
        if (question.type === 'dnd-zones' && destinationId !== 'unassigned' && newZoneAnswers[destinationId] && newZoneAnswers[destinationId].length > 0) {
            const existingItem = newZoneAnswers[destinationId].splice(0, 1)[0];
            newUnassignedOptions.push(existingItem); // Move existing item back to unassigned
        }

        // Add the item to the destination
        if (destinationId === 'unassigned') {
            newUnassignedOptions.splice(destination.index, 0, draggedItem);
        } else {
            if (!newZoneAnswers[destinationId]) {
                newZoneAnswers[destinationId] = [];
            }

            // For 'dnd-zones' ensure only one item per zone
            if (question.type === 'dnd-zones') {
                newZoneAnswers[destinationId] = [draggedItem];
            } else {
                newZoneAnswers[destinationId].splice(destination.index, 0, draggedItem);
            }
        }

        // Update state
        setUnassignedOptions(newUnassignedOptions);
        setZoneAnswers(newZoneAnswers);
    };

    const handleSubmitAnswer = () => {

        setIsAnswered(true);

        let pointsEarned = 0;
        const newOptionStatus: Record<string, 'correct' | 'incorrect'> = {};

        if (question.type === 'dnd-zones') {
            const correctAnswers = question.correctZoneAnswers || {};
            Object.keys(zoneAnswers).forEach(zoneId => {
                zoneAnswers[zoneId].forEach(option => {
                    if (correctAnswers[option.id] === zoneId) {
                        newOptionStatus[option.id] = 'correct';
                        pointsEarned++;
                    } else {
                        newOptionStatus[option.id] = 'incorrect';
                    }
                });
            });

            // Also mark as incorrect any correct options that were not placed.
            Object.keys(correctAnswers).forEach(optionId => {
                if (!newOptionStatus[optionId]) {
                    newOptionStatus[optionId] = 'incorrect';
                }
            });

        } else if (question.type === 'dnd') {
            const placedItems = zoneAnswers['dnd-list'] || [];
            const currentOrder = placedItems.map(option => option.id);
            const isCorrectOrder = JSON.stringify(currentOrder) === JSON.stringify(question.correctOrder);

            if (isCorrectOrder) {
                pointsEarned = 1;
                placedItems.forEach(option => { newOptionStatus[option.id] = 'correct'; });
            } else {
                placedItems.forEach((option, index) => {
                    if (question.correctOrder && question.correctOrder[index] === option.id) {
                        newOptionStatus[option.id] = 'correct';
                    } else {
                        newOptionStatus[option.id] = 'incorrect';
                    }
                });
            }
        }

        setOptionStatus(newOptionStatus);
        onSubmitAnswer(pointsEarned);
    };

    const getBoxStyle = (optionId: string) => {
        const style = {
            p: 2,
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            color: theme.palette.text.primary
        };

        if (isAnswered) {
            const status = optionStatus[optionId];
            if (status === 'correct') {
                style.backgroundColor = `${theme.palette.success.main}`;
                style.color = theme.palette.success.contrastText;
            } else if (status === 'incorrect') {
                style.backgroundColor = `${theme.palette.error.main}`;
                style.color = theme.palette.error.contrastText;
            }
        }
        return style;
    };

    const renderDraggableOption = (option: AnswerOption, index: number) => (
        <Draggable key={option.id} draggableId={option.id} index={index} isDragDisabled={isAnswered}>
            {(provided) => (
                <Box
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    sx={getBoxStyle(option.id)}
                >
                    {option.text}
                </Box>
            )}
        </Draggable>
    );

    const renderDroppableZone = (id: string, children: React.ReactNode, title?: string) => (
        <>
            {title && <Typography variant="h6">{title}</Typography>}
            <Droppable droppableId={id} isDropDisabled={!!(isAnswered || (question.type === 'dnd-zones' && id !== 'unassigned' && zoneAnswers[id]?.length > 0 && React.Children.count(children) > 0))}>
                {(provided, snapshot) => (
                    <Stack
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        spacing={2}
                        sx={{
                            mt: 2,
                            p: 2,
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            backgroundColor: snapshot.isDraggingOver ? '#e0e0e0' : theme.palette.background.default,
                            minHeight: '100px',
                        }}
                    >
                        {children}
                        {provided.placeholder}
                    </Stack>
                )}
            </Droppable>
        </>
    );

    const renderDndContent = () => {
        if (question.type === 'dnd-zones') {
            return (
                <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                        {renderDroppableZone("unassigned", unassignedOptions.map(renderDraggableOption), "Options")}
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <Grid container spacing={2}>
                            {question.zones?.map(zone => (
                                <Grid size={{ xs: 12 }} key={zone.id}>
                                    {renderDroppableZone(zone.id, zoneAnswers[zone.id]?.map(renderDraggableOption), zone.title)}
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            )
        }

        // Default 'dnd' type
        return (
            <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                    {renderDroppableZone("unassigned", unassignedOptions.map(renderDraggableOption), "Options")}
                </Grid>
                <Grid size={{ xs: 6 }}>
                    {renderDroppableZone("dnd-list", (zoneAnswers['dnd-list'] || []).map(renderDraggableOption), "Your Order")}
                </Grid>
            </Grid>
        )
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5">{question.text}</Typography>
                <DragDropContext onDragEnd={onDragEnd}>
                    {renderDndContent()}
                </DragDropContext>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    {!isAnswered && (question.dndOptions?.length !== unassignedOptions.length || Object.values(zoneAnswers).some(arr => arr.length > 0)) && (
                        <Button onClick={handleSubmitAnswer} variant="contained" size="large">
                            Відповісти
                        </Button>
                    )}
                    {isAnswered && (
                        <Button onClick={onNext} variant="contained" size="large">
                            {isLastQuestion ? "Завершити тест" : "Наступне питання"}
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};


export default DragAndDropQuestion;
