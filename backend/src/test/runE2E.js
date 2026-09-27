const { server } = require('../server');
const { runE2E } = require('./e2eWorkflowTest');

setTimeout(async () => {
  try {
    await runE2E();
  } catch (err) {
    console.error('E2E Test Failed:', err);
  } finally {
    server.close(() => {
      console.log('Server closed.');
      process.exit(0);
    });
  }
}, 1500);
