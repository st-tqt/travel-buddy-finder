const payload = {
  email: 'test' + Math.floor(Math.random() * 10000) + '@example.com',
  password: 'password123',
  name: 'Test Direct'
};

async function test() {
  try {
    console.log('Sending direct register to user-service...');
    const res = await fetch('http://localhost:8081/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log('Response status:', res.status);
    const data = await res.json();
    console.log('Response data:', data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
