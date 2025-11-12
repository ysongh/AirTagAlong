import express from 'express';
import cors from 'cors';
import pkg from 'body-parser';

import testRoutes from './routes/test.js';
import travelerRoutes from './routes/traveler.js';
import blindfoldRoutes from './routes/blindfold.js';
import { specs, swaggerUi } from './swagger.js';

const { json } = pkg;
const app = express();
const port = 4000;

app.use(cors());

// Middleware for parsing JSON bodies
app.use(json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use('/api/test', testRoutes);
app.use('/api/traveler', travelerRoutes);
app.use('/api/blindfold', blindfoldRoutes);

app.get('/', (req, res) => res.send('It Work'));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
