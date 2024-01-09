export type Torrent = {
  name: string;
  size: string;
  seeders: number;
  leechers: number;
  url: string;
  magnet?: string;
};
