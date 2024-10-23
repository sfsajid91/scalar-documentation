import { takeScreenshot } from '@/lib/takeScreenshot';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
    createDocument,
    extendZodWithOpenApi,
    ZodOpenApiOperationObject,
} from 'zod-openapi';

extendZodWithOpenApi(z);

const schema = z.object({
    url: z.string().url().openapi({
        description: 'The URL to take a screenshot of',
        example: 'https://www.google.com',
    }),
});

schema.openapi({ ref: 'Scraper' });

const operation: ZodOpenApiOperationObject = {
    tags: ['Scraper'],
    operationId: 'takeScreenshot',
    summary: 'Take a screenshot of a URL',
    description: 'Take a screenshot of a URL',
    parameters: [
        {
            name: 'url',
            in: 'query',
            description: 'The URL to take a screenshot of',
            required: true,
            schema: {
                type: 'string',
                format: 'uri',
            },
            example: 'https://www.google.com',
        },
    ],
    responses: {
        200: {
            description: 'Screenshot of the URL',
            content: {
                'image/png': {
                    schema: { type: 'string', format: 'binary' },
                },
            },
        },
        400: {
            description: 'Invalid URL',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: { error: { type: 'string' } },
                    },
                    example: { error: 'Invalid URL' },
                },
            },
        },
        500: {
            description: 'Failed to take screenshot',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: { error: { type: 'string' } },
                    },
                    example: { error: 'Failed to take screenshot' },
                },
            },
        },
    },
};

export const apiDocument = createDocument({
    openapi: '3.1.0',
    info: {
        title: 'Scraper',
        description: 'Take a screenshot of a URL',
        version: '1.0.0',
    },
    paths: {
        '/scraper': {
            get: operation,
        },
    },
    servers: [
        {
            url: 'http://localhost:3000/api',
            description: 'Local server',
        },
    ],
    components: {
        schemas: {
            Scraper: schema,
        },
    },
});

export const GET = async (request: NextRequest) => {
    const { searchParams } = request.nextUrl;
    const url = searchParams.get('url');

    const validatedUrl = schema.safeParse({ url });
    console.log('validatedUrl', validatedUrl);

    if (!validatedUrl.success) {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const screenshot = await takeScreenshot(validatedUrl.data.url);

    if (!screenshot) {
        return NextResponse.json(
            { error: 'Failed to take screenshot' },
            { status: 500 }
        );
    }

    // send the screenshot file as response
    return new NextResponse(screenshot, {
        headers: { 'Content-Type': 'image/png' },
    });
};
