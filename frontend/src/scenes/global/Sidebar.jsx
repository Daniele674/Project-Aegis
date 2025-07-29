import { useState, useContext } from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import { tokens } from "../../theme";
import { OrgContext } from "../../components/OrgContext";

// Icon Imports
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlineOutlinedIcon from "@mui/icons-material/PieChartOutlineOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BuildCircleOutlinedIcon from '@mui/icons-material/BuildCircleOutlined';
import IntegrationInstructionsOutlinedIcon from '@mui/icons-material/IntegrationInstructionsOutlined';
import MailLockOutlinedIcon from '@mui/icons-material/MailLockOutlined';
import PodcastsOutlinedIcon from '@mui/icons-material/PodcastsOutlined';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';

// Componente Item migliorato per un routing più pulito
const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <MenuItem
      active={selected === title}
      style={{ color: colors.grey[100] }}
      onClick={() => setSelected(title)}
      icon={icon}
      // Modo raccomandato per integrare react-router-dom
      component={<Link to={to} />}
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};

const ProSidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const { org } = useContext(OrgContext); // Non serve 'setOrg' qui

  // Oggetto di mapping per i nomi "amichevoli". Più pulito di un ternario.
  const friendlyOrgNames = {
    'Org1MSP': 'Security Provider A',
    'Org2MSP': 'Security Provider B',
    'Org3MSP': 'Security Provider C',
  };

  return (
    <Box
      sx={{
        // Stili esistenti... (nessuna modifica qui)
        "& .ps-sidebar-container": { background: `${colors.primary[400]} !important` },
        "& .ps-menu-icon": { backgroundColor: "transparent !important" },
        "& .ps-menu-button": { padding: "5px 35px 5px 20px !important" },
        "& .ps-menu-button:hover": { color: "#868dfb !important" },
        "& .ps-menu-button.ps-active": { color: "#6870fa !important" },
      }}
    >
      <Sidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* LOGO AND MENU ICON */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  ADMIN
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {/* USER INFO */}
          {!isCollapsed && (
            <Box mb="25px">
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {/* CORREZIONE: Mostra direttamente il valore 'org' dal contesto */}
                  {org}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {/* Usa l'oggetto di mapping per un nome amichevole */}
                  {friendlyOrgNames[org] || 'Selected Organization'}
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>
            <Item
              title="Manage My Logs" // Titolo aggiornato per chiarezza
              to="/team"
              icon={<BuildCircleOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="All Logs" // Titolo aggiornato per chiarezza
              to="/contacts"
              icon={<InfoOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Pages
            </Typography>
            <Item
              title="Create Log" // Titolo aggiornato per chiarezza
              to="/form"
              icon={<IntegrationInstructionsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
             <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Messages
            </Typography>
            <Item
              title="Send Private Message" // Titolo aggiornato per chiarezza
              to="/private"
              icon={<MailLockOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Send Broadcast" // Titolo aggiornato per chiarezza
              to="/broadcast"
              icon={<PodcastsOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Private Inbox" // Titolo aggiornato per chiarezza
              to="/messages"
              icon={<MessageOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Broadcast Feed" // Titolo aggiornato per chiarezza
              to="/messages2"
              icon={<MessageOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Charts
            </Typography>
            <Item
              title="Bar Chart"
              to="/bar"
              icon={<BarChartOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Pie Chart"
              to="/pie"
              icon={<PieChartOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Line Chart"
              to="/line"
              icon={<TimelineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
      </Sidebar>
    </Box>
  );
};

export default ProSidebar;
