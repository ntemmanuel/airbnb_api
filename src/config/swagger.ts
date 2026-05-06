import type { Express, Request, Response } from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Airbnb API',
      version: '1.0.0',
      description: 'A professional Airbnb clone API with full documentation.',
    },

    // ✅ FIXED: API version prefix included
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Local server (v1)',
      },
      {
        url:'https://airbnb-api-j34t.onrender.com/api/v1',
        description:'production server'
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },

  // ⚠️ Important: ensure this matches your structure
  apis: ['./src/routes/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export function setupSwagger(app: Express) {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('/api-docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('✅ Swagger docs available at http://localhost:3000/api-docs');
}
