import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, Typography, Button, Stack, Box, Grid, useTheme, type SxProps } from '@mui/material';
import type { AnswerOption, Question } from '../types';

interface DragAndDropQuestionProps {
    question: Question;
    onSubmitAnswer: (pointsEarned: number) => void;
    showSubmit: boolean; // New prop
}

const DragAndDropQuestion: React.FC<DragAndDropQuestionProps> = ({ question, onSubmitAnswer, showSubmit }) => {
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
        // We use a Map or an object keyed by a unique identifier if possible.
        // Since we only have option.id, we map that status.
        const newOptionStatus: Record<string, 'correct' | 'incorrect'> = {};

        if (question.type === 'dnd-zones') {
            const correctAnswers = question.correctZoneAnswers || {};

            // Iterate through the zones where the user dropped items
            Object.keys(zoneAnswers).forEach(zoneId => {
                // Iterate through the options dropped in this specific zone
                zoneAnswers[zoneId].forEach(option => {

                    // FIX: Look up the Expected Option ID using the current Zone ID
                    const expectedOptionId = correctAnswers[zoneId];
                    const resultIsArray = Array.isArray(expectedOptionId);
                    // Compare the Expected Option ID with the Actual Dropped Option ID
                    if (!resultIsArray ? expectedOptionId === option.id : expectedOptionId.includes(option.id)) {
                        newOptionStatus[option.id] = 'correct';
                        pointsEarned++;
                    } else {
                        // Only mark as incorrect if it hasn't been marked correct elsewhere
                        // (handles cases where the same option ID is used multiple times)
                        if (newOptionStatus[option.id] !== 'correct') {
                            newOptionStatus[option.id] = 'incorrect';
                        }
                    }
                });
            });

        } else if (question.type === 'dnd') {
            const placedItems = zoneAnswers['dnd-list'] || [];
            const currentOrder = placedItems.map(option => option.id);

            // Check if the order strictly matches the correctOrder array
            const isCorrectOrder = JSON.stringify(currentOrder) === JSON.stringify(question.correctOrder);

            if (isCorrectOrder) {
                pointsEarned = 1; // Or whatever max points value is
                placedItems.forEach(option => {
                    newOptionStatus[option.id] = 'correct';
                });
            } else {
                placedItems.forEach((option, index) => {
                    // Check if the item at this specific index matches the correct answer at this index
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
        const style: SxProps = {
            p: 2,
            border: '1px solid #ccc',
            borderRadius: '4px',
            backgroundColor: 'white',
            color: "#000",
            overflowWrap: 'break-word',
            whiteSpace: 'pre-line'
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
                            backgroundColor: snapshot.isDraggingOver ? theme.palette.primary.light : theme.palette.background.default,
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
                <Typography variant="h5" sx={{ whiteSpace: 'pre-line' }}>{question.text}</Typography>
                <DragDropContext onDragEnd={onDragEnd}>
                    {renderDndContent()}
                </DragDropContext>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    {!isAnswered && showSubmit && (
                        <Button onClick={handleSubmitAnswer} variant="contained" size="large">
                            Відповісти
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
};


export default DragAndDropQuestion;
