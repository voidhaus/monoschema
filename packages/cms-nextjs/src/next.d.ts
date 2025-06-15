// Next.js module declarations for library package
declare module 'next/server' {
  export interface NextRequest {
    nextUrl: {
      pathname: string;
      searchParams: URLSearchParams;
    };
    cookies: {
      get(name: string): { value: string } | undefined;
    };
    url: string;
    json(): Promise<any>;
  }

  export class NextResponse {
    static next(): NextResponse;
    static redirect(url: string | URL): NextResponse;
    static json(body: any, init?: ResponseInit): NextResponse;
  }
}

declare module 'next/navigation' {
  export function useRouter(): {
    push(href: string): void;
    replace(href: string): void;
    back(): void;
    forward(): void;
  };

  export function useSearchParams(): URLSearchParams;
  export function redirect(url: string): never;
}

declare module 'next/headers' {
  export function cookies(): {
    get(name: string): { value: string } | undefined;
    set(name: string, value: string, options?: any): void;
    delete(name: string): void;
  };

  export function headers(): {
    get(name: string): string | null;
  };
}
