import React from "react";
import { Box, Typography, Avatar, Chip, IconButton, Card, CardContent } from "@mui/material";
import { ArrowUpward, ArrowUpwardOutlined, Comment, Star } from "@mui/icons-material";

function FeaturedIssue({ issue, currentUser, handleUpvote, getDisplayUsername, getTimeAgo }) {
  if (!issue) return null;

  return (
    <Card
      elevation={3}
      sx={{
        mb: 4,
        border: "1px solid",
        borderColor: "primary.main",
        background: "linear-gradient(to right bottom, #ffffff, #f8f9ff)",
      }}
    >
      <CardContent>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          <Star color="primary" />
          <Typography
            variant="subtitle1"
            color="primary"
            fontWeight="medium"
          >
            Recent Activity
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              mr: 1,
              bgcolor: "primary.main",
            }}
          >
            {getDisplayUsername(issue.createdBy).charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle2">@{getDisplayUsername(issue.createdBy)}</Typography>
            <Typography
              variant="caption"
              color="text.secondary"
            >
              {getTimeAgo(issue.createdAt)}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Chip
            label={issue.type}
            color={issue.type === "issue" ? "error" : "success"}
            size="small"
          />
          <Chip
            label={`Ward No. ${issue.assigned_ward}`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>

        <Typography
          variant="h5"
          gutterBottom
        >
          {issue.title}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            mt: 2,
            mb: 2,
            display: "-webkit-box",
            overflow: "hidden",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            textOverflow: "ellipsis",
          }}
        >
          {issue.description}
        </Typography>

        {issue.imagePaths && issue.imagePaths.length > 0 && (
          <Box
            sx={{
              mt: 2,
              mb: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            {issue.imagePaths.map((mediaPath, index) => {
              if (
                mediaPath.endsWith(".mp4") ||
                mediaPath.endsWith(".mkv") ||
                mediaPath.endsWith(".avi")
              ) {
                return (
                  <video
                    key={index}
                    controls
                    style={{
                      maxWidth: "100%",
                    }}
                  >
                    <source
                      src={`http://localhost:3003/${mediaPath}`}
                      type={
                        mediaPath.endsWith(".mp4")
                          ? "video/mp4"
                          : mediaPath.endsWith(".mkv")
                            ? "video/x-matroska"
                            : "video/x-msvideo"
                      }
                    />
                    Your browser does not support the video tag.
                  </video>
                );
              }
              return (
                <img
                  key={index}
                  src={`http://localhost:3003/${mediaPath}`}
                  alt={`media ${index + 1}`}
                  style={{
                    maxWidth: "100%",
                    objectFit: "cover",
                  }}
                />
              );
            })}
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderTop: 1,
            borderColor: "divider",
            pt: 2,
            mt: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleUpvote(issue.id);
              }}
            >
              {issue.upvotedBy.includes(currentUser?.id) ? (
                <ArrowUpward
                  fontSize="small"
                  color="primary"
                />
              ) : (
                <ArrowUpwardOutlined fontSize="small" />
              )}
            </IconButton>
            <Typography variant="body2">{issue.upvotes}</Typography>
          </Box>
          <Typography variant="body2">
            <Comment
              fontSize="small"
              sx={{ mr: 1, verticalAlign: "middle" }}
            />
            {issue.comments ? issue.comments.length : 0} comments
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default FeaturedIssue;
