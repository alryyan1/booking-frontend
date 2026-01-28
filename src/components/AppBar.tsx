import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  TextField,
  IconButton,
  Tooltip,
  InputAdornment,
} from "@mui/material";
import { EventAvailable, Close } from "@mui/icons-material";
import dayjs from "dayjs";

import { useState } from "react";
import ItemAvailabilityDialog from "./ItemAvailabilityDialog";

interface AppBarProps {
  drawerWidth: number;
  onDateChange?: (date: Date | null) => void;
}

interface User {
  name: string;
  username: string;
  role: string;
}

const AppBar = ({ drawerWidth, onDateChange }: AppBarProps) => {
  const { user } = useAuth() as { user: User | null };
  const location = useLocation();
  const [showAvailability, setShowAvailability] = useState(false);
  const [checkDate, setCheckDate] = useState<Date | null>(null);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path === "/bookings") return "All Bookings";
    if (path === "/customers") return "Client Management";
    if (path === "/reports") return "Performance Reports";
    if (path === "/users") return "Team & Access";
    if (path === "/inventory") return "Inventory Control";
    if (path === "/settings") return "System Settings";
    if (path.includes("/month/")) return "Booking Calendar";
    return "Booking System";
  };

  return (
    <MuiAppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        bgcolor: "background.paper",
        color: "text.primary",
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ height: 64 }}>
        <Typography
          variant="h5"
          component="div"
          sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: "-0.5px" }}
        >
          {getPageTitle()}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Availability Checker */}
          <Box>
            <TextField
              type="date"
              size="small"
              value={checkDate ? dayjs(checkDate).format("YYYY-MM-DD") : ""}
              onChange={(e) => {
                const dateVal = e.target.value
                  ? new Date(e.target.value)
                  : null;
                setCheckDate(dateVal);
                if (dateVal) {
                  setShowAvailability(true);
                  if (onDateChange) onDateChange(dateVal);
                } else {
                  if (onDateChange) onDateChange(null);
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "text.secondary",
                  "& fieldset": {
                    borderColor: "divider",
                  },
                  "&:hover fieldset": {
                    borderColor: "text.primary",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "primary.main",
                  },
                },
              }}
              InputProps={{
                endAdornment: checkDate ? (
                  <InputAdornment position="end">
                    <Tooltip title="Clear Date">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setCheckDate(null);
                          if (onDateChange) onDateChange(null);
                        }}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ) : null,
              }}
            />
            {checkDate && (
              <Tooltip title="View Availability">
                <IconButton
                  onClick={() => setShowAvailability(true)}
                  color="primary"
                  sx={{ ml: 1 }}
                >
                  <EventAvailable />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              pl: 1,
              cursor: "pointer",
              borderRadius: 2,
              p: 0.5,
              border: "1px solid black",
              minWidth: "150px",
              textAlign: "center",
              justifyContent: "center",
              "&:hover": { bgcolor: "grey.50" },
            }}
          >
            <Avatar
              sx={{
                bgcolor: "primary.light",
                color: "primary.main",
                fontWeight: "bold",
                width: 36,
                height: 36,
                fontSize: "0.9rem",
              }}
            >
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Box
              sx={{ textAlign: "left", display: { xs: "none", sm: "block" } }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: "0.85rem" }}
              >
                {user?.username}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ textTransform: "capitalize", fontSize: "0.75rem" }}
              >
                {user?.role}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Toolbar>

      <ItemAvailabilityDialog
        open={showAvailability}
        onClose={() => setShowAvailability(false)}
        date={checkDate}
      />
    </MuiAppBar>
  );
};

export default AppBar;
