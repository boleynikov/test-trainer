export type AnswerOption = {
    id: string;
    text: string;
}

export type Question = {
    id: number;
    text: string;
    options: AnswerOption[];
    correctOptionId?: string;
    correctOptionIds?: string[];
    isMultiSelect?: boolean;
    explanation?: string;
    type?: 'default' | 'dnd' | 'dnd-zones';
    correctOrder?: string[];
    dndOptions?: AnswerOption[];
    zones?: { id: string; title: string }[];
    correctZoneAnswers?: Record<string, string>;
}