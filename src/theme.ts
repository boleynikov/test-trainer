
export type Mode = 'light' | 'dark';

export const getDesignTokens = (mode: Mode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                // Палітра для СВІТЛОЇ теми
                primary: {
                    main: '#4F46E5', // Indigo
                    light: '#818cf8',
                    dark: '#3730a3',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#10B981', // Emerald
                },
                background: {
                    default: '#F3F4F6', // Cool Gray
                    paper: '#FFFFFF',
                },
                text: {
                    primary: '#111827',
                    secondary: '#6B7280',
                },
            }
            : {
                // Палітра для ТЕМНОЇ теми
                primary: {
                    main: '#818cf8', // Світліший Indigo для кращого контрасту на темному
                    light: '#a5b4fc',
                    dark: '#3730a3',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#34D399',
                },
                background: {
                    default: '#121212', // Стандартний темний фон
                    paper: '#1e1e1e',   // Трохи світліший для карток
                },
                text: {
                    primary: '#e0e0e0',
                    secondary: '#a0a0a0',
                },
            }),
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: ['"Inter"', '"Roboto"', '"Helvetica"', 'Arial', 'sans-serif'].join(','),
        h4: { fontWeight: 700 },
        h5: { fontWeight: 600, lineHeight: 1.4 },
        button: { fontWeight: 600, textTransform: 'none' },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    paddingTop: 10,
                    paddingBottom: 10,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    // Тінь змінюється залежно від теми автоматично, але можна налаштувати
                    backgroundImage: 'none', // Прибираємо дефолтний оверлей у темній темі MUI
                    boxShadow: mode === 'light'
                        ? '0px 4px 20px rgba(0, 0, 0, 0.05)'
                        : '0px 4px 20px rgba(0, 0, 0, 0.3)',
                    border: mode === 'light'
                        ? '1px solid rgba(0,0,0,0.05)'
                        : '1px solid rgba(255,255,255,0.05)',
                },
            },
        },
    },
});