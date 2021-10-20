import React from 'react';
import Link from '@mui/material/Link';
import Tooltip from '@mui/material/Tooltip';

const DefineLink = ({ children, definition }) => (
    <Tooltip disableFocusListener
             followCursor
             title={definition}>
        <Link className='define-link'>
            {children}
        </Link>
    </Tooltip>
);

export default DefineLink;
