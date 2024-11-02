import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Select, MenuItem, InputLabel, FormControl } from "@mui/material";
import axios from "axios";
import { useNotification } from "../context/NotificationContext";

const theme = createTheme();

export default function AdminRegister() {
  const [responsible, setResponsible] = useState("");
  const [department, setDepartment] = useState("");
  const [assignedProvince, setAssignedProvince] = useState("");
  const [assignedDistrict, setAssignedDistrict] = useState("");
  const [assignedLocalGov, setAssignedLocalGov] = useState("");
  const [assignedWard, setAssignedWard] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repassword, setRepassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setNotification } = useNotification();

  const [departmentsDd, setDepartmentsDd] = useState([]);
  const [provincesDd, setProvincesDd] = useState([]);
  const [districtsDd, setDistrictsDd] = useState([]);
  const [localGovsDd, setLocalGovsDd] = useState([]);
  const [wardsDd, setWardsDd] = useState([]);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await axios.get("/api/nepal/provinces");
        setProvincesDd(response.data);
      } catch (error) {
        console.error("Error fetching provinces:", error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    const fetchDistricts = async () => {
      if (assignedProvince) {
        try {
          const response = await axios.get(`/api/nepal/districts?provinceId=${assignedProvince}`);
          setDistrictsDd(response.data);
        } catch (error) {
          console.error("Error fetching districts:", error);
        }
      } else {
        setDistrictsDd([]);
      }
    };
    fetchDistricts();
  }, [assignedProvince]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          `/api/departments?provinceId=${assignedProvince}&unassigned=true`,
        );
        setDepartmentsDd(response.data);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, [assignedProvince]);

  useEffect(() => {
    const fetchLocalGovs = async () => {
      if (assignedDistrict) {
        try {
          const response = await axios.get(`/api/nepal/localgovs?districtId=${assignedDistrict}`);
          setLocalGovsDd(response.data);
        } catch (error) {
          console.error("Error fetching local governments:", error);
        }
      } else {
        setLocalGovsDd([]);
      }
    };
    fetchLocalGovs();
  }, [assignedDistrict]);

  useEffect(() => {
    const fetchWards = async () => {
      try {
        const response = await axios.get(`/api/wards`, {
          params: { localGovId: assignedLocalGov, unassigned: "true" },
        });
        setWardsDd(response.data);
      } catch (error) {
        console.error("Error fetching wards:", error);
      }
    };

    if (assignedLocalGov) {
      fetchWards();
    }
  }, [assignedLocalGov]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("/api/admins", {
        username,
        email,
        password,
        repassword,
        responsible,
        assignedProvince,
        assignedDistrict,
        assignedLocalGov: responsible === "ward" ? assignedLocalGov : undefined,
        assignedWard: responsible === "ward" ? assignedWard : undefined,
        assignedDepartment: responsible === "department" ? department : undefined,
      });
      setNotification({ message: "Admin registered successfully.", status: "success" });
      navigate("/admin-login");
    } catch (error) {
      setNotification({
        message: error.response?.data?.error || "Something went wrong. Please try again.",
        status: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container
        component="main"
        maxWidth="xs"
      >
        <CssBaseline />
        <Box
          sx={{
            display: "flex",
            marginTop: 8,
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }} />
          <Typography
            component="h1"
            variant="h5"
          >
            Sign up
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid
              container
              spacing={2}
            >
              {/* Username and Email Fields */}
              <Grid
                item
                xs={12}
              >
                <TextField
                  name="username"
                  required
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
              </Grid>
              <Grid
                item
                xs={12}
              >
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Grid>

              {/* Password Fields */}
              <Grid
                item
                xs={12}
              >
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Grid>
              <Grid
                item
                xs={12}
              >
                <TextField
                  required
                  fullWidth
                  name="repassword"
                  label="Repeat Password"
                  type="password"
                  value={repassword}
                  onChange={(e) => setRepassword(e.target.value)}
                />
              </Grid>

              {/* Responsible Selection */}
              <Grid
                item
                xs={12}
              >
                <FormControl fullWidth>
                  <InputLabel id="responsible-label">Responsible</InputLabel>
                  <Select
                    labelId="responsible-label"
                    id="responsible"
                    value={responsible}
                    onChange={(e) => setResponsible(e.target.value)}
                    label="Responsible"
                  >
                    <MenuItem value="ward">Ward</MenuItem>
                    <MenuItem value="department">Department</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Province Select */}
              <Grid
                item
                xs={12}
              >
                <FormControl fullWidth>
                  <InputLabel>Province</InputLabel>
                  <Select
                    value={assignedProvince}
                    onChange={(e) => setAssignedProvince(e.target.value)}
                    label="Province"
                  >
                    {provincesDd.map((prov) => (
                      <MenuItem
                        key={prov.id}
                        value={prov.id}
                      >
                        {prov.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* District Select */}
              <Grid
                item
                xs={12}
              >
                <FormControl fullWidth>
                  <InputLabel>District</InputLabel>
                  <Select
                    value={assignedDistrict}
                    onChange={(e) => setAssignedDistrict(e.target.value)}
                    label="District"
                  >
                    {districtsDd.map((dist) => (
                      <MenuItem
                        key={dist.id}
                        value={dist.id}
                      >
                        {dist.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Conditional Fields based on Responsible Selection */}
              {responsible === "ward" && (
                <>
                  <Grid
                    item
                    xs={12}
                  >
                    <FormControl fullWidth>
                      <InputLabel>Local Government</InputLabel>
                      <Select
                        value={assignedLocalGov}
                        onChange={(e) => setAssignedLocalGov(e.target.value)}
                        label="Local Government"
                      >
                        {localGovsDd.map((lg) => (
                          <MenuItem
                            key={lg.id}
                            value={lg.id}
                          >
                            {lg.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                  >
                    <FormControl
                      fullWidth
                      required
                    >
                      <InputLabel>Ward</InputLabel>
                      <Select
                        name="ward"
                        value={assignedWard}
                        onChange={(e) => setAssignedWard(e.target.value)}
                        label="Ward"
                      >
                        {localGovsDd
                          .filter((localGov) => localGov.id === assignedLocalGov)
                          .map((localGov) =>
                            [...Array(localGov.number_of_wards).keys()]
                              .filter(
                                (ward) =>
                                  !wardsDd.some((assignedWard) => assignedWard.number === ward + 1),
                              )
                              .map((ward) => (
                                <MenuItem
                                  key={ward + 1}
                                  value={ward + 1}
                                >
                                  Ward No. {ward + 1}
                                </MenuItem>
                              )),
                          )}
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}

              {responsible === "department" && (
                <Grid
                  item
                  xs={12}
                >
                  <FormControl fullWidth>
                    <InputLabel id="department-label">Department</InputLabel>
                    <Select
                      labelId="department-label"
                      id="department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      label="Department"
                    >
                      {departmentsDd.map((dept) => (
                        <MenuItem
                          key={dept.id}
                          value={dept.id}
                        >
                          {dept.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              Sign Up
            </Button>
            <Grid
              container
              justifyContent="flex-end"
            >
              <Grid item>
                <Link
                  to="/admin-login"
                  variant="body2"
                >
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
