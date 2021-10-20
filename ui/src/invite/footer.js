import React from 'react';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import './invite.css';

const Footer = () => (
    <Typography variant='body2'
                color='text.secondary'
                align='center'
                className='invite-css'
                sx={{ mt: 5 }}>
        <Link color="inherit" href="https://github.com/drkno/pam">
            Plex Account Manager
        </Link>
    </Typography>
);

export default Footer;
