export type AnswerOption = {
    id: string;
    text: string;
}

export type Question = {
    id: number;
    text: string;
    options: AnswerOption[];
    correctOptionId: string;
    explanation?: string; // Опціонально: пояснення чому так
}