
export type Mode = 'light' | 'dark';

export const getDesignTokens = (mode: Mode) => ({
    palette: {
        mode,
        ...(mode === 'light'
            ? {
                primary: {
                    main: '#4F46E5',
                    light: '#818cf8',
                    dark: '#3730a3',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#10B981',
                },
                info: {
                    main: '#FEE2E2',
                },
                error: {
                    main: '#EF4444', // Red 500
                    light: '#FEE2E2',
                    dark: '#B91C1C',
                    contrastText: '#ffffff',
                },
                success: {
                    main: '#10B981', // Emerald 500
                    light: '#D1FAE5',
                    dark: '#047857',
                    contrastText: '#ffffff',
                },
                background: {
                    default: '#F3F4F6',
                    paper: '#FFFFFF',
                },
                text: {
                    primary: '#111827',
                    secondary: '#6B7280',
                },
            }
            : {
                primary: {
                    main: '#818cf8',
                    light: '#a5b4fc',
                    dark: '#3730a3',
                    contrastText: '#ffffff',
                },
                secondary: {
                    main: '#34D399',
                },
                info: {
                    main: '#FEE2E2',
                },
                error: {
                    main: '#F87171', // Red 400
                    light: '#FECACA',
                    dark: '#991B1B',
                    contrastText: '#000000',
                },
                success: {
                    main: '#34D399', // Emerald 400
                    light: '#A7F3D0',
                    dark: '#064E3B',
                    contrastText: '#000000',
                },
                background: {
                    default: '#121212',
                    paper: '#1e1e1e',
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
                    backgroundImage: 'none',
                    boxShadow: mode === 'light'
                        ? '0px 4px 20px rgba(0, 0, 0, 0.05)'
                        : '0px 4px 20px rgba(0, 0, 0, 0.3)',
                    border: mode === 'light'
                        ? '1px solid rgba(0,0,0,0.05)'
                        : '1px solid rgba(255,255,255,0.05)',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                    backgroundImage: 'none',
                }
            }
        }
    },
});