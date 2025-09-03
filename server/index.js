// server/index.js
const { app } = require('./app');
const PORT = 3001;

app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});