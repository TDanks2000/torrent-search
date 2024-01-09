import axios from 'axios';
import { CheerioAPI, Element, load } from 'cheerio';
import { BaseParser, Torrent } from '../../@types';
import { USER_AGENT, site_urls } from '../../utils';

class Anidex extends BaseParser {
  name = 'Anidex';
  baseUrl = site_urls.ANIDEX;

  async search(query: string, ...args: any[]): Promise<Torrent[]> {
    try {
      const searchUrl = `${this.baseUrl}/?page=search&id=0&lang_id=&group_id=0&q=${query}`;
      const response = await axios.get(searchUrl, {
        headers: {
          Cookie: site_urls.DDG_COOKIES,
          'User-Agent': USER_AGENT,
        },
      });
      const $ = load(response.data);
      const $element = $('table tbody');
      const torrents: Torrent[] = [];
      for (const torrent of $element.find('tr')) {
        const torrentDetails = await this.scrape(torrent, $);
        torrents.push(torrentDetails);
      }
      return torrents;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  private async scrape(torrent: Element, $: CheerioAPI): Promise<Torrent> {
    const findUrl = $(torrent).find('.torrent').attr('href');
    const url = `${this.baseUrl}${findUrl}`;
    const name = $(torrent).find('.torrent .span-1440').attr('title')!;
    const magnet = $(torrent).find('a[href^="magnet:?xt=urn:btih"]').attr('href');
    const size = $(torrent).find('td').eq(6).text().trim();
    const seeders = parseInt($(torrent).find('td').eq(8).text().trim(), 10);
    const leechers = parseInt($(torrent).find('td').eq(9).text().trim(), 10);

    return {
      name,
      size,
      seeders,
      leechers,
      url,
      magnet,
    };
  }
}

export default Anidex;
