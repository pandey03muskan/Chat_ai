declare module 'sse' {
    export default class SSE {
      addEventListener(arg0: string, arg1: (e: any) => void) {
        throw new Error("Method not implemented.");
      }
      close() {
        throw new Error("Method not implemented.");
      }
      constructor(response: any, options?: any);
      send(data: string, eventName?: string, id?: string): void;
    }
  }
  