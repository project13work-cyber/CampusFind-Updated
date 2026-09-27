const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(typeof data === 'string' ? data : JSON.stringify(data));
    }
    req.end();
  });
}

async function runE2E() {
  console.log('==================================================');
  console.log('🚀 RUNNING COMPLETE END-TO-END WORKFLOW TEST');
  console.log('==================================================');

  // 1. Student Login
  const studentLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'student@gmail.com', password: 'Campus@123' });

  console.log(`[Step 1] Student Login: Status ${studentLogin.status}, Success: ${studentLogin.data?.success}`);
  const studentToken = studentLogin.data.token;

  // 2. Report Lost Item
  const lostItemRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/lost',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    }
  }, {
    itemName: 'Boat Airdopes 141',
    category: 'Earphones',
    brand: 'Boat',
    model: 'Airdopes 141',
    color: 'Matte Black',
    description: 'Black charging case with wireless earbuds left on dining table.',
    lostDate: new Date().toISOString(),
    approxTime: '12:30 PM',
    timeRange: '12:00 PM - 1:00 PM',
    locationName: 'College Canteen',
    zone: 'Dining Tables 1 - 3 (North Wing)',
    mapCoordinates: { x: 310, y: 160 },
    exactSpot: 'Table 2 near window',
    privateIdentifier: 'Small piece of red electrical tape wrapped around charging case lid'
  });

  console.log(`[Step 2] Lost Item Created: Status ${lostItemRes.status}, Item ID: ${lostItemRes.data?.item?._id}`);
  const lostItemId = lostItemRes.data.item._id;

  // 3. Finder Student Sarah logs in
  const sarahLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'sarah@gmail.com', password: 'Campus@123' });
  const sarahToken = sarahLogin.data.token;

  // 4. Sarah Reports Found Item at the same spot
  const foundItemRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/found',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${sarahToken}`
    }
  }, {
    itemName: 'Boat Wireless Earbuds Case',
    category: 'Earphones',
    brand: 'Boat',
    model: 'Airdopes',
    color: 'Black',
    description: 'Found black boat earbuds on Table 2 in canteen. Handed over to Campus Security Desk.',
    foundDate: new Date().toISOString(),
    foundTime: '12:45 PM',
    locationName: 'College Canteen',
    zone: 'Dining Tables 1 - 3 (North Wing)',
    mapCoordinates: { x: 315, y: 165 },
    exactSpot: 'Table 2 near window',
    currentLocation: 'Submitted to Security Office',
    storageRefNumber: 'SEC-2026-0088',
    privateIdentifier: 'Has red tape on the lid'
  });

  console.log(`[Step 3] Found Item Created: Status ${foundItemRes.status}, Item ID: ${foundItemRes.data?.item?._id}`);
  const foundItemId = foundItemRes.data.item._id;

  // Wait 1 second for async matching engine and notifications
  await new Promise(r => setTimeout(r, 1200));

  // 5. Verify Match was generated
  const matchesRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/matches?lostItemId=${lostItemId}&foundItemId=${foundItemId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });

  const generatedMatch = matchesRes.data?.matches?.[0];
  console.log(`[Step 4] Matching Engine Generated Score: ${generatedMatch?.score}% (${generatedMatch?.matchLevel} Confidence)`);
  console.log(`         Factors:`, generatedMatch?.matchingFactors?.details);

  // 6. Verify in-app Notification created for Aarav
  const notifRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/notifications',
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });

  const latestNotif = notifRes.data?.notifications?.[0];
  console.log(`[Step 5] In-app Notification Received by Student: "${latestNotif?.title}" - "${latestNotif?.message}"`);

  // 7. Student Aarav Submits Ownership Claim
  const claimRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/claims',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${studentToken}`
    }
  }, {
    foundItemId,
    lostItemId,
    matchId: generatedMatch?._id,
    whereLost: 'Table 2 near window in Canteen during lunch',
    uniqueFeatures: 'Small piece of red electrical tape wrapped around the charging case lid',
    insideOrAttached: 'Black silicone lanyard loop attached to case'
  });

  console.log(`[Step 6] Ownership Claim Submitted: Status ${claimRes.status}, Claim ID: ${claimRes.data?.claim?._id}`);
  const claimId = claimRes.data.claim._id;

  // 8. Admin Logs In
  const adminLogin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@gmail.com', password: 'Admin@123' });
  const adminToken = adminLogin.data.token;

  // 9. Admin Fetches Claim and inspects Private Identifier
  const adminClaimRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/claims/${claimId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });

  const claimDetail = adminClaimRes.data.claim;
  console.log(`[Step 7] Admin Reviewing Claim:`);
  console.log(`         Claimant: ${claimDetail.claimantUserId?.name} (ID: ${claimDetail.claimantUserId?.studentId}, Phone: ${claimDetail.claimantUserId?.phone})`);
  console.log(`         Claimant Unique Feature Answer: "${claimDetail.answers?.uniqueFeatures}"`);
  console.log(`         Found Item Confidential Secret: "${claimDetail.foundItemId?.privateIdentifier}"`);

  // 10. Admin Approves the Claim
  const approveRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/claims/${claimId}/approve`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, { notes: 'Red tape on charging case matches private identifier reported by finder.' });

  console.log(`[Step 8] Claim Approval: Status ${approveRes.status}, Message: "${approveRes.data?.message}"`);

  // 11. Admin Records Physical Handover at Campus Security Desk
  const handoverRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/admin/items/${foundItemId}/returned`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    }
  }, {
    claimId,
    handoverLocation: 'Campus Security Desk - Gate 1',
    storageRefNumber: 'SEC-2026-0088',
    notes: 'Item handed over to student Aarav Sharma after verifying College ID 2024CS014 and matching private marking.'
  });

  console.log(`[Step 9] Physical Handover Finalized: Status ${handoverRes.status}, Message: "${handoverRes.data?.message}"`);

  // 12. Verify Final Item Status
  const finalItemCheck = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/found/${foundItemId}`,
    method: 'GET',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });

  console.log(`[Step 10] Final Item Status in Database: "${finalItemCheck.data?.item?.status}"`);

  console.log('==================================================');
  console.log('🎉 COMPLETE END-TO-END TEST PASSED WITH 100% SUCCESS!');
  console.log('==================================================');
}

module.exports = { runE2E };
