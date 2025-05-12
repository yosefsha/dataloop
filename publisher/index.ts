import express from 'express';
import { router } from './apiRouter';

const app = express();
app.use(express.json());

app.use(router);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Publisher API is running on http://localhost:${PORT}`);
});
