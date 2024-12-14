import { useState, useEffect } from "react";
import axios from "axios";
import { PieChart } from "@mui/x-charts/PieChart";
import { Stack, Box, Typography } from "@mui/material";
import issueService from "../services/issues";

function IssuesSuggestionsPieChart() {
  const [chartData, setChartData] = useState([]);
  const [categories, setCategories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch categories first
        const categoriesResponse = await axios.get("/api/categories");
        const categoriesArray = categoriesResponse.data; // Use this directly

        const categoriesMap = categoriesArray.reduce((acc, category) => {
          acc[category._id] = category.name;
          return acc;
        }, {});

        console.log("Categories:", categoriesMap);
        setCategories(categoriesMap);

        // Fetch issues
        const issuesResponse = await issueService.getAll();

        // Process data for pie chart
        const processedData = processChartData(issuesResponse, categoriesMap);
        setChartData(processedData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setError(error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const processChartData = (data, categoriesMap) => {
    // Total counts
    const totalIssues = data.filter((item) => item.type === "issue").length;
    const totalSuggestions = data.filter((item) => item.type === "suggestion").length;

    // Get unique category IDs
    const uniqueCategoryIds = [...new Set(data.map((item) => item.category))];

    // Category breakdown
    const categoryCounts = uniqueCategoryIds.map((categoryId) => ({
      categoryName: categoriesMap[categoryId] || "Unknown Category",
      issues: data.filter((item) => item.type === "issue" && item.category === categoryId).length,
      suggestions: data.filter((item) => item.type === "suggestion" && item.category === categoryId)
        .length,
    }));

    return {
      total: [
        { label: "Issues", value: totalIssues },
        { label: "Suggestions", value: totalSuggestions },
      ],
      categories: categoryCounts,
    };
  };

  // Series for pie charts
  const series = [
    {
      innerRadius: 0,
      outerRadius: 80,
      id: "total-series",
      data: chartData.total || [],
      valueFormatter: (item) =>
        `${item.value} (${((item.value / (chartData.total?.[0]?.value + chartData.total?.[1]?.value || 1)) * 100).toFixed(1)}%)`,
    },
    {
      innerRadius: 100,
      outerRadius: 120,
      id: "category-series",
      data: chartData.categories
        ? [
            ...chartData.categories.map((cat) => ({
              label: `${cat.categoryName} Issues`,
              value: cat.issues,
            })),
            ...chartData.categories.map((cat) => ({
              label: `${cat.categoryName} Suggestions`,
              value: cat.suggestions,
            })),
          ]
        : [],
      valueFormatter: (item) =>
        `${item.value} (${((item.value / (chartData.total?.[0]?.value + chartData.total?.[1]?.value || 1)) * 100).toFixed(1)}%)`,
    },
  ];

  // Loading and error states
  if (isLoading) {
    return <Typography>Loading chart data...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error loading chart data</Typography>;
  }

  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 0, md: 4 }}
      sx={{ width: "100%" }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <PieChart
          series={series}
          width={500}
          height={400}
          slotProps={{
            legend: { hidden: true },
          }}
          // onItemClick={handleItemClick}
        />
      </Box>
      <Stack
        direction="column"
        sx={{ width: { xs: "100%", md: "40%" } }}
      />
    </Stack>
  );
}

export default IssuesSuggestionsPieChart;
