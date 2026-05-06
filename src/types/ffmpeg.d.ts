// FFmpeg 模块类型声明
declare module '@ffmpeg/ffmpeg' {
  export class FFmpeg {
    load(options?: {
      coreURL?: string;
      wasmURL?: string;
    }): Promise<void>;
    writeFile(name: string, data: Uint8Array | string): Promise<void>;
    readFile(name: string): Promise<Uint8Array>;
    exec(args: string[]): Promise<number>;
    deleteFile(name: string): Promise<void>;
    on(event: string, callback: (...args: unknown[]) => void): void;
    terminate(): void;
  }
}

declare module '@ffmpeg/util' {
  export function fetchFile(file: File | Blob | string): Promise<Uint8Array>;
  export function toBlobURL(url: string, mimeType: string): Promise<string>;
}
