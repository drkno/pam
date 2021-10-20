import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

const OptionsDialog = ({ inviter, onAccept }) => {
    const [open, setOpen] = useState(false);
    const [applyNow, setApplyNow] = useState(true);
    const [applyLater, setApplyLater] = useState(true);

    const handleClickOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const handleAccept = () => {
        handleClose();
        onAccept({
            applyNow,
            applyLater
        });
    };
    const handleApplyNow = () => setApplyNow(!applyNow);
    const handleApplyLater = () => setApplyLater(!applyLater);

    return (
        <>
            <Button color='warning'
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    onClick={handleClickOpen}>
                Accept Invite
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Apply Recommended Settings?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Plex isn't always friendly to use, so {inviter} has created some recommended settings that you can apply to improve your experience.
                        
                        <FormControlLabel
                            control={<Checkbox checked={applyNow}
                                               onChange={handleApplyNow}
                                               value='applyNow' />}
                            label={<span>Apply recommended Plex settings?</span>}
                        />
                        
                    </DialogContentText>
                    <br />
                    <DialogContentText>
                        New versions of Plex can introduce new difficult to configure settings. If you would like, {inviter} can manage these changes for you in future. You can revoke this permission at any time.

                        <FormControlLabel
                            control={<Checkbox checked={applyLater}
                                               onChange={handleApplyLater}
                                               value='applyLater' />}
                            label={<span>Allow {inviter} to adjust your Plex settings after today?</span>}
                        />

                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleAccept}>Continue</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default OptionsDialog;
