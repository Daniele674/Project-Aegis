import { Box, IconButton, useTheme, Menu, MenuItem } from "@mui/material";
import React, { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { OrgContext } from "../../components/OrgContext";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const { org, setOrg } = useContext(OrgContext);
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  const handleClick = (event) => {
    setAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setAnchor(null);
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px">
        {/* Box vuoto per allineamento */}
      </Box>
      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton>
          <NotificationsOutlinedIcon />
        </IconButton>
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>
        <IconButton onClick={handleClick}>
          <PersonOutlinedIcon />
        </IconButton>
        <Menu
          anchorEl={anchor}
          open={open}
          onClose={handleClose}
          sx={{ '& .MuiPaper-root': { backgroundColor: colors.primary[500] } }}
        >
          {/* --- MODIFICHE QUI --- */}
          {/* Usa i valori MSP ID corretti che corrispondono al chaincode */}
          <MenuItem sx={{ color: colors.greenAccent[500] }} onClick={() => { setOrg("Org1MSP"); handleClose(); }}>
            ORG1MSP
          </MenuItem>
          <MenuItem sx={{ color: colors.greenAccent[500] }} onClick={() => { setOrg("Org2MSP"); handleClose(); }}>
            ORG2MSP
          </MenuItem>
          <MenuItem sx={{ color: colors.greenAccent[500] }} onClick={() => { setOrg("Org3MSP"); handleClose(); }}>
            ORG3MSP
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;
