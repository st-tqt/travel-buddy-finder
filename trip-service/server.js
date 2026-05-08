const express = require('express');
const app = express();

app.use(express.json());

const tripRoutes = require('./routes/tripRoutes');
app.use('/api/trips', tripRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log('Trip Service dang chay tai http://localhost:' + PORT);
});
