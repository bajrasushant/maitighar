import { useState, useEffect, useRef } from "react";
import {
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  Chip,
  Paper,
  InputAdornment,
  ClickAwayListener,
  IconButton,
  ListItemAvatar,
  Avatar,
} from "@mui/material";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import axios from "axios";
import helpers from "../helpers/helpers";

function SearchIssues({ onIssueClick }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState(0);
  const [results, setResults] = useState({ issues: [], comments: [] });
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!query.trim()) {
        setResults({ issues: [], comments: [] });
        return;
      }

      try {
        const config = helpers.getConfig();
        const response = await axios.get("/api/issues/search", {
          params: { query, mode },
          ...config,
        });
        setResults(response.data);
      } catch (error) {
        console.error("Search error:", error);
      }
    };

    if (query) {
      fetchData();
    }
  }, [query]);

  const handleSearchChange = (event) => {
    setQuery(event.target.value);
    setShowResults(true);
  };

  const handleClearSearch = () => {
    setQuery("");
    setResults({ issues: [], comments: [] });
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} years ago`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} months ago`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} days ago`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} hours ago`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} minutes ago`;
    return `${Math.floor(seconds)} seconds ago`;
  };

  return (
    <ClickAwayListener onClickAway={() => setShowResults(false)}>
      <Box
        ref={searchRef}
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
        }}
      >
        <TextField
          value={query}
          onChange={handleSearchChange}
          onFocus={() => setShowResults(true)}
          placeholder="Search issues and comments..."
          fullWidth
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
            endAdornment: query && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  sx={{ color: "text.secondary" }}
                >
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              bgcolor: "background.paper",
              "&:hover": {
                bgcolor: "action.hover",
              },
              borderRadius: 2,
              pr: 1,
            },
          }}
        />

        {showResults && (query || results.issues.length > 0 || results.comments.length > 0) && (
          <Paper
            elevation={6}
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              mt: 0.5,
              maxHeight: "80vh",
              overflowY: "auto",
              borderRadius: 2,
              bgcolor: "background.paper",
              zIndex: 1400,
            }}
          >
            <List sx={{ py: 0 }}>
              {results.issues.length > 0 && (
                <>
                  <ListItem sx={{ py: 1, bgcolor: "background.default" }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                    >
                      Issues
                    </Typography>
                  </ListItem>
                  {results.issues.map((issue) => (
                    <ListItem
                      key={issue.id}
                      button
                      onClick={() => {
                        onIssueClick(issue.id);
                        setShowResults(false);
                      }}
                      sx={{
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar
                          sx={{ bgcolor: issue.type === "issue" ? "error.main" : "success.main" }}
                        >
                          {issue.title.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body1"
                            noWrap
                          >
                            {issue.title}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 0.5 }}>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                            >
                              {issue.description.substring(0, 100)}...
                            </Typography>
                            <Box sx={{ mt: 0.5, display: "flex", alignItems: "center", gap: 1 }}>
                              <Chip
                                label={issue.type}
                                color={issue.type === "issue" ? "error" : "success"}
                                size="small"
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {getTimeAgo(issue.createdAt)}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </>
              )}

              {results.comments.length > 0 && (
                <>
                  <ListItem sx={{ py: 1, bgcolor: "background.default" }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                    >
                      Comments
                    </Typography>
                  </ListItem>
                  {results.comments.map((comment) => (
                    <ListItem
                      key={comment.id}
                      button
                      onClick={() => {
                        onIssueClick(comment.issue);
                        setShowResults(false);
                      }}
                      sx={{
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          {comment.description.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography
                            variant="body2"
                            color="text.primary"
                            noWrap
                          >
                            {comment.description}
                          </Typography>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {getTimeAgo(comment.createdAt)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </>
              )}

              {mode === ":issue" &&
                results.issues.map((issue) => (
                  <ListItemButton
                    key={issue.id}
                    onClick={() => onIssueClick(issue.id)}
                  >
                    <ListItemText
                      primary={issue.title}
                      secondary={issue.description}
                    />
                  </ListItemButton>
                ))}

              {mode === ":comment" &&
                results.comments.map((comment) => (
                  <ListItemButton
                    key={comment.id}
                    onClick={() => onIssueClick(comment.issue)}
                  >
                    <ListItemText primary={comment.description} />
                  </ListItemButton>
                ))}
            </List>
          </Paper>
        )}
      </Box>
    </ClickAwayListener>
  );
}

export default SearchIssues;
