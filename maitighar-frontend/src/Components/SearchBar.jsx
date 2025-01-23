import { useState, useEffect } from "react";
import {
  Paper,
  InputBase,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Box,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  ClickAwayListener,
} from "@mui/material";
import { Search as SearchIcon, Close as CloseIcon } from "@mui/icons-material";
import axios from "axios";
import helpers from "../helpers/helpers";

const getTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)} yr.`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)} mon.`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)} day.`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)} hr.`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)} min.`;
  return `${Math.floor(seconds)}s`;
};

function SearchResults({ results, onIssueClick, handleClear, filterType, handleFilterChange }) {
  return (
    <Paper
      sx={{
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        mt: 0.5,
        maxHeight: "50vh",
        width: "100%",
        overflow: "auto",
        border: "1px solid",
        borderColor: "divider",
        zIndex: 1500,
        bgcolor: "background.paper",
      }}
      elevation={3}
    >
      <Box sx={{ p: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <ToggleButtonGroup
          value={filterType}
          exclusive
          onChange={(_, type) => handleFilterChange(type)}
          size="small"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="issues">Issues</ToggleButton>
          <ToggleButton value="comments">Comments</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <List sx={{ width: "100%" }}>
        {results.issues.map((issue) => (
          <ListItemButton
            key={issue.id}
            onClick={() => {
              onIssueClick(issue.id);
              handleClear();
            }}
            sx={{ borderRadius: 1 }}
          >
            <ListItemText
              primary={
                <>
                  <Box sx={{ display: "flex", gap: 1, mb: 0.3 }}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Issue • {getTimeAgo(issue.createdAt)} ago
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1">{issue.title}</Typography>
                </>
              }
              secondary={
                <Box sx={{ mt: 0.3 }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {issue.description}
                  </Typography>
                </Box>
              }
            />
          </ListItemButton>
        ))}
        {results.comments.map((comment) => (
          <ListItemButton
            key={comment.id}
            onClick={() => {
              onIssueClick(comment.issue);
              handleClear();
            }}
            sx={{ borderRadius: 1 }}
          >
            <ListItemText
              primary={
                <>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Comment • {getTimeAgo(comment.createdAt)} ago
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                    }}
                  >
                    {comment.description}
                  </Typography>
                </>
              }
            />
          </ListItemButton>
        ))}
      </List>
    </Paper>
  );
}

export default function SearchBar({ onIssueClick }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({ issues: [], comments: [] });
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");

  const handleSearchChange = (event) => {
    setQuery(event.target.value);
    setIsOpen(true);
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  const handleClear = () => {
    setQuery("");
    setResults({ issues: [], comments: [] });
    setIsOpen(false);
    setFilterType("all");
  };

  const handleClickAway = () => {
    setIsOpen(false);
  };

  const filterResults = () => {
    switch (filterType) {
      case "all":
        return results;
      case "issues":
        return { issues: results.issues, comments: [] };
      case "comments":
        return { issues: [], comments: results.comments };
      default:
        return results;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!query.trim()) {
        setResults({ issues: [], comments: [] });
        return;
      }

      try {
        const config = helpers.getConfig();
        const response = await axios.get("/api/issues/search", {
          params: { query, mode: ":all" },
          ...config,
        });
        setResults(response.data);
      } catch (error) {
        console.error("Search error:", error);
      }
    };

    const debounce = setTimeout(() => {
      if (query) {
        fetchData();
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  const showResults = isOpen && (results.issues.length > 0 || results.comments.length > 0);

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: "relative", width: "100%", maxWidth: 600 }}>
        <Paper
          component="form"
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            width: "100%",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            "&:hover": {
              borderColor: "primary.main",
            },
          }}
        >
          <IconButton
            sx={{ p: "10px" }}
            aria-label="search"
          >
            <SearchIcon />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search issues and comments"
            value={query}
            onChange={handleSearchChange}
          />
          {query && (
            <IconButton
              sx={{ p: "10px" }}
              aria-label="clear"
              onClick={handleClear}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Paper>

        {showResults && (
          <SearchResults
            results={filterResults()}
            onIssueClick={onIssueClick}
            handleClear={handleClear}
            filterType={filterType}
            handleFilterChange={handleFilterChange}
          />
        )}
      </Box>
    </ClickAwayListener>
  );
}
