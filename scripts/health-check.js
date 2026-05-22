const http = require('http');

const SERVICES = [
  { name: 'api-gateway', url: 'http://localhost:3000/health' },
  { name: 'user-service', url: 'http://localhost:8081/health' },
  { name: 'trip-service', url: 'http://localhost:8082/health' },
  { name: 'join-request-service', url: 'http://localhost:8083/health' },
  { name: 'notification-service', url: 'http://localhost:8084/health' },
  { name: 'chat-service', url: 'http://localhost:8085/health' },
  { name: 'review-service', url: 'http://localhost:8086/health' },
  { name: 'rabbitmq-mgmt', url: 'http://localhost:15672/' },
  { name: 'frontend', url: 'http://localhost:80/' }
];

async function checkService(service) {
  const start = Date.now();
  try {
    const res = await fetch(service.url, { signal: AbortSignal.timeout(3000) });
    const latency = Date.now() - start;
    let bodySnippet = '';
    if (res.status === 200) {
      try {
        const text = await res.text();
        bodySnippet = text.trim().substring(0, 50);
      } catch (e) {
        bodySnippet = 'OK';
      }
    }
    return {
      name: service.name,
      status: res.status,
      latency: `${latency}ms`,
      ok: res.ok,
      message: bodySnippet || `HTTP ${res.status}`
    };
  } catch (err) {
    return {
      name: service.name,
      status: 'DOWN',
      latency: 'N/A',
      ok: false,
      message: err.message
    };
  }
}

async function run() {
  console.log('====================================================');
  console.log('  Running Travel Buddy Finder Health Check...       ');
  console.log('====================================================');
  
  const results = [];
  for (const service of SERVICES) {
    const result = await checkService(service);
    results.push(result);
  }
  
  console.table(results.map(r => ({
    'Service Name': r.name,
    'Status': r.status,
    'Latency': r.latency,
    'Health Check Output': r.message
  })));
  
  const allOk = results.every(r => r.ok || r.name === 'rabbitmq-mgmt' && r.status === 200 || r.name === 'frontend' && r.status === 200);
  if (allOk) {
    console.log('\n✔ All services are UP and Healthy!');
    process.exit(0);
  } else {
    console.log('\n✘ Some services are DOWN or Unhealthy.');
    process.exit(1);
  }
}

run();
