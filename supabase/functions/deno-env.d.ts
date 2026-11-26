/**
 * The bits of the Deno global the Edge Functions use — only for type-checking them with the project's tsc
 * (tsconfig.functions.json). The Deno runtime has the real (wider) declarations; this file is not imported.
 */
declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (request: Request) => Response | Promise<Response>): unknown;
};
