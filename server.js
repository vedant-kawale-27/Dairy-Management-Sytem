const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return { partners: [], customers: [], deliveries: [] };
  }
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Admin: add delivery partner
app.post('/api/admin/partner', (req, res) => {
  const data = readData();
  const { name, phone } = req.body;
  if (!name || !phone) return res.status(400).json({ error: 'name and phone required' });
  const id = Date.now().toString();
  const partner = { id, name, phone };
  data.partners.push(partner);
  writeData(data);
  res.json(partner);
});

// Admin: add delivery (assign to partner)
app.post('/api/admin/delivery', (req, res) => {
  const data = readData();
  const { partnerId, date, address, customerId, liters, extra } = req.body;
  if (!date || !address || !liters) return res.status(400).json({ error: 'date, address, liters required' });
  const id = Date.now().toString();
  const delivery = { id, partnerId: partnerId || null, date, address, customerId: customerId || null, liters, extra: extra || 0, status: 'scheduled' };
  data.deliveries.push(delivery);
  writeData(data);
  res.json(delivery);
});

// Delivery partner: get today's deliveries by partner id
app.get('/api/partner/:id/deliveries', (req, res) => {
  const data = readData();
  const id = req.params.id;
  const today = new Date().toISOString().slice(0, 10);
  const list = data.deliveries.filter(d => d.partnerId === id && d.date === today);
  res.json(list);
});

// Customer: add extra for today
app.post('/api/customer/:id/extra', (req, res) => {
  const data = readData();
  const id = req.params.id;
  const { extraLiters } = req.body;
  if (typeof extraLiters !== 'number') return res.status(400).json({ error: 'extraLiters must be number' });
  // find today's delivery for this customer
  const today = new Date().toISOString().slice(0, 10);
  const delivery = data.deliveries.find(d => d.customerId === id && d.date === today);
  if (!delivery) return res.status(404).json({ error: 'no delivery for today' });
  delivery.extra = (delivery.extra || 0) + extraLiters;
  writeData(data);
  res.json(delivery);
});

// Customer: get today's plan (how much to add etc.)
app.get('/api/customer/:id/plan', (req, res) => {
  const data = readData();
  const id = req.params.id;
  const today = new Date().toISOString().slice(0, 10);
  const delivery = data.deliveries.find(d => d.customerId === id && d.date === today);
  if (!delivery) return res.json({ message: 'no delivery scheduled today' });
  res.json({ liters: delivery.liters, extra: delivery.extra || 0, address: delivery.address });
});

// Simple endpoints to list partners and deliveries
app.get('/api/partners', (req, res) => {
  const data = readData();
  res.json(data.partners);
});

app.get('/api/deliveries', (req, res) => {
  const data = readData();
  res.json(data.deliveries);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server running on port', port));
