import { Torrent } from '../@types';

export const filterEmptyObjects = (torrents: Torrent[]): Torrent[] =>
  torrents.filter(
    (torrent) =>
      torrent.name !== undefined &&
      torrent.name !== '' &&
      torrent.magnet !== undefined &&
      torrent.magnet !== '' &&
      torrent.size !== undefined &&
      torrent.seeders !== undefined &&
      torrent.leechers !== undefined,
  );
