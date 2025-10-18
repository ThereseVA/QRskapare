declare module 'mammoth' {
  export interface ConversionResult {
    value: string;
    messages: any[];
  }

  export interface ConversionOptions {
    arrayBuffer?: ArrayBuffer;
    buffer?: Buffer;
    path?: string;
  }

  export function extractRawText(options: ConversionOptions): Promise<ConversionResult>;
  export function convertToHtml(options: ConversionOptions): Promise<ConversionResult>;
}