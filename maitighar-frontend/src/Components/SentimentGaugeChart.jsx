import { useState, useEffect } from "react";
import {
  GaugeContainer,
  GaugeValueArc,
  GaugeReferenceArc,
  useGaugeState,
} from "@mui/x-charts/Gauge";
import { Typography, Box } from "@mui/material";
import axios from "axios";
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
    distribution: {
      negative: 0,
      neutral: 0,
      positive: 0,
    },
  });
  const adminData = JSON.parse(localStorage.getItem("loggedAdmin"));
  const { token } = adminData;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSentimentData = async () => {
      try {
        setIsLoading(true);
        // Calculate sentiment statistics
        const issues = await issueService.getAll();
        let totalScore = 0;
        let sentimentCounts = {
          negative: 0,
          neutral: 0,
          positive: 0,
        };

        issues.forEach((issue) => {
          totalScore += issue.sentimentScore;
          sentimentCounts[issue.sentiment.toLowerCase()]++;
        });

        const averageScore = issues.length > 0 ? totalScore / issues.length : 0;
        // Convert from -1:1 range to 0:100 range
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
    if (score < 33) return { text: "Negative", color: "#ef5350" };
    if (score < 66) return { text: "Neutral", color: "#ffb74d" };
    return { text: "Positive", color: "#66bb6a" };
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
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <GaugeContainer
        width={300}
        height={200}
        startAngle={-150}
        endAngle={150}
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

      <Box sx={{ mt: 2, textAlign: "center" }}>
        <Typography
          variant="h5"
          color={sentiment.color}
        >
          {sentiment.text}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
        >
          Average Score: {sentimentData.averageScore.toFixed(1)}%
        </Typography>
      </Box>

      <Box sx={{ mt: 2, width: "100%" }}>
        <Typography
          variant="subtitle2"
          gutterBottom
        >
          Distribution ({sentimentData.totalIssues} total issues):
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", px: 2 }}>
          <Typography color="#ef5350">Negative: {sentimentData.distribution.negative}</Typography>
          <Typography color="#ffb74d">Neutral: {sentimentData.distribution.neutral}</Typography>
          <Typography color="#66bb6a">Positive: {sentimentData.distribution.positive}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default SentimentGauge;
