const payload = {
  email: 'gateway' + Math.floor(Math.random() * 10000) + '@example.com',
  password: 'password123',
  name: 'Test Gateway'
};

async function test() {
  try {
    console.log('Sending register via api-gateway...');
    const start = Date.now();
    const res = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('Response status:', res.status, `in ${Date.now() - start}ms`);
    const data = await res.text();
    console.log('Response content:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
