/**
 * ClinicCare - Server Entry Point (server.js)
 * Starts the Express HTTP server on the configured port.
 */

const app = require('./src/app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log(` ClinicCare – Clinic Appointment Booking System`);
  console.log(` Server is running on: http://localhost:${PORT}`);
  console.log(` Health Check API:    http://localhost:${PORT}/api/health`);
  console.log('====================================================');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down ClinicCare server gracefully...');
  server.close(() => {
    console.log('Server stopped.');
    process.exit(0);
  });
});
