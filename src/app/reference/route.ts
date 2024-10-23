// app/reference/route.ts
import { apiDocument } from '@/app/api/scraper/route';
import { ApiReference } from '@scalar/nextjs-api-reference';
import * as yaml from 'yaml';

// const config = {
//   spec: {
//     url: '/openapi.json',
//   },
// }

export const GET = ApiReference({
    spec: {
        content: yaml.stringify(apiDocument),
    },
});
