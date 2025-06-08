import type { Procedure, NamespaceWrapper, RpcContext } from '@voidhaus/rpc-types';

/**
 * Finds a procedure by method path within a nested namespace structure.
 * Supports dot-notation paths like 'namespace.subnamespace.procedure'.
 */
export function findProcedure(
  obj: unknown,
  methodPath: string[]
): Procedure<unknown, unknown> | null {
  if (methodPath.length === 0) return null;
  
  const [currentPath, ...remainingPath] = methodPath;
  if (!currentPath) return null;
  
  // Handle case where obj is a namespace wrapper
  if (isNamespaceWrapper(obj)) {
    obj = obj._namespace;
  }
  
  if (typeof obj !== 'object' || obj === null) return null;
  
  const current = (obj as Record<string, unknown>)[currentPath];
  
  if (!current) return null;
  
  if (remainingPath.length === 0) {
    // This should be a procedure
    if (isProcedure(current)) {
      return current as Procedure<unknown, unknown>;
    }
    return null;
  }
  
  // This should be a namespace
  if (isNamespaceWrapper(current)) {
    return findProcedure(current._namespace, remainingPath);
  }
  
  return null;
}

/**
 * Executes a procedure with the given input parameters.
 * Handles errors and returns appropriate JSON-RPC response format.
 * Supports both synchronous and asynchronous resolvers.
 */
export function executeProcedure(
  procedure: Procedure<unknown, unknown>,
  params: unknown,
  context: RpcContext
): { success: true; result: unknown } | { success: false; error: string } | Promise<{ success: true; result: unknown } | { success: false; error: string }> {
  try {
    const result = procedure._resolver(params, context);
    
    // Check if result is a Promise
    if (result instanceof Promise) {
      return result.then(
        (resolvedResult) => ({ success: true as const, result: resolvedResult }),
        (error) => {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
          return { success: false as const, error: `Internal error: ${errorMessage}` };
        }
      );
    }
    
    // Synchronous result
    return { success: true, result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: `Internal error: ${errorMessage}` };
  }
}

/**
 * Type guard to check if an object is a namespace wrapper.
 */
function isNamespaceWrapper(obj: unknown): obj is NamespaceWrapper<Record<string, unknown>> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '_tag' in obj &&
    (obj as { _tag: string })._tag === 'namespace'
  );
}

/**
 * Type guard to check if an object is a procedure.
 */
function isProcedure(obj: unknown): obj is Procedure<unknown, unknown> {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    '_tag' in obj &&
    (obj as { _tag: string })._tag === 'procedure'
  );
}
