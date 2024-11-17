const express = require('express');
const app = express();
const port = 3000;
const fetch = require('node-fetch');  // Add this to use fetch in Node.js

// Middleware to parse JSON
app.use(express.json());
app.use(express.static('public')); // Serve the frontend

// Endpoint to calculate savings (with currency support)
app.post('/calculate', async (req, res) => {
  const { income, goal, currency } = req.body;

  if (!income || !goal || income <= 0 || goal <= 0) {
    return res.status(400).send('Invalid input');
  }

  if (goal > income) {
    return res.status(400).send('Goal cannot exceed income');
  }

  try {
    // Calculate daily and weekly savings
    const dailySavingsUSD = (goal / 30).toFixed(2);
    const weeklySavingsUSD = (goal / 4).toFixed(2);

    // Fetch the exchange rate for the selected currency
    const exchangeRate = await getExchangeRate(currency);

    if (!exchangeRate) {
      return res.status(400).send('Unable to fetch exchange rate');
    }

    // Convert to selected currency
    const dailySavings = (dailySavingsUSD * exchangeRate).toFixed(2);
    const weeklySavings = (weeklySavingsUSD * exchangeRate).toFixed(2);

    res.json({ dailySavings, weeklySavings, currency });
  } catch (error) {
    console.error('Error during calculation:', error);
    res.status(500).send('Internal server error');
  }
});

// Function to get the exchange rate from an external API
async function getExchangeRate(currency) {
  try {
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
    const data = await response.json();
    return data.rates[currency]; // Return the exchange rate for the selected currency
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return null;
  }
}

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
