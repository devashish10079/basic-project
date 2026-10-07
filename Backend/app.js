require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const data = require('./data.json');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    // If FRONTEND_URL is not set, allow all origins (useful in initial dev/test)
    if (!FRONTEND_URL) return callback(null, true);

    const allowedOrigins = [
      FRONTEND_URL,
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:3000',
    ];

    // Allow specified origins or any Vercel preview domain
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/react_backend';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch((err) => {
    console.warn('MongoDB connection warning (falling back to data.json):', err.message);
  });

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Serving fallback data.');
});

// Example Product Schema & Model
const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    price: { type: Number, required: true },
    description: String,
    category: String,
    rating: { type: Number, default: 0 },
    thumbnail: String,
    stock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);

// ==========================================
// Routes
// ==========================================

// 1. Root route - Health check
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API is running...',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected (using fallback)',
  });
});

// 2. GET all products (MongoDB with data.json fallback)
app.get('/api/products', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const products = await Product.find();
      if (products && products.length > 0) {
        return res.json(products);
      }
    }
    // Fallback to data.json
    res.json(data.products || []);
  } catch (error) {
    console.error('Error in GET /api/products:', error.message);
    res.json(data.products || []);
  }
});

// 3. GET product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    let product = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findById(req.params.id);
    }

    // Fallback: search in data.json by numeric/string id
    if (!product && data.products) {
      product = data.products.find((p) => String(p.id) === String(req.params.id));
    }

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error in GET /api/products/:id:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// 4. POST create a new product
app.post('/api/products', async (req, res) => {
  try {
    const { title, price } = req.body;
    if (!title || price === undefined) {
      return res.status(400).json({ message: 'Title and price are required' });
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected. Cannot create product.' });
    }

    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error in POST /api/products:', error.message);
    res.status(400).json({ message: error.message });
  }
});

// 5. DELETE product by ID
app.delete('/api/products/:id', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected. Cannot delete product.' });
    }

    let deletedProduct = null;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      deletedProduct = await Product.findByIdAndDelete(req.params.id);
    } else {
      deletedProduct = await Product.findOneAndDelete({ id: req.params.id });
    }

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /api/products/:id:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// 6. Seed data.json into MongoDB (Protected in production)
app.get('/api/seed', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    const seedKey = req.query.key || req.headers['x-seed-key'];
    if (!process.env.SEED_KEY || seedKey !== process.env.SEED_KEY) {
      return res.status(403).json({ message: 'Seeding is protected in production. Provide a valid seed key.' });
    }
  }

  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'Database is not connected. Cannot seed.' });
    }

    await Product.deleteMany({});
    const inserted = await Product.insertMany(data.products);
    res.json({ message: 'Database seeded from data.json successfully!', count: inserted.length });
  } catch (error) {
    console.error('Error in GET /api/seed:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
