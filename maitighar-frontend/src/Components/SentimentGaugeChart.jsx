import { useState, useEffect } from "react";
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from "@mui/x-charts/Gauge";
import { Typography, Box, useTheme, useMediaQuery } from "@mui/material";
import issueService from "../services/issues";

function GaugePointer() {
  const { valueAngle, outerRadius, cx, cy } = useGaugeState();

  if (valueAngle === null) {
    return null;
  }

  const target = {
    x: cx + outerRadius * Math.sin(valueAngle),
    y: cy - outerRadius * Math.cos(valueAngle),
  };

  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill="#2196f3"
      />
      <path
        d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
        stroke="#2196f3"
        strokeWidth={2.5}
      />
    </g>
  );
}

function SentimentGauge() {
  const [sentimentData, setSentimentData] = useState({
    averageScore: 0,
    totalIssues: 0,
    distribution: { negative: 0, neutral: 0, positive: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  useEffect(() => {
    const fetchSentimentData = async () => {
      try {
        setIsLoading(true);
        const issues = await issueService.getAll();
        let totalScore = 0;
        const sentimentCounts = { negative: 0, neutral: 0, positive: 0 };

        issues.forEach((issue) => {
          totalScore += issue.sentimentScore;
          sentimentCounts[issue.sentiment.toLowerCase()]++;
        });

        const averageScore = issues.length > 0 ? totalScore / issues.length : 0;
        const normalizedScore = ((averageScore + 1) / 2) * 100;

        setSentimentData({
          averageScore: normalizedScore,
          totalIssues: issues.length,
          distribution: sentimentCounts,
        });
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching sentiment data:", error);
        setIsLoading(false);
      }
    };

    fetchSentimentData();
  }, []);

  const getSentimentCategory = (score) => {
    if (score < 33) return { emoji: "😠", text: "Negative", color: "#ef5350" };
    if (score < 66) return { emoji: "😐", text: "Neutral", color: "#ffb74d" };
    return { emoji: "😊", text: "Positive", color: "#66bb6a" };
  };

  const arcSegments = [
    { value: 33, color: "#ef5350" }, // Red for negative
    { value: 33, color: "#ffb74d" }, // Orange for neutral
    { value: 34, color: "#66bb6a" }, // Green for positive
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
        <Typography>Loading sentiment analysis...</Typography>
      </Box>
    );
  }

  const sentiment = getSentimentCategory(sentimentData.averageScore);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        height: "100%",
      }}
    >
      <GaugeContainer
        width={isMobile ? 200 : 250}
        height={isMobile ? 120 : 150}
        startAngle={-90}
        endAngle={90}
        value={sentimentData.averageScore}
      >
        {arcSegments.map((segment, index) => (
          <GaugeReferenceArc
            key={index}
            value={segment.value}
            color={segment.color}
            opacity={0.2}
          />
        ))}
        <GaugeValueArc color={sentiment.color} />
        <GaugePointer />
      </GaugeContainer>

      <Box sx={{ mt: 1, textAlign: "center" }}>
        <Typography
          variant="h3"
          color={sentiment.color}
          sx={{ mb: 0.5 }}
        >
          {sentiment.emoji}
        </Typography>
        <Typography
          variant="subtitle1"
          color={sentiment.color}
          sx={{ fontWeight: "bold" }}
        >
          {sentiment.text}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Average: {sentimentData.averageScore.toFixed(1)}%
        </Typography>
      </Box>

      <Box sx={{ mt: 1, width: "100%", maxWidth: 300 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 1,
            p: 1,
            bgcolor: "background.default",
            borderRadius: 2,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              color="#ef5350"
            >
              😡
            </Typography>
            <Typography
              variant="body2"
              color="#ef5350"
            >
              {sentimentData.distribution.negative}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              color="#ffb74d"
            >
              😐
            </Typography>
            <Typography
              variant="body2"
              color="#ffb74d"
            >
              {sentimentData.distribution.neutral}
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography
              variant="h5"
              color="#66bb6a"
            >
              😊
            </Typography>
            <Typography
              variant="body2"
              color="#66bb6a"
            >
              {sentimentData.distribution.positive}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default SentimentGauge;
