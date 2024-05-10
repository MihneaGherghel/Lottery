import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import CasinoIcon from '@mui/icons-material/Casino';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ConnectButton } from "web3uikit"

export default function Header() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <AppBar position="static">
            <Toolbar className={'flex justify-between'}>
                {isMobile ? (
                    <IconButton edge="start" color="white" aria-label="menu">
                        <CasinoIcon sx={{
                            color: 'white',
                            fontSize: '40px'
                        }} />
                    </IconButton>
                ) : (
                    <Typography variant="h6" component="div" >
                        Lottery
                    </Typography>
                )}
                <ConnectButton moralisAuth={false} />
            </Toolbar>
        </AppBar>
    );
}
