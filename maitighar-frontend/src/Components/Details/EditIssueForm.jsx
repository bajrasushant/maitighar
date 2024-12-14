import { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

function EditIssueForm({ issue, onSubmit, onCancel }) {
  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ title, description });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ mt: 2 }}
    >
      <TextField
        fullWidth
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        margin="normal"
        required
        multiline
        rows={4}
      />
      <Box
        sx={{
          mt: 2,
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
        }}
      >
        <Button
          onClick={onCancel}
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
        >
          Save Changes
        </Button>
      </Box>
    </Box>
  );
}

export default EditIssueForm;
