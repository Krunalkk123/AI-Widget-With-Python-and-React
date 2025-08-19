import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  ThemeProvider,
  createTheme,
  TextField
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ff9800" },
    secondary: { main: "#f44336" },
    background: { default: "#121212", paper: "#1f1f1f" },
  },
  typography: { fontFamily: "Poppins, system-ui, sans-serif" },
});

export default function App() {
  const [itemName, setItemName] = useState("Paneer Tikka Pizza");
  const [gptVersion, setGptVersion] = useState("gpt-3.5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = async () => {
    try {
      const res = await axios.get(`${API_BASE}/menu-items`);
      setMenuItems(res.data.items);
    } catch (err) {
      console.error(err);
    }
  };

  const addMenuItem = async (name) => {
    try {
      await axios.post(`${API_BASE}/menu-items`, { name });
      loadMenuItems();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add item");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);
    if (!itemName.trim()) {
      setError("Please enter a food item name.");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/generate-item-details`, {
        itemName: itemName.trim(),
        gptVersion,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          px: { xs: 2, sm: 3 },
          py: { xs: 3, sm: 4 },
          backgroundColor: "background.default",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "1100px",
            border: "3px solid #ff9800",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: 6,
            backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.75)),
              url('https://images.unsplash.com/photo-1600891964599-f61ba0e24092')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            minHeight: { xs: "360px", sm: "440px", md: "500px" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 2, sm: 6 },
          }}
        >
          <Container
            maxWidth="sm"
            sx={{
              backgroundColor: "rgba(30, 30, 30, 0.92)",
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              boxShadow: 5,
              width: "100%",
            }}
          >
            <Typography
              variant="h4"
              gutterBottom
              fontWeight="bold"
              sx={{
                fontSize: { xs: "1.8rem", sm: "2.4rem" },
                textAlign: "center",
                color: "#ffcc80",
              }}
            >
              AI Menu Intelligence
            </Typography>

            <Typography
              variant="body1"
              sx={{
                backgroundColor: "rgba(255, 152, 0, 0.15)",
                borderLeft: "5px solid #ff9800",
                padding: "10px 14px",
                borderRadius: 1,
                fontWeight: 600,
                color: "#ffcc80",
                fontSize: { xs: "1rem", sm: "1.1rem" },
                mb: 3,
                textAlign: "center",
              }}
            >
              Search or add a food item, then get a perfect upsell combo.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={submit} display="grid" gap={2}>
              <Autocomplete
                freeSolo
                options={menuItems}
                value={itemName}
                onInputChange={(e, newValue) => setItemName(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Search or Add Item" variant="filled" />
                )}
              />

              <Button
                variant="outlined"
                color="secondary"
                onClick={() => addMenuItem(itemName)}
              >
                ➕ Add New Item
              </Button>

              <FormControl variant="filled" fullWidth>
                <InputLabel>Model</InputLabel>
                <Select
                  value={gptVersion}
                  onChange={(e) => setGptVersion(e.target.value)}
                  sx={{ fontSize: "1.1rem" }}
                >
                  <MenuItem value="gpt-3.5">GPT-3.5 (simulated)</MenuItem>
                  <MenuItem value="gpt-4">GPT-4 (simulated)</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                type="submit"
                size="large"
                sx={{ fontWeight: "bold", py: 1.8, fontSize: "1.1rem" }}
                disabled={loading}
                // fullWidth
              >
                {loading ? <CircularProgress size={26} color="inherit" /> : "Generate ✨"}
              </Button>
            </Box>

            {result && (
              <Card
                sx={{
                  mt: 4,
                  backgroundColor: "#222",
                  border: "2px solid #ff9800",
                  boxShadow: 5,
                }}
              >
                <CardHeader
                  title="📜 Generated Result"
                  titleTypographyProps={{
                    fontSize: "1.4rem",
                    fontWeight: "bold",
                    color: "#ffcc80",
                  }}
                />
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ fontSize: "1.2rem", color: "#fff" }}
                  >
                    Description
                  </Typography>
                  <Typography
                    variant="body1"
                    mb={2}
                    sx={{ fontSize: "1.1rem", color: "#e0e0e0" }}
                  >
                    {result.description}
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ fontSize: "1.2rem", color: "#fff" }}
                  >
                    Upsell
                  </Typography>
                  <Typography
                    variant="body1"
                    mb={2}
                    sx={{ fontSize: "1.1rem", color: "#e0e0e0" }}
                  >
                    {result.upsell}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: "1rem" }}
                  >
                    Model used: {gptVersion}
                  </Typography>
                </CardContent>
              </Card>
            )}
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
