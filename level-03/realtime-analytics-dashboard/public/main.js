// client-side socket + charts
const socket = io();

// DOM references
const statusEl = document.getElementById('status');
const activeUsersEl = document.getElementById('activeUsers');
const eventsPerSecEl = document.getElementById('eventsPerSec');
const errorRateEl = document.getElementById('errorRate');
const avgLatencyEl = document.getElementById('avgLatency');

const eventsCtx = document.getElementById('eventsChart').getContext('2d');
const usersCtx = document.getElementById('usersChart').getContext('2d');

const MAX_POINTS = 60;
let eventsData = Array(MAX_POINTS).fill(null);
let usersData = Array(MAX_POINTS).fill(null);
let labels = Array(MAX_POINTS).fill('');

// Chart.js charts
const eventsChart = new Chart(eventsCtx, {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Events/sec',
      data: eventsData,
      fill: true,
      tension: 0.25
    }]
  },
  options: {
    animation: { duration: 0 },
    responsive: true,
    scales: {
      x: { display: false },
      y: { beginAtZero: true }
    }
  }
});

const usersChart = new Chart(usersCtx, {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Active Users',
      data: usersData,
      fill: true,
      tension: 0.25
    }]
  },
  options: {
    animation: { duration: 0 },
    responsive: true,
    scales: {
      x: { display: false },
      y: { beginAtZero: true }
    }
  }
});

function pushSample(sample) {
  const ts = new Date(sample.ts);
  labels.push(ts.toLocaleTimeString());
  if (labels.length > MAX_POINTS) labels.shift();

  eventsData.push(sample.metrics.eventsPerSec);
  if (eventsData.length > MAX_POINTS) eventsData.shift();

  usersData.push(sample.metrics.activeUsers);
  if (usersData.length > MAX_POINTS) usersData.shift();

  eventsChart.update('none');
  usersChart.update('none');

  activeUsersEl.textContent = sample.metrics.activeUsers;
  eventsPerSecEl.textContent = sample.metrics.eventsPerSec.toFixed(2);
  errorRateEl.textContent = sample.metrics.errorRate.toFixed(2);
  avgLatencyEl.textContent = sample.metrics.avgLatencyMs;
}

socket.on('connect', () => {
  statusEl.textContent = 'Connected';
  socket.emit('subscribe', { streams: ['overview'] });
  socket.emit('get_initial');
});

socket.on('disconnect', () => {
  statusEl.textContent = 'Disconnected';
});

socket.on('initial', (payload) => {
  // small display of initial state
  if (payload && payload.summary) {
    activeUsersEl.textContent = payload.summary.activeUsers;
    eventsPerSecEl.textContent = payload.summary.eventsPerSec;
    errorRateEl.textContent = payload.summary.errorRate;
  }
});

socket.on('metrics', (sample) => {
  try {
    pushSample(sample);
  } catch (e) {
    console.error('Failed to process sample', e);
  }
});
