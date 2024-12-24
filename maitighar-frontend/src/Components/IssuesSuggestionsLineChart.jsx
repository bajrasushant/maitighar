import React, { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import issueService from "../services/issues";

function IssuesSuggestionsLineChart() {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true);
        const response = await issueService.getAll();
        setChartData(response);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setError(error);
        setIsLoading(false);
      }
    };
    fetchChartData();
  }, []);

  // Group data by day and count issues/suggestions
  const dailyData = chartData.reduce((acc, item) => {
    const date = new Date(item.createdAt);
    const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD format

    if (!acc[dateKey]) {
      acc[dateKey] = { issues: 0, suggestions: 0 };
    }

    if (item.type === "issue") {
      acc[dateKey].issues++;
    } else if (item.type === "suggestion") {
      acc[dateKey].suggestions++;
    }

    return acc;
  }, {});

  const sortedDailyData = Object.entries(dailyData)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, counts]) => ({
      date,
      issues: counts.issues,
      suggestions: counts.suggestions,
    }));

  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("default", {
      month: "short",
      day: "numeric",
    });
  };

  const issuesData = sortedDailyData.map((item) => item.issues);
  const suggestionsData = sortedDailyData.map((item) => item.suggestions);
  const dates = sortedDailyData.map((item) => formatDateLabel(item.date));

  if (isLoading) {
    return <div>Loading chart data...</div>;
  }

  if (error) {
    return <div>Error loading chart data. Please try again later.</div>;
  }

  if (sortedDailyData.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <LineChart
      width={isMobile ? 300 : 400}
      height={300}
      series={[
        { data: issuesData, label: "Issues", color: "#FF6384" },
        { data: suggestionsData, label: "Suggestions", color: "#36A2EB" },
      ]}
      xAxis={[{ scaleType: "point", data: dates, label: "Dates" }]}
      yAxis={[{ label: "Count" }]}
      sx={{
        ".MuiLineElement-root": { strokeWidth: 2 },
        ".MuiMarkElement-root": { strokeWidth: 2 },
      }}
    />
  );
}

export default IssuesSuggestionsLineChart;
