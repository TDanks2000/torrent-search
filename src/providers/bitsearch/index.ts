import axios from 'axios';
import { load } from 'cheerio';
import { BaseParser, Torrent } from '../../@types';
import { USER_AGENT, filterEmptyObjects, site_urls } from '../../utils';

class BitSearch extends BaseParser {
  name = 'BitSearch';
  baseUrl = site_urls.BIT_SEARCH;

  async search(query: string, ...args: any[]): Promise<Torrent[]> {
    try {
      const url = `${this.baseUrl}/search?q=${query}`;

      const res = await axios.get(url, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      const $ = load(res.data);

      const torrents: Torrent[] = $('li.search-result')
        .map((i, torrent) => ({
          name: $(torrent).find('h5 a').text().trim(),
          size: $(torrent).find('img[alt="Size"]').parent().text().trim(),
          seeders: parseInt($(torrent).find('img[alt="Seeder"]').parent().text().trim(), 10),
          leechers: parseInt($(torrent).find('img[alt="Leecher"]').parent().text().trim(), 10),
          url: `${this.baseUrl}${$(torrent).find('h5 a').attr('href')}`,
          magnet: $(torrent).find('.links a.dl-magnet').attr('href'),
        }))
        .get();

      return filterEmptyObjects(torrents);
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }
}

export default BitSearch;
