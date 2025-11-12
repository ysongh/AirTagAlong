import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Documentation',
      version: '1.0.0',
      description: 'API documentation for your Express application',
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Development server',
      },
    ],
  },
  // Path to the API routes where you'll add JSDoc comments
  apis: ['./routes/*.js'], // Adjust this path to match your project structure
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };