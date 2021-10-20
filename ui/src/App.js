import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import InvitePage from './invite/invite';

const theme = createTheme();

const App = () => (
    <ThemeProvider theme={theme}>
        <Container component='main'>
            <CssBaseline />
            <InvitePage inviter='drkno'
                        server='Agent Smith' />
        </Container>
    </ThemeProvider>
);

export default App;
