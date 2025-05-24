import { describe, it, expect } from 'vitest';
import { createRpc, procedure } from '../index';
import { configureMonoSchema } from '@voidhaus/monoschema';

describe('RPC Tests', () => {
  it('should set up RPC correctly', () => {
    const router = createRpc({
      monoschema: configureMonoSchema(),
    })
    router({
      hello:
        procedure()
          // input should be a monoschema schema
          .input({
            name: {
              $type: String,
            },
          } as const)
          // output should be a monoschema schema
          .output({
            greeting: {
              $type: String,
            },
          } as const)
          // input for resolve should be the inferred type from the input schema
          // output for resolve should be the inferred type from the output schema
          .resolve(({ name }) => {
            // We have full type safety here
            return {
              greeting: `Hello, ${name}!`,
            };
          })
    })
  })
})