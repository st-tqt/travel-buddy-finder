const express = require('express');
const app = express();

app.use(express.json());

const joinRequestRoutes = require('./routes/joinRequestRoutes');
app.use('/api/join-requests', joinRequestRoutes);

const PORT = 3002;
app.listen(PORT, () => {
  console.log('Join Request Service dang chay tai http://localhost:' + PORT);
});