import React from 'react';
import { Container, Grid, Paper, Typography, } from '@mui/material';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

// Dummy data for charts
const lineChartData = [
  { name: 'Jan', uv: 400, pv: 2400 },
  { name: 'Feb', uv: 300, pv: 2200 },
  { name: 'Mar', uv: 500, pv: 2500 },
  { name: 'Apr', uv: 450, pv: 2600 },
  { name: 'May', uv: 470, pv: 2700 },
  { name: 'Jun', uv: 480, pv: 2800 }
];

const barChartData = [
  { name: 'Q1', sales: 4000, expenses: 2400 },
  { name: 'Q2', sales: 3000, expenses: 2210 },
  { name: 'Q3', sales: 5000, expenses: 2290 },
  { name: 'Q4', sales: 4000, expenses: 2000 }
];

const pieChartData = [
  { name: 'Sales', value: 400 },
  { name: 'Marketing', value: 300 },
  { name: 'Development', value: 300 },
  { name: 'Support', value: 200 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const Dashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Line Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              User Growth (Line Chart)
            </Typography>
            <LineChart width={500} height={300} data={lineChartData}>
              <Line type="monotone" dataKey="uv" stroke="#8884d8" />
              <CartesianGrid stroke="#ccc" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
            </LineChart>
          </Paper>
        </Grid>

        {/* Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quarterly Performance (Bar Chart)
            </Typography>
            <BarChart width={500} height={300} data={barChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" />
              <Bar dataKey="expenses" fill="#82ca9d" />
            </BarChart>
          </Paper>
        </Grid>

        {/* Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              Department Allocation (Pie Chart)
            </Typography>
            <PieChart width={400} height={400}>
              <Pie
                data={pieChartData}
                cx={200}
                cy={200}
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;