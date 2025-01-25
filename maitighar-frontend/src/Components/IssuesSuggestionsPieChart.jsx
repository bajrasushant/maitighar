import { useState, useEffect } from "react";
import axios from "axios";
import { PieChart } from "@mui/x-charts/PieChart";
import { Stack, Box, Typography, useTheme, useMediaQuery } from "@mui/material";
import issueService from "../services/issues";

function IssuesSuggestionsPieChart() {
  const [chartData, setChartData] = useState([]);
  const [categories, setCategories] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const categoriesResponse = await axios.get("/api/categories");
        const categoriesArray = categoriesResponse.data;

        const categoriesMap = categoriesArray.reduce((acc, category) => {
          acc[category._id] = category.name;
          return acc;
        }, {});

        setCategories(categoriesMap);

        const issuesResponse = await issueService.getAll();
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
    const totalIssues = data.filter((item) => item.type === "issue").length;
    const totalSuggestions = data.filter((item) => item.type === "suggestion").length;

    const uniqueCategoryIds = [...new Set(data.map((item) => item.category))];

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

  const series = [
    {
      innerRadius: 0,
      outerRadius: 80,
      cornerRadius: 5,
      cx: 150,
      cy: 150,
      data: chartData.total || [],
      valueFormatter: (item) =>
        `${item.value} (${((item.value / (chartData.total?.[0]?.value + chartData.total?.[1]?.value || 1)) * 100).toFixed(1)}%)`,
    },
    {
      innerRadius: 100,
      outerRadius: 120,
      cornerRadius: 5,
      cx: 150,
      cy: 150,
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

  if (isLoading) {
    return <Typography>Loading chart data...</Typography>;
  }

  if (error) {
    return <Typography color="error">Error loading chart data</Typography>;
  }

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        // justifyContent: "center",
        // alignContent: "center",
        alignItems: "center",
      }}
    >
      <PieChart
        series={series}
        width={300}
        height={300}
        slotProps={{
          legend: { hidden: true },
        }}
      />
    </Box>
  );
}

export default IssuesSuggestionsPieChart;
