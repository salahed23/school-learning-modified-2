<?php

namespace App;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'School Learning API',
    description: 'API for School Learning application with JWT authentication',
    contact: new OA\Contact(email: 'support@example.com')
)]
#[OA\Server(
    url: 'http://localhost:8002',
    description: 'Local development server'
)]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
    description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
)]
class Info
{
}
