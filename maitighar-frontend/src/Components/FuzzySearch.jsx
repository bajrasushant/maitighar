import { useState, useEffect } from "react";
import {
  TextField,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogContent,
  DialogTitle,
  ListItemButton,
} from "@mui/material";
import axios from "axios";
import helpers from "../helpers/helpers";

function SearchIssues({ open, onClose, onIssueClick }) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState(":all");
  const [results, setResults] = useState([]);

  useEffect(() => {
    // Simulate fetching data based on searchQuery and mode
    const fetchData = async () => {
      // Replace this with your actual API call
      //
      if (!query.trim()) {
        setResults([]);
        return;
      }

      try {
        const config = helpers.getConfig();
        const response = await axios.get("/api/issues/search", {
          params: { query, mode },
          ...config,
        });
        console.log(response.data);
        setResults(response.data);
      } catch (error) {
        console.error("Search error:", error);
      }
    };

    if (query) {
      fetchData();
    }
  }, [query, mode]);

  const handleSearchChange = (event) => {
    setQuery(event.target.value);
  };

  const handleModeChange = (event) => {
    setMode(event.target.value);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>Search Issues and Comments</DialogTitle>
      <DialogContent>
        <TextField
          label="Search"
          value={query}
          onChange={handleSearchChange}
          fullWidth
        />
        <TextField
          select
          label="Mode"
          value={mode}
          onChange={handleModeChange}
          fullWidth
          SelectProps={{ native: true }}
        >
          <option value=":all">All</option>
          <option value=":issue">Issues</option>
          <option value=":comment">Comments</option>
        </TextField>
        <List>
          {mode === ":all" && results.issues && (
            <>
              <ListItem>
                <strong>Issues:</strong>
              </ListItem>
              {results.issues.map((issue) => (
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
              <ListItem>
                <strong>Comments:</strong>
              </ListItem>
              {results.comments.map((comment) => (
                <ListItemButton
                  key={comment.id}
                  onClick={() => onIssueClick(comment.issue)}
                >
                  <ListItemText primary={comment.description} />
                </ListItemButton>
              ))}
            </>
          )}

          {mode === ":issue" &&
            results.map((issue) => (
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
            results.map((comment) => (
              <ListItemButton
                key={comment.id}
                onClick={() => onIssueClick(comment.issue)}
              >
                <ListItemText primary={comment.description} />
              </ListItemButton>
            ))}
        </List>
      </DialogContent>
    </Dialog>
  );
}

export default SearchIssues;
