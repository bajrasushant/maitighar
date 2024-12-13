import React, { useState, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import issueService from "../services/issues";

function IssuesSuggestionsLineChart() {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
    // Parse the createdAt date
    const date = new Date(item.createdAt);
    const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD format

    // Initialize the day if not exists
    if (!acc[dateKey]) {
      acc[dateKey] = {
        issues: 0,
        suggestions: 0,
      };
    }

    // Increment count based on type
    if (item.type === "issue") {
      acc[dateKey].issues++;
    } else if (item.type === "suggestion") {
      acc[dateKey].suggestions++;
    }

    return acc;
  }, {});

  // Convert to array and sort
  const sortedDailyData = Object.entries(dailyData)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .map(([date, counts]) => ({
      date,
      issues: counts.issues,
      suggestions: counts.suggestions,
    }));

  // Format date labels to be more readable
  const formatDateLabel = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("default", {
      month: "short",
      day: "numeric",
    });
  };

  // Extract data for the chart
  const issuesData = sortedDailyData.map((item) => item.issues);
  const suggestionsData = sortedDailyData.map((item) => item.suggestions);
  const dates = sortedDailyData.map((item) => formatDateLabel(item.date));

  // Render loading or error states
  if (isLoading) {
    return (
      <div className="text-center py-4">
        <p>Loading chart data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>Error loading chart data. Please try again later.</p>
      </div>
    );
  }

  // If no data
  if (sortedDailyData.length === 0) {
    return (
      <div className="text-center py-4">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <LineChart
        width={550}
        height={400}
        series={[
          {
            data: issuesData,
            label: "Issues",
            color: "#FF6384",
            showMark: true,
          },
          {
            data: suggestionsData,
            label: "Suggestions",
            color: "#36A2EB",
            showMark: true,
          },
        ]}
        xAxis={[
          {
            scaleType: "point",
            data: dates,
            label: "Dates",
          },
        ]}
        yAxis={[
          {
            label: "Count",
          },
        ]}
        sx={{
          ".MuiLineElement-root": {
            strokeWidth: 3,
          },
          ".MuiMarkElement-root": {
            // stroke: "#fff",
            strokeWidth: 2,
          },
        }}
      />
    </div>
  );
}

export default IssuesSuggestionsLineChart;
