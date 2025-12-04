import { CloudUpload } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import type { Mode } from '../theme';

type DataLoadModalProps = {
    mode: Mode;
    open: boolean;
    handleClose: () => void;
}

export const DataLoadModal: React.FC<DataLoadModalProps> = ({ open, mode, handleClose }: DataLoadModalProps) => {

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const result = e.target?.result;
                    if (typeof result === 'string') {
                        const json = JSON.parse(result);
                        console.log("Завантажені питання:", json);
                        alert(`Успішно завантажено ${json.length} питань (див. консоль)`);
                        // Тут ви можете викликати setQuestions(json) або передати дані в ExamSimulator
                        handleClose();
                    }
                } catch (error) {
                    alert("Помилка: Невірний формат JSON файлу");
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Завантаження питань</DialogTitle>
            <DialogContent>
                <DialogContentText paragraph>
                    Будь ласка, завантажте файл у форматі <code>.json</code>.
                </DialogContentText>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    Приклад структури файлу:
                </Typography>

                {/* Блок коду з прикладом */}
                <Box
                    component="pre"
                    sx={{
                        p: 2,
                        my: 2,
                        borderRadius: 2,
                        bgcolor: mode === 'light' ? '#f5f5f5' : '#2d2d2d',
                        color: mode === 'light' ? '#333' : '#e0e0e0',
                        overflowX: 'auto',
                        fontSize: '0.85rem',
                        border: 1,
                        borderColor: 'divider'
                    }}
                >
{`[
  {
    "correctOptionId": "opt2",
    "id": "1",
    "text": "Який тип компонента PCF слід використовувати для візуалізації?",
    "options": [
      { "id": "opt1", "text": "Standard Component" },
      { "id": "opt2", "text": "Dataset Component" },
      { "id": "opt3", "text": "Field Component" },
      { "id": "opt4", "text": "Service Component" }
    ]
  }, ...
]`}
                </Box>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Button
                        component="label"
                        variant="contained"
                        startIcon={<CloudUpload />}
                        size="large"
                    >
                        Вибрати файл JSON
                        <input
                            type="file"
                            hidden
                            accept=".json"
                            onChange={handleFileUpload}
                        />
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button onClick={handleClose} color="inherit">
                    Скасувати
                </Button>
            </DialogActions>
        </Dialog>
    )
}