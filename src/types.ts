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
    type?: 'default' | 'dnd' | 'dnd-zones' | 'statements-match';
    correctOrder?: string[];
    dndOptions?: AnswerOption[];
    zones?: { id: string; title: string }[];
    correctZoneAnswers?: Record<string, string>;
    statements?: { id: string; text: string; options: AnswerOption[] }[];
    correctStatementAnswers?: Record<string, string>;
}