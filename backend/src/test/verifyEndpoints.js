const http = require('http');

async function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING BACKEND API VERIFICATION SUITE ---');

  // 1. Health check
  const healthRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/health',
    method: 'GET'
  });
  console.log(`[Test 1] GET /api/health: Status ${healthRes.status}, online=${healthRes.body?.status === 'online'}`);

  // 2. Reject non-Gmail registration
  const nonGmailRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Fake Student',
    email: 'fake@yahoo.com',
    studentId: '2024CS999',
    phone: '9999999999',
    password: 'Password@123',
    confirmPassword: 'Password@123'
  });
  console.log(`[Test 2] Reject non-gmail: Status ${nonGmailRes.status} (Expected 400), Message: "${nonGmailRes.body?.message}"`);

  // 3. Reject weak password
  const weakPassRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    name: 'Weak Pass Student',
    email: 'weakpass@gmail.com',
    studentId: '2024CS998',
    phone: '9999999999',
    password: 'password',
    confirmPassword: 'password'
  });
  console.log(`[Test 3] Reject weak password: Status ${weakPassRes.status} (Expected 400), Message: "${weakPassRes.body?.message}"`);

  // 4. Login with seeded student
  const studentLoginRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'student@gmail.com',
    password: 'Campus@123'
  });
  console.log(`[Test 4] Student Login: Status ${studentLoginRes.status}, Success: ${studentLoginRes.body?.success}, Token received: ${!!studentLoginRes.body?.token}`);
  const studentToken = studentLoginRes.body?.token;

  // 5. Login with wrong password (no user enumeration)
  const badLoginRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'student@gmail.com',
    password: 'WrongPassword@123'
  });
  console.log(`[Test 5] Reject wrong password: Status ${badLoginRes.status} (Expected 401), Message: "${badLoginRes.body?.message}"`);

  // 6. Login with Admin
  const adminLoginRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    email: 'admin@gmail.com',
    password: 'Admin@123'
  });
  console.log(`[Test 6] Admin Login: Status ${adminLoginRes.status}, Role: ${adminLoginRes.body?.user?.role}`);
  const adminToken = adminLoginRes.body?.token;

  // 7. Student access to Admin Dashboard (should be 403 Forbidden)
  const forbiddenRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  console.log(`[Test 7] Role protection (student to /admin/dashboard): Status ${forbiddenRes.status} (Expected 403)`);

  // 8. Admin access to Admin Dashboard
  const adminDashRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  console.log(`[Test 8] Admin Dashboard access: Status ${adminDashRes.status}, Stats:`, adminDashRes.body?.stats);

  // 9. Search API test
  const searchRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/search?q=wallet',
    method: 'GET'
  });
  console.log(`[Test 9] Search for "wallet": Found ${searchRes.body?.total} item(s)`);

  // 10. Verify privateIdentifier is hidden from public search
  const foundSample = searchRes.body?.items?.find(i => i.reportType === 'FOUND');
  console.log(`[Test 10] Privacy check (privateIdentifier is undefined for public): ${foundSample?.privateIdentifier === undefined}`);

  // 11. Fetch Matches for student
  const matchesRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/matches',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  console.log(`[Test 11] Matches for student: Count ${matchesRes.body?.count}, Top Score: ${matchesRes.body?.matches?.[0]?.score}% (${matchesRes.body?.matches?.[0]?.matchLevel})`);

  // 12. Campus locations
  const locationsRes = await makeRequest({
    hostname: 'localhost',
    port: 5000,
    path: '/api/locations',
    method: 'GET'
  });
  console.log(`[Test 12] Locations: Count ${locationsRes.body?.locations?.length}, First: ${locationsRes.body?.locations?.[0]?.name}`);

  console.log('--- ALL 12 TESTS EXECUTED ---');
}

module.exports = { runTests };
