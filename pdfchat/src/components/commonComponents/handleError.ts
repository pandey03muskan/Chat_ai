import { AxiosError } from "axios";
 
export const handleError = (error: AxiosError | string): string => {
  if (typeof error === "string") {
    return `${error}!`;
  }
 
  if (typeof error !== "string" && error.response) {
    switch (error.response.status) {
      case 400:
        return "Bad Request: The server could not understand the request due to invalid syntax!";
      case 401:
        return "Unauthorized: You must be authenticated to access this resource!";
      case 403:
        return "Forbidden: You do not have permission to access this resource!";
      case 404:
        return "Not Found: The requested resource could not be found on this server!";
      case 405:
        return "Method Not Allowed: The request method is not supported for the requested resource!";
      case 408:
        return "Request Timeout: The server timed out waiting for the request!";
      case 409:
        return "Conflict: The request could not be processed because of a conflict in the request!";
      case 410:
        return "Gone: The requested resource is no longer available and will not be available again!";
      case 422:
        return "Unprocessable Entity: The server understands the content type of the request entity, but the server was unable to process the contained instructions!";
      case 429:
        return "Too Many Requests: You have sent too many requests in a given amount of time!";
      case 500:
        return "Internal Server Error: The server encountered an internal error and was unable to complete your request!";
      case 501:
        return "Not Implemented: The server does not support the functionality required to fulfill the request!";
      case 502:
        return "Bad Gateway: The server, while acting as a gateway or proxy, received an invalid response from the upstream server!";
      case 503:
        return "Service Unavailable: The server is currently unavailable (because it is overloaded or down for maintenance)!";
      case 504:
        return "Gateway Timeout: The server, while acting as a gateway or proxy, did not receive a timely response from the upstream server!";
      case 505:
        return "HTTP Version Not Supported: The server does not support the HTTP protocol version used in the request!";
      default:
        return `API Error (Status ${error.response.status}): ${error.response.statusText}!`;
    }
  } else {
    return `Unknown Error: ${error.message}!`;
  }
};