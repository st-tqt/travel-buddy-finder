/**
 * Travel Buddy Finder - Automated E2E Integration & Load Test Suite
 * Created by TV5 (DevOps + Testing)
 * Runs cross-platform using native Node.js fetch
 */

const BASE_URL = 'http://localhost:3000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { 'Authorization': `Bearer ${options.token}` } : {}),
    ...options.headers
  };

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(5000)
  });

  let data = null;
  const text = await response.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = text;
    }
  }

  return {
    status: response.status,
    ok: response.ok,
    data
  };
}

async function runTests() {
  console.log('====================================================');
  console.log('  STARTING INTEGRATION TEST FLOWS (E2E)              ');
  console.log('====================================================\n');

  let userAToken, userBToken, userCToken;
  let userAId, userBId, userCId;

  // ----------------------------------------------------------------
  // SETUP: Pre-Register & Login Users A, B, C
  // ----------------------------------------------------------------
  console.log('--- [SETUP] Creating and Logging in Users ---');
  
  const userAData = { email: 'usera@example.com', password: 'password123', name: 'User A', bio: 'Hiker', tags: ['hiking'] };
  const userBData = { email: 'userb@example.com', password: 'password123', name: 'User B', bio: 'Beach Lover', tags: ['beach'] };
  const userCData = { email: 'userc@example.com', password: 'password123', name: 'User C', bio: 'City Explorer', tags: ['city'] };

  // Helper to register if needed, then login
  async function setupUser(userData) {
    // Attempt registration
    const regRes = await request('/api/auth/register', { method: 'POST', body: userData });
    if (regRes.status === 201) {
      console.log(`✔ Registered new user: ${userData.email}`);
    } else {
      console.log(`ℹ User ${userData.email} already exists or registration skipped.`);
    }

    // Login
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: userData.email, password: userData.password }
    });

    if (loginRes.status !== 200) {
      throw new Error(`Login failed for ${userData.email}: ${JSON.stringify(loginRes.data)}`);
    }

    console.log(`✔ Logged in as: ${userData.email}`);
    return {
      token: loginRes.data.accessToken,
      id: loginRes.data.user.id
    };
  }

  try {
    const userA = await setupUser(userAData);
    userAToken = userA.token;
    userAId = userA.id;

    const userB = await setupUser(userBData);
    userBToken = userB.token;
    userBId = userB.id;

    const userC = await setupUser(userCData);
    userCToken = userC.token;
    userCId = userC.id;

    console.log('\n✔ Setup complete! Active user IDs and tokens resolved.\n');
  } catch (err) {
    console.error('✘ Setup failed:', err.message);
    process.exit(1);
  }

  // ----------------------------------------------------------------
  // FLOW 1: Trip Lifecycle, Autoclose, and Notifications
  // ----------------------------------------------------------------
  console.log('--- [FLOW 1] Trip Lifecycle & Notifications ---');
  let trip1Id;
  let request1Id;

  // 1. User A creates a trip with maxMembers = 2
  const tripPayload = {
    title: 'Hanoi Adventure',
    description: 'Explore the Old Quarter and local food.',
    location: 'Hanoi',
    startDate: '2026-07-01',
    endDate: '2026-07-05',
    maxMembers: 2,
    tags: ['food', 'history']
  };

  const createTripRes = await request('/api/trips', {
    method: 'POST',
    token: userAToken,
    body: tripPayload
  });

  if (createTripRes.status === 201) {
    trip1Id = createTripRes.data.id;
    console.log(`✔ Step 1: Trip created successfully! ID: ${trip1Id}`);
  } else {
    console.error('✘ Step 1: Trip creation failed:', createTripRes.data);
    process.exit(1);
  }

  // 2. User B requests to join
  const joinRequestPayload = {
    tripId: trip1Id,
    message: 'I want to join your trip to Hanoi!'
  };

  const requestJoinRes = await request('/api/join-requests', {
    method: 'POST',
    token: userBToken,
    body: joinRequestPayload
  });

  if (requestJoinRes.status === 201) {
    request1Id = requestJoinRes.data.id;
    console.log(`✔ Step 2: User B join request submitted. ID: ${request1Id}`);
  } else {
    console.error('✘ Step 2: User B join request failed:', requestJoinRes.data);
    process.exit(1);
  }

  // 3. User B requests to join again (Conflict check)
  const duplicateJoinRes = await request('/api/join-requests', {
    method: 'POST',
    token: userBToken,
    body: joinRequestPayload
  });

  if (duplicateJoinRes.status === 409) {
    console.log('✔ Step 3: Prevented duplicate join request (HTTP 409 Conflict)');
  } else {
    console.warn(`⚠ Step 3 Check: Expected HTTP 409 for duplicate request, got: ${duplicateJoinRes.status}`);
  }

  // 4. User A approves User B's request
  const approveRes = await request(`/api/join-requests/${request1Id}/approve`, {
    method: 'PUT',
    token: userAToken
  });

  if (approveRes.status === 200) {
    console.log('✔ Step 4: User A approved User B request.');
  } else {
    console.error('✘ Step 4: Approval failed:', approveRes.data);
    process.exit(1);
  }

  // 5. Check Trip Status (Capacity Autoclose check)
  const getTripRes = await request(`/api/trips/${trip1Id}`);
  if (getTripRes.status === 200) {
    const trip = getTripRes.data;
    console.log(`✔ Step 5: Trip details retrieved.`);
    console.log(`   - Current Member count: ${trip.currentMember}`);
    console.log(`   - Status: ${trip.status}`);
    
    if (trip.currentMember === 2 && trip.status.toLowerCase() === 'closed') {
      console.log('   - Success: Capacity autoclose works!');
    } else {
      console.warn('   - Warning: Trip status or members count mismatch.');
    }
  } else {
    console.error('✘ Step 5: Fetching trip details failed.');
  }

  // 6. User C attempts to request join when full
  const fullJoinRes = await request('/api/join-requests', {
    method: 'POST',
    token: userCToken,
    body: { tripId: trip1Id, message: 'Can I join too?' }
  });

  if (fullJoinRes.status === 400 || fullJoinRes.status === 409) {
    console.log(`✔ Step 6: User C blocked from joining full trip (HTTP ${fullJoinRes.status})`);
  } else {
    console.warn(`⚠ Step 6: Expected HTTP 400/409, got: ${fullJoinRes.status}`);
  }

  // 7. Verify Notification (RabbitMQ trigger check)
  console.log('   - Waiting 1.5 seconds for RabbitMQ & Notification Service to sync...');
  await new Promise(r => setTimeout(r, 1500));

  const notifRes = await request(`/api/notifications/${userBId}`, {
    token: userBToken
  });

  if (notifRes.status === 200 && notifRes.data.data.length > 0) {
    const notifications = notifRes.data.data;
    const latestNotif = notifications[0];
    console.log(`✔ Step 7: Notification retrieved successfully!`);
    console.log(`   - Notification Message: "${latestNotif.message}"`);
    console.log(`   - Read Status: ${latestNotif.isRead ? 'Read' : 'Unread'}`);
  } else {
    console.warn('⚠ Step 7: No notification found or notification fetch failed.');
  }
  console.log('----------------------------------------------------\n');

  // ----------------------------------------------------------------
  // FLOW 2: Cancel Join Request and Re-join
  // ----------------------------------------------------------------
  console.log('--- [FLOW 2] Cancel Join Request & Re-join ---');
  let trip2Id;
  let request2Id;

  // 1. User A creates Sapa trip
  const trip2Payload = {
    title: 'Sapa Trekking',
    description: 'Beautiful rice fields trekking.',
    location: 'Sapa',
    startDate: '2026-08-01',
    endDate: '2026-08-05',
    maxMembers: 5,
    tags: ['trekking', 'nature']
  };

  const createTrip2Res = await request('/api/trips', {
    method: 'POST',
    token: userAToken,
    body: trip2Payload
  });
  
  if (createTrip2Res.status === 201) {
    trip2Id = createTrip2Res.data.id;
    console.log(`✔ Step 1: Trip 2 created. ID: ${trip2Id}`);
  }

  // 2. User B requests to join Trip 2
  const joinRequest2Res = await request('/api/join-requests', {
    method: 'POST',
    token: userBToken,
    body: { tripId: trip2Id, message: 'I want to join Sapa!' }
  });

  if (joinRequest2Res.status === 201) {
    request2Id = joinRequest2Res.data.id;
    console.log(`✔ Step 2: Join Request created. ID: ${request2Id}`);
  }

  // 3. User B cancels join request
  const cancelRes = await request(`/api/join-requests/${request2Id}`, {
    method: 'DELETE',
    token: userBToken
  });

  if (cancelRes.status === 200 || cancelRes.status === 204) {
    console.log('✔ Step 3: User B successfully cancelled join request.');
  } else {
    console.error('✘ Step 3: Cancellation failed:', cancelRes.status, cancelRes.data);
  }

  // 4. User B requests to join again (Check if re-submission allowed)
  const rejoinRes = await request('/api/join-requests', {
    method: 'POST',
    token: userBToken,
    body: { tripId: trip2Id, message: 'Decided to join Sapa again!' }
  });

  if (rejoinRes.status === 201) {
    console.log('✔ Step 4: User B re-submitted request successfully after cancellation!');
  } else {
    console.error('✘ Step 4: Re-join failed:', rejoinRes.status, rejoinRes.data);
  }
  console.log('----------------------------------------------------\n');

  // ----------------------------------------------------------------
  // FLOW 3: Filters and Search Pagination
  // ----------------------------------------------------------------
  console.log('--- [FLOW 3] Trip Filters & Pagination ---');

  // 1. Filter by Location and Status
  const filterRes = await request('/api/trips?location=hanoi&page=1&limit=5');
  if (filterRes.status === 200) {
    const data = filterRes.data.data || filterRes.data;
    console.log(`✔ Filter by location=hanoi returned: ${data.length} trips.`);
    if (data.length > 0) {
      console.log(`   - Verified Trip Title: "${data[0].title}"`);
    }
  } else {
    console.error('✘ Filter request failed:', filterRes.status);
  }

  // 2. Filter by tag
  const tagRes = await request('/api/trips?tags=trekking');
  if (tagRes.status === 200) {
    const data = tagRes.data.data || tagRes.data;
    console.log(`✔ Filter by tags=trekking returned: ${data.length} trips.`);
  }
  console.log('----------------------------------------------------\n');

  // ----------------------------------------------------------------
  // FLOW 4: Review System
  // ----------------------------------------------------------------
  console.log('--- [FLOW 4] Review System & Constraints ---');

  // 1. User B reviews User A
  const reviewPayload = {
    tripId: trip1Id,
    targetUserId: userAId,
    rating: 5,
    comment: 'User A is a wonderful coordinator and very polite!'
  };

  const createReviewRes = await request('/api/reviews', {
    method: 'POST',
    token: userBToken,
    body: reviewPayload
  });

  if (createReviewRes.status === 201 || createReviewRes.status === 200) {
    console.log('✔ Step 1: User B reviewed User A successfully.');
  } else {
    console.error('✘ Step 1: Creating review failed:', createReviewRes.status, createReviewRes.data);
  }

  // 2. User B reviews User A again (Duplicate restriction check)
  const duplicateReviewRes = await request('/api/reviews', {
    method: 'POST',
    token: userBToken,
    body: reviewPayload
  });

  if (duplicateReviewRes.status === 400 || duplicateReviewRes.status === 409) {
    console.log(`✔ Step 2: Prevented duplicate reviews (HTTP ${duplicateReviewRes.status})`);
  } else {
    console.warn(`⚠ Step 2: Expected duplicate restriction HTTP 400/409, got: ${duplicateReviewRes.status}`);
  }

  // 3. User A attempts to self-review (Self-review block check)
  const selfReviewRes = await request('/api/reviews', {
    method: 'POST',
    token: userAToken,
    body: {
      tripId: trip1Id,
      targetUserId: userAId,
      rating: 4,
      comment: 'I am the best!'
    }
  });

  if (selfReviewRes.status === 400 || selfReviewRes.status === 403) {
    console.log(`✔ Step 3: Prevented self-review successfully (HTTP ${selfReviewRes.status})`);
  } else {
    console.warn(`⚠ Step 3: Expected self-review restriction HTTP 400/403, got: ${selfReviewRes.status}`);
  }

  // 4. Retrieve User A reviews and check averageRating
  const getReviewsRes = await request(`/api/reviews/user/${userAId}`);
  if (getReviewsRes.status === 200) {
    const data = getReviewsRes.data;
    console.log(`✔ Step 4: Reviews for User A retrieved.`);
    console.log(`   - Average Rating: ${data.averageRating || data.avgRating || 'N/A'}`);
    console.log(`   - Reviews count: ${(data.reviews || data.data || data).length}`);
  } else {
    console.error('✘ Step 4: Fetching reviews failed:', getReviewsRes.status);
  }
  console.log('----------------------------------------------------\n');

  // ----------------------------------------------------------------
  // LOAD & RATE-LIMIT TESTS
  // ----------------------------------------------------------------
  console.log('--- [LOAD & RATE-LIMITING] Simulated Stress Test ---');
  console.log('Simulating 110 rapid login attempts to verify strict Gateway Auth Rate Limiter (max 100)...');

  const requests = Array.from({ length: 110 }, () => request('/api/auth/login', {
    method: 'POST',
    body: { email: 'invalid@example.com', password: 'wrong' }
  }));
  const results = await Promise.all(requests);

  const rateLimited = results.filter(r => r.status === 429).length;
  const otherStatus = results.filter(r => r.status !== 429).map(r => r.status);

  console.log(`✔ Simulating finished:`);
  console.log(`   - Rate-limited calls (HTTP 429): ${rateLimited}`);
  console.log(`   - Other response codes: ${otherStatus.slice(0, 5).join(', ')}...`);
  
  if (rateLimited > 0) {
    console.log('✔ Rate limiting is ACTIVE and verified successfully at Gateway level!');
  } else {
    console.log('ℹ Rate limiting did not trigger.');
  }
  console.log('====================================================');
  console.log('  INTEGRATION TEST RUN FINISHED                      ');
  console.log('====================================================');
}

runTests();
