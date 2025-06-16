import { useCallback } from 'react';
import { errorHandler } from '../utils/errorHandler';
import { ErrorHandlerOptions } from '../types/errors';

export const useErrorHandler = () => {
  const handleError = useCallback(
    async (
      error: any,
      options?: ErrorHandlerOptions,
      retryFunction?: () => Promise<any>
    ) => {
      return errorHandler.handleError(error, options, retryFunction);
    },
    []
  );

  const handleAsyncOperation = useCallback(
    async <T>(
      operation: () => Promise<T>,
      options?: ErrorHandlerOptions & {
        onSuccess?: (result: T) => void;
        onError?: (error: any) => void;
      }
    ): Promise<T | null> => {
      try {
        const result = await operation();
        if (options?.onSuccess) {
          options.onSuccess(result);
        }
        return result;
      } catch (error) {
        if (options?.onError) {
          options.onError(error);
        }
        
        await handleError(error, options, operation);
        return null;
      }
    },
    [handleError]
  );

  const createRetryHandler = useCallback(
    (
      operation: () => Promise<any>,
      options?: ErrorHandlerOptions
    ) => {
      return async () => {
        try {
          await operation();
        } catch (error) {
          await handleError(error, options, operation);
        }
      };
    },
    [handleError]
  );

  return {
    handleError,
    handleAsyncOperation,
    createRetryHandler,
  };
};

export default useErrorHandler; 