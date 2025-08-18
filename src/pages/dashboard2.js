import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import axios from 'axios';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Define ChartComponent before Dashboard
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ChartComponent = ({ chart }) => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <h3 style={{ textAlign: 'center', margin: '10px 0' }}>{chart.title}</h3>
      <ResponsiveContainer width="100%" height="90%">
        {renderChart(chart)}
      </ResponsiveContainer>
    </div>
  );
};

const renderChart = (chart) => {
  switch (chart.chartType) {
    case 'Line':
      return (
        <LineChart data={chart.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={chart.xColumn} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={chart.yColumn} stroke="#8884d8" />
        </LineChart>
      );
    case 'Bar':
      return (
        <BarChart data={chart.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={chart.xColumn} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey={chart.yColumn} fill="#8884d8" />
        </BarChart>
      );
    case 'Area':
      return (
        <AreaChart data={chart.data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={chart.xColumn} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Area type="monotone" dataKey={chart.yColumn} stroke="#8884d8" fill="#8884d8" />
        </AreaChart>
      );
    case 'Pie':
      return (
        <PieChart>
          <Tooltip />
          <Legend />
          <Pie
            data={chart.data}
            dataKey={chart.yColumn}
            nameKey={chart.xColumn}
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {chart.data.map((entry, idx) => (
              <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      );
    default:
      return null;
  }
};

// Then, define the Dashboard component
const Dashboard = () => {
  const [layouts, setLayouts] = useState([]);
  const [charts, setCharts] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedChartIndex, setSelectedChartIndex] = useState(null);
  const [showChartConfigDialog, setShowChartConfigDialog] = useState(false);
  const [columns, setColumns] = useState([]);
  const [chartConfig, setChartConfig] = useState({
    table: '',
    xColumn: '',
    yColumn: '',
    chartType: 'Line',
    title: '',  // New title field
  });
  const [error, setError] = useState('');

  const chartTypes = ['Line', 'Bar', 'Area', 'Pie'];

  useEffect(() => {
    axios
      .get('http://localhost:1880/api/tables')
      .then((response) => {
        if (response.data && Array.isArray(response.data)) {
          setAvailableTables(response.data);
        } else {
          setError('No tables available or incorrect format returned');
        }
      })
      .catch((err) => {
        console.error('Error fetching tables:', err);
        setError('Error fetching tables');
      });
  }, []);

  useEffect(() => {
    if (chartConfig.table) {
      axios
        .get(`http://localhost:1880/api/columns?table=${chartConfig.table}`)
        .then((response) => {
          setColumns(response.data);
        })
        .catch((error) => {
          console.error('Error fetching columns:', error);
        });
    }
  }, [chartConfig.table]);

  const handleAddChart = () => {
    setCharts([
      ...charts,
      { table: '', xColumn: '', yColumn: '', chartType: 'Line', title: '', data: [] },
    ]);
    setLayouts([
      ...layouts,
      { i: String(charts.length), x: 0, y: Infinity, w: 4, h: 4 },
    ]);
  };

  const handleSaveChartConfig = async () => {
    const { table, xColumn, yColumn, chartType, title } = chartConfig;

    if (!table || !xColumn || !yColumn) {
      setError('Please select a table and both X and Y columns.');
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:1880/api/data?table=${table}&xColumn=${xColumn}&yColumn=${yColumn}`
      );
      const updatedCharts = [...charts];
      updatedCharts[selectedChartIndex] = {
        ...updatedCharts[selectedChartIndex],
        table,
        xColumn,
        yColumn,
        chartType,
        title, // Save title
        data: response.data,
      };
      setCharts(updatedCharts);
      setShowChartConfigDialog(false);
      setError('');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error fetching chart data.');
    }
  };

  const handleChartResizeStop = (layout) => {
    setLayouts(layout);
  };

  const handleChartClick = (index) => {
    setSelectedChartIndex(index);
    setChartConfig(
      charts[index] || {
        table: '',
        xColumn: '',
        yColumn: '',
        chartType: 'Line',
        title: '',
      }
    );
    setShowChartConfigDialog(true);
  };

  return (
    <Box>
      <Button onClick={handleAddChart}>Add Chart</Button>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layouts }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={100}
        onResizeStop={handleChartResizeStop}
        isResizable
        isDraggable
        draggableCancel=".no-drag"
      >
        {charts.map((chart, index) => (
          <div
            key={index}
            data-grid={{ i: String(index), x: 0, y: 0, w: 4, h: 4 }}
          >
            <div
              className="no-drag"
              onClick={() => handleChartClick(index)}
              style={{ cursor: 'pointer' }}
            >
              {chart.table && chart.xColumn && chart.yColumn ? (
                <ChartComponent chart={chart} index={index} />
              ) : (
                <div style={{ textAlign: 'center', paddingTop: '50px' }}>
                  <p>Click to configure the chart</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </ResponsiveGridLayout>

      {/* Chart Configuration Dialog */}
      {showChartConfigDialog && (
        <Dialog
          open={showChartConfigDialog}
          onClose={() => setShowChartConfigDialog(false)}
        >
          <DialogTitle>Configure Chart</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Table</InputLabel>
              <Select
                value={chartConfig.table}
                onChange={(e) =>
                  setChartConfig({
                    ...chartConfig,
                    table: e.target.value,
                    xColumn: '',
                    yColumn: '',
                  })
                }
              >
                {availableTables.map((table) => (
                  <MenuItem key={table.key} value={table.table_name}>
                    {table.table_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {chartConfig.table && (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel>X Column</InputLabel>
                  <Select
                    value={chartConfig.xColumn}
                    onChange={(e) =>
                      setChartConfig({ ...chartConfig, xColumn: e.target.value })
                    }
                  >
                    {columns &&
                      columns.map((column) => (
                        <MenuItem key={column.key} value={column.column_name}>
                          {column.column_name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Y Column</InputLabel>
                  <Select
                    value={chartConfig.yColumn}
                    onChange={(e) =>
                      setChartConfig({ ...chartConfig, yColumn: e.target.value })
                    }
                  >
                    {columns &&
                      columns.map((column) => (
                        <MenuItem key={column.key} value={column.column_name}>
                          {column.column_name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Chart Type</InputLabel>
                  <Select
                    value={chartConfig.chartType}
                    onChange={(e) =>
                      setChartConfig({
                        ...chartConfig,
                        chartType: e.target.value,
                      })
                    }
                  >
                    {chartTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <TextField
                    label="Chart Title"
                    value={chartConfig.title}
                    onChange={(e) =>
                      setChartConfig({ ...chartConfig, title: e.target.value })
                    }
                    placeholder="Enter chart title"
                  />
                </FormControl>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowChartConfigDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveChartConfig}
              variant="contained"
              color="primary"
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default Dashboard;