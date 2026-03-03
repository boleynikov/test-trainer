import React from "react";
import { Box, Typography } from "@mui/material";
import { type Question } from "../types";

interface HintBoxProps {
  question: Question;
}

export const HintBox: React.FC<HintBoxProps> = ({ question }) => {
  const renderHintContent = () => {
    switch (question.type) {
      case "yes-no-statements":
      case "statements-match":
        if (!question.correctStatementAnswers || !question.statements)
          return null;
        return (
          <Box>
            {question.statements.map((stmt) => {
              const correctOptionId =
                question.correctStatementAnswers?.[stmt.id];
              const option = stmt.options.find((o) => o.id === correctOptionId);
              return (
                <Typography key={stmt.id} variant="body2">
                  <strong>{stmt.text}:</strong> {option?.text || "Невідомо"}
                </Typography>
              );
            })}
          </Box>
        );

      case "dnd-zones":
        if (
          !question.correctZoneAnswers ||
          !question.dndOptions ||
          !question.zones
        )
          return null;
        return (
          <Box>
            {question.zones.map((zone) => {
              // Дістаємо ID правильної опції напряму з об'єкта за ID зони
              const correctOptionId = question.correctZoneAnswers?.[zone.id];

              // Знаходимо текст цієї опції
              const optionText = correctOptionId
                ? question.dndOptions?.find((o) => o.id === correctOptionId)
                    ?.text
                : null;

              return (
                <Typography key={zone.id} variant="body2">
                  <strong>{zone.title}:</strong> {optionText || "Немає"}
                </Typography>
              );
            })}
          </Box>
        );

      case "dnd":
        if (!question.correctOrder || !question.dndOptions) return null;
        return (
          <Box>
            {question.correctOrder.map((optId, index) => {
              const option = question.dndOptions?.find((o) => o.id === optId);
              return (
                <Typography key={optId} variant="body2">
                  {index + 1}. {option?.text}
                </Typography>
              );
            })}
          </Box>
        );

      default:
        // Single or multi select
        if (question.isMultiSelect) {
          if (
            !question.correctOptionIds ||
            question.correctOptionIds.length === 0
          )
            return null;
          return (
            <Box>
              {question.correctOptionIds.map((optId) => {
                const option = question.options.find((o) => o.id === optId);
                return (
                  <Typography key={optId} variant="body2">
                    • {option?.text}
                  </Typography>
                );
              })}
            </Box>
          );
        } else {
          if (!question.correctOptionId) return null;
          const option = question.options.find(
            (o) => o.id === question.correctOptionId,
          );
          return <Typography variant="body2">{option?.text}</Typography>;
        }
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: "info.light",
        color: "info.contrastText",
        p: 2,
        boxShadow: "0 -4px 6px -1px rgb(0 0 0 / 0.1)",
        zIndex: 1000,
        maxHeight: "30vh",
        overflowY: "auto",
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
        Правильна відповідь:
      </Typography>
      {renderHintContent()}
    </Box>
  );
};
