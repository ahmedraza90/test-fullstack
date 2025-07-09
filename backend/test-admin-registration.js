#!/usr/bin/env node
const express = require('express');
const { registerAdmin } = require('./src/modules/auth/auth-service.js');

const app = express();
app.use(express.json());

app.post('/test-register', async (req, res) => {
  try {
    console.log('Testing admin registration...');
    const result = await registerAdmin(req.body);
    console.log('Registration successful:', result);
    res.json(result);
  } catch (error) {
    console.error('Registration failed:', error.message);
    res.status(400).json({ error: error.message });
  }
});

app.listen(3001, () => {
  console.log('Test server running on port 3001');
});
