/**
 * Travel Buddy Finder - Demo Data Seeding Utility
 * Created by TV5 (DevOps + Testing)
 * Cross-platform tool using native Node.js fetch
 */

const BASE_URL = 'http://localhost:3000';

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.token ? { 'Authorization': `Bearer ${options.token}` } : {}),
    ...options.headers
  };

  try {
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
  } catch (err) {
    return {
      status: 'ERROR',
      ok: false,
      data: err.message
    };
  }
}

async function runSeeder() {
  console.log('====================================================');
  console.log('  SEEDING TRAVEL BUDDY FINDER DEMO DATA             ');
  console.log('====================================================\n');

  // 1. REGISTER & LOGIN DEMO USERS
  console.log('--- 👤 Seeding Demo Users ---');
  const demoUsers = [
    { email: 'coordinator@example.com', password: 'password123', name: 'Alex Coordinator', bio: 'Passionate tour manager and outdoor guide.', tags: ['hiking', 'mountains', 'adventure'] },
    { email: 'traveler1@example.com', password: 'password123', name: 'Bella Explorer', bio: 'Travel photographer and street food enthusiast.', tags: ['food', 'photography', 'nature'] },
    { email: 'traveler2@example.com', password: 'password123', name: 'Charlie Adventurer', bio: 'Ultralight backpacker seeking local experiences.', tags: ['trekking', 'camping', 'culture'] }
  ];

  const users = {};

  for (const user of demoUsers) {
    // Attempt to register
    const regRes = await request('/api/auth/register', { method: 'POST', body: user });
    if (regRes.ok) {
      console.log(`✔ Registered user: ${user.name} (${user.email})`);
    } else {
      console.log(`ℹ User ${user.email} already exists or registration skipped.`);
    }

    // Login to fetch token
    const loginRes = await request('/api/auth/login', {
      method: 'POST',
      body: { email: user.email, password: user.password }
    });

    if (!loginRes.ok) {
      console.error(`✘ Login failed for ${user.email}:`, loginRes.data);
      process.exit(1);
    }

    console.log(`✔ Authenticated: ${user.name}`);
    users[user.email] = {
      id: loginRes.data.user.id,
      token: loginRes.data.accessToken,
      name: user.name
    };
  }
  console.log('----------------------------------------------------\n');

  const alex = users['coordinator@example.com'];
  const bella = users['traveler1@example.com'];
  const charlie = users['traveler2@example.com'];

  // 2. SEED TRIPS
  console.log('--- 🗺️ Seeding Demo Trips ---');
  const demoTrips = [
    {
      owner: alex,
      payload: {
        title: 'Sapa Peak Challenge',
        description: 'Trekking to the summit of Fansipan and exploring local ethnic villages.',
        location: 'Sapa',
        startDate: '2026-07-15',
        endDate: '2026-07-20',
        maxMembers: 4,
        tags: ['hiking', 'nature', 'adventure']
      }
    },
    {
      owner: alex,
      payload: {
        title: 'Da Nang Culinary Tour',
        description: 'Discovering the best street food gems in Da Nang and Hoi An.',
        location: 'Da Nang',
        startDate: '2026-08-10',
        endDate: '2026-08-14',
        maxMembers: 3,
        tags: ['food', 'culture', 'relaxing']
      }
    },
    {
      owner: bella,
      payload: {
        title: 'Ha Long Bay Yacht Cruise',
        description: 'A premium relaxing cruise experience around the beautiful caves of Ha Long.',
        location: 'Ha Long',
        startDate: '2026-09-01',
        endDate: '2026-09-03',
        maxMembers: 2,
        tags: ['luxury', 'relaxing']
      }
    }
  ];

  const trips = [];

  for (const t of demoTrips) {
    const res = await request('/api/trips', {
      method: 'POST',
      token: t.owner.token,
      body: t.payload
    });

    if (res.ok) {
      console.log(`✔ Created Trip: "${t.payload.title}" by ${t.owner.name}. ID: ${res.data.id}`);
      trips.push({
        id: res.data.id,
        title: t.payload.title,
        owner: t.owner
      });
    } else {
      console.error(`✘ Failed to create Trip "${t.payload.title}":`, res.data);
    }
  }
  console.log('----------------------------------------------------\n');

  const sapaTrip = trips.find(t => t.title === 'Sapa Peak Challenge');
  const danangTrip = trips.find(t => t.title === 'Da Nang Culinary Tour');
  const halongTrip = trips.find(t => t.title === 'Ha Long Bay Yacht Cruise');

  // 3. SEED JOIN REQUESTS & APPROVALS
  console.log('--- 🤝 Seeding Join Requests & Approvals ---');

  // Flow A: Bella Joins Sapa Trip -> Alex Approves
  if (sapaTrip) {
    console.log(`Sending Join Request: Bella ➡️ "${sapaTrip.title}"...`);
    const reqRes1 = await request('/api/join-requests', {
      method: 'POST',
      token: bella.token,
      body: { tripId: sapaTrip.id, message: 'Hey Alex! I have dynamic lenses and want to photograph Fansipan summit!' }
    });

    if (reqRes1.ok) {
      console.log(`✔ Join request created. ID: ${reqRes1.data.id}`);
      console.log(`Approving Join Request: Alex ➡️ Bella...`);
      const appRes = await request(`/api/join-requests/${reqRes1.data.id}/approve`, {
        method: 'PUT',
        token: alex.token
      });
      if (appRes.ok) {
        console.log(`✔ Request approved successfully! Current member count: 2`);
      } else {
        console.warn(`⚠ Request approval failed:`, appRes.data);
      }
    }
  }

  // Flow B: Charlie Joins Sapa Trip -> Pending
  if (sapaTrip) {
    console.log(`Sending Join Request: Charlie ➡️ "${sapaTrip.title}" (Pending)...`);
    const reqRes2 = await request('/api/join-requests', {
      method: 'POST',
      token: charlie.token,
      body: { tripId: sapaTrip.id, message: 'Hi! I have my ultralight gear ready. Mind if I tag along?' }
    });
    if (reqRes2.ok) {
      console.log(`✔ Join request created (PENDING). ID: ${reqRes2.data.id}`);
    }
  }

  // Flow C: Charlie Joins Da Nang Culinary Tour -> Alex Approves
  if (danangTrip) {
    console.log(`Sending Join Request: Charlie ➡️ "${danangTrip.title}"...`);
    const reqRes3 = await request('/api/join-requests', {
      method: 'POST',
      token: charlie.token,
      body: { tripId: danangTrip.id, message: 'I love central Vietnamese food! Let us eat together.' }
    });

    if (reqRes3.ok) {
      console.log(`✔ Join request created. ID: ${reqRes3.data.id}`);
      console.log(`Approving Join Request: Alex ➡️ Charlie...`);
      const appRes = await request(`/api/join-requests/${reqRes3.data.id}/approve`, {
        method: 'PUT',
        token: alex.token
      });
      if (appRes.ok) {
        console.log(`✔ Request approved successfully! Current member count: 2`);
      }
    }
  }

  // Flow D: Alex Joins Ha Long Bay Yacht Cruise -> Bella Approves (Triggers closed status)
  if (halongTrip) {
    console.log(`Sending Join Request: Alex ➡️ "${halongTrip.title}"...`);
    const reqRes4 = await request('/api/join-requests', {
      method: 'POST',
      token: alex.token,
      body: { tripId: halongTrip.id, message: 'A luxury cruise sounds like a perfect rest. Count me in!' }
    });

    if (reqRes4.ok) {
      console.log(`✔ Join request created. ID: ${reqRes4.data.id}`);
      console.log(`Approving Join Request: Bella ➡️ Alex (Reaching Max Capacity = 2)...`);
      const appRes = await request(`/api/join-requests/${reqRes4.data.id}/approve`, {
        method: 'PUT',
        token: bella.token
      });
      if (appRes.ok) {
        console.log(`✔ Request approved successfully! Trip capacity reached. Status closed!`);
      }
    }
  }
  console.log('----------------------------------------------------\n');

  // 4. SEED PEER REVIEWS
  console.log('--- ⭐ Seeding Peer Reviews ---');

  if (sapaTrip) {
    console.log(`Posting Peer Review: Bella ➡️ Alex (Sapa Trip)...`);
    const rev1 = await request('/api/reviews', {
      method: 'POST',
      token: bella.token,
      body: {
        tripId: sapaTrip.id,
        targetUserId: alex.id,
        rating: 5,
        comment: 'Alex is the absolute best guide! Fansipan was incredibly beautiful and safe because of him.'
      }
    });
    if (rev1.ok) {
      console.log('✔ Posted 5-star review for Alex.');
    } else {
      console.warn('⚠ Failed to post review:', rev1.data);
    }
  }

  if (danangTrip) {
    console.log(`Posting Peer Review: Charlie ➡️ Alex (Da Nang Tour)...`);
    const rev2 = await request('/api/reviews', {
      method: 'POST',
      token: charlie.token,
      body: {
        tripId: danangTrip.id,
        targetUserId: alex.id,
        rating: 4,
        comment: 'Great culinary choices! Alex knows the best street side mi quang spots in town.'
      }
    });
    if (rev2.ok) {
      console.log('✔ Posted 4-star review for Alex.');
    }
  }

  if (halongTrip) {
    console.log(`Posting Peer Review: Alex ➡️ Bella (Ha Long Cruise)...`);
    const rev3 = await request('/api/reviews', {
      method: 'POST',
      token: alex.token,
      body: {
        tripId: halongTrip.id,
        targetUserId: bella.id,
        rating: 5,
        comment: 'Bella was incredibly fun to hang out with. Highly recommend her as a travel buddy!'
      }
    });
    if (rev3.ok) {
      console.log('✔ Posted 5-star review for Bella.');
    }
  }
  console.log('----------------------------------------------------');
  console.log('✔ DEMO DATA SEEDING COMPLETE!');
  console.log('====================================================');
}

runSeeder();
