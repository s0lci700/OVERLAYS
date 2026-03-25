//Defines a standardized error format for service operations, with a code, message, optional context, and cause
export type ServiceErrorCode =
	| 'CONFIG'
	| 'VALIDATION'
	| 'NOT_FOUND'
	| 'UNAUTHORIZED'
	| 'NETWORK'
	| 'UNKNOWN';

/**
 * Normalized error shape for all PocketBase service failures.
 *
 * @property code - Error category for routing handler logic:
 *   - 'CONFIG': Environment or initialization failure
 *   - 'NOT_FOUND': Record does not exist (404)
 *   - 'VALIDATION': Invalid data payload (400/422)
 *   - 'UNAUTHORIZED': Auth failure (401/403)
 *   - 'NETWORK': Transport/connectivity failure
 *   - 'UNKNOWN': Unclassified error
 *
 * @property message - Human-readable error summary
 *
 * @property context - Optional debugging metadata { operation, id, collection, keys, ... }
 *
 * @property cause - Original PocketBase or transport error (for debugging only)
 *
 * @example
 * try {
 *   await getCharacterRecord(id);
 * } catch (err) {
 *   if (err instanceof ServiceError) {
 *     if (err.code === 'NOT_FOUND') navigate('/characters');
 *     if (err.code === 'VALIDATION') showFormError(err.message);
 *     if (err.code === 'UNAUTHORIZED') promptLogin();
 *   }
 * }
 */

//Custom error class for service operations, encapsulating a ServiceErrorCode, message, optional context, and cause
export class ServiceError extends Error {
	//The specific error code categorizing the type of error
	code: ServiceErrorCode;
	//Optional additional context about the error (e.g. operation, parameters)
	context?: Record<string, unknown>;
	//Optional original error that caused this error (e.g. caught exception)
	cause?: unknown;

	constructor(
		code: ServiceErrorCode,
		message: string,
		options?: {
			context?: Record<string, unknown>;
			cause?: unknown;
		}
	) {
		super(message);
		this.name = 'ServiceError';
		this.code = code;
		this.context = options?.context;
		this.cause = options?.cause;
	}
}
