// import React from "react";
// import {
//   Card, CardContent, Typography, Box, Chip, Grid, IconButton, Button,
// } from "@mui/material";
// import { ArrowUpward, ArrowUpwardOutlined, Comment } from "@mui/icons-material";
// import { useUserValue } from "../../context/UserContext";
// import issueService from "../../services/issues";
// import MediaRenderer from "./MediaRenderer";
// import getDisplayUsername from "./utils";

// function IssueCard({
//   issue, setIssue, locationName, commentsCount,
// }) {
//   const currentUser = useUserValue();

//   const handleUpvote = async () => {
//     try {
//       const updatedIssue = await issueService.upvoteIssue(issue.id);
//       setIssue(updatedIssue);
//     } catch (err) {
//       console.error("Failed to upvote:", err);
//     }
//   };

//   return (
//     <Card>
//       <CardContent style={{ padding: "30px" }}>
//         <Grid>
//           <Grid
//             item
//             xs={11}
//           >
//             <Typography variant="h5">{issue.title}</Typography>
//             <Typography
//               variant="body2"
//               color="textSecondary"
//               sx={{ mt: 1 }}
//             >
//               Posted by {getDisplayUsername(issue.createdBy)}
//               on {new Date(issue.createdAt).toLocaleDateString()}
//             </Typography>

//             <Box
//               sx={{
//                 mt: 1,
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 1,
//               }}
//             >
//               <Chip
//                 label={issue.type}
//                 color={issue.type === "issue" ? "error" : "success"}
//                 size="small"
//               />
//               <Chip
//                 label={`Ward No. ${issue.assigned_ward}`}
//                 color="primary"
//                 variant="outlined"
//                 size="small"
//               />
//             </Box>

//             <Typography
//               variant="body1"
//               paragraph
//               sx={{ mt: 2 }}
//             >
//               {issue.description}
//             </Typography>

//             <Typography
//               variant="body2"
//               color="textSecondary"
//             >
//               Status: {issue.status} <br />
//               Location: {locationName.split(",").slice(0, 5).join(", ")}
//             </Typography>

//             {issue.imagePaths?.length > 0 && (
//               <div
//                 style={{
//                   marginTop: "20px",
//                   display: "flex",
//                 }}
//               >
//                 {issue.imagePaths.map((mediaPath, index) => (
//                   <MediaRenderer
//                     key={index}
//                     mediaPath={mediaPath}
//                   />
//                 ))}
//               </div>
//             )}

//             <Grid
//               item
//               sx={{
//                 mt: 1,
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 2,
//               }}
//             >
//               <Box
//                 display="flex"
//                 alignItems="center"
//               >
//                 <IconButton onClick={handleUpvote}>
//                   {issue.upvotedBy.includes(currentUser?.id) ? (
//                     <ArrowUpward color="primary" />
//                   ) : (
//                     <ArrowUpwardOutlined />
//                   )}
//                 </IconButton>
//                 <Typography>{issue.upvotes}</Typography>
//               </Box>
//               <Button startIcon={<Comment />}>{commentsCount} Comments</Button>
//             </Grid>
//           </Grid>
//         </Grid>
//       </CardContent>
//     </Card>
//   );
// }

// export default IssueCard;

import { Card, CardContent, Typography, Box, Chip, IconButton, Button } from "@mui/material";
import { ArrowUpward, ArrowUpwardOutlined, Comment } from "@mui/icons-material";
import { useUserValue } from "../../context/UserContext";
import issueService from "../../services/issues";
import MediaRenderer from "./MediaRenderer";
import getDisplayUsername from "./utils";

function IssueCard({ issue, setIssue, locationName, commentsCount }) {
  const currentUser = useUserValue();

  const handleUpvote = async () => {
    try {
      const updatedIssue = await issueService.upvoteIssue(issue.id);
      setIssue(updatedIssue);
    } catch (err) {
      console.error("Failed to upvote:", err);
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        {/* <Typography
          variant="caption"
          display="block"
          gutterBottom
        >
          {getDisplayUsername(issue.createdBy)} • {getTimeAgo(issue.createdAt)}
        </Typography> */}
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ mt: 1 }}
        >
          Posted by {getDisplayUsername(issue.createdBy)} on{" "}
          {new Date(issue.createdAt).toLocaleDateString()}
        </Typography>
        <Typography
          variant="h6"
          gutterBottom
        >
          {issue.title}
        </Typography>
        <Box
          sx={{
            mt: 1,
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
          variant="body2"
          color="text.secondary"
          sx={{ mt: 2, mb: 2 }}
        >
          {issue.description}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Status: {issue.status} <br />
          Location: {locationName.split(",").slice(0, 5).join(", ")}
        </Typography>
        {issue.imagePaths?.length > 0 && (
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
            {issue.imagePaths.map((mediaPath, index) => (
              <MediaRenderer
                key={index}
                mediaPath={mediaPath}
              />
            ))}
          </Box>
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mt: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              size="small"
              onClick={handleUpvote}
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
              color="action"
              sx={{ mr: 1, verticalAlign: "middle" }}
            />
            {commentsCount} comments
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default IssueCard;
