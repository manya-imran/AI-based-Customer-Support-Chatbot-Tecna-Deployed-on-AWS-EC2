import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import '../styles/globals.css';  // Your global styles

// Define your custom theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',  // Customize primary color
        },
        secondary: {
            main: '#dc004e',  // Customize secondary color
        },
    },
});

function MyApp({ Component, pageProps }) {
    return (
        <ThemeProvider theme={theme}>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <Component {...pageProps} />
        </ThemeProvider>
    );
}

export default MyApp;
