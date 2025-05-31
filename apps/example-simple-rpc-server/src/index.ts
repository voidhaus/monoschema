import {
  GreetingInput,
  GreetingOutput,
  GreetingInputSchema,
  GreetingOutputSchema,
  SimpleApp,
  GetDateInputSchema,
  GetDateOutputSchema,
} from "@voidhaus/example-simple-rpc-types";
import { createRpc, output, procedure, input, resolver, namespace } from "@voidhaus/rpc";
import { configureMonoSchema } from "@voidhaus/monoschema";
import { createHyperExpressRpcServer } from "@voidhaus/rpc-hyper-express";

// Create the RPC router with the configured monoschema
// We can use monoschema plugins here to enhance the RPC functionality.
// For example we can add addition types for enums, or add a String<>Date pre-validation type conversion.
// See MonoSchema for more details on how to do this.
const router = createRpc({
  monoschema: configureMonoSchema(),
});

// The resolver function can be declared separately provided we have the input and output schemas defined.
const greetingResolver = resolver<GreetingInput, GreetingOutput>(({ name }) => {
  return {
    greeting: `Hello, ${name}!`,
  };
})
const greetingProcedure = procedure(
  input(GreetingInputSchema),
  output(GreetingOutputSchema),
  greetingResolver,
);

const rootNamespace = namespace({
  // Example of declarative resolver using the input and output schemas
  greeting: greetingProcedure,
  // Nested namespace example
  nested: namespace({
    // Example of inlining a resolver directly in the namespace
    getDate: procedure(
      input(GetDateInputSchema),
      output(GetDateOutputSchema),
      resolver(() => {
        return { date: new Date() };
      }),
    ),
  }),
})

// Example 1: Type inference - router infers the type automatically
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const appInferred = router(rootNamespace);

// Example 2: Type validation - router validates that rootNamespace matches SimpleApp structure
// If you try to pass a mismatched definition, you'll get a TypeScript error:
// const invalidNamespace = namespace({ wrongProcedureName: greetingProcedure });
// const appInvalid = router<SimpleApp>(invalidNamespace); // ❌ TypeScript error: Property 'greeting' is missing
const appValidated = router<SimpleApp>(rootNamespace);

// Create the HyperExpress RPC server using the validated app
const hyperExpressApp = createHyperExpressRpcServer(appValidated, {
  rpcPath: "/rpc",
})

// Start the HyperExpress server on port 3000
hyperExpressApp.listen(3000)
