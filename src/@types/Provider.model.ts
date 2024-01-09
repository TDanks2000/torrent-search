import { Torrent } from './types';

abstract class BaseParser {
  abstract readonly name: string;
  protected abstract readonly baseUrl: string;

  abstract search(query: string, ...args: any[]): Promise<Torrent[]>;
}

export { BaseParser };
