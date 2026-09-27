const { server } = require('../server');
const { runTests } = require('./verifyEndpoints');

setTimeout(async () => {
  try {
    await runTests();
  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    server.close(() => {
      console.log('Server closed. Verification suite complete.');
      process.exit(0);
    });
  }
}, 1500);
