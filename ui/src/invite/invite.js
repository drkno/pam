import React from 'react';
import Avatar from '@mui/material/Avatar';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/Drafts';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

import DefineLink from './define-link';
import OptionsButton from './options';
import Footer from './footer';

import PlexLogo from '../img/plex.svg';

import './invite.css';

const onAccept = (args) => {
    console.log('accepted');
    console.log(args);
};

const onDecline = () => {
    console.log('declined');
};

const PlexDefine = () => (
    <div className='plex-define'>
        <p>
            <img src={PlexLogo} alt='https://plex.tv' />
        </p>
        <p>
            Plex is a media streaming service. Users can stream and share their personal media libraries across their devices, over the internet and with others.
        </p>
    </div>
);

const InvitePage = ({ inviter, server }) => (
    <Container component='div' maxWidth='xs'>
        <Box container className='invite-vc'>
            <Box className='invite-con'>
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Plex Invitation
                </Typography>
                <Box component="form" noValidate sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={12}>
                            You have been invited by <b>{inviter}</b> to join the <DefineLink definition={<PlexDefine />}>Plex</DefineLink> server <b>{server}</b>. Do you want to accept the invite?
                        </Grid>
                    </Grid>
                    <OptionsButton inviter={inviter} onAccept={onAccept} />
                    <Grid container justifyContent="flex-end">
                        <Grid item>
                            <Link href='#' variant='body2' onClick={onDecline}>
                                Decline invite instead
                            </Link>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Box>
        <Footer />
    </Container>
);

export default InvitePage;
