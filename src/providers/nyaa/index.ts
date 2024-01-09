import axios from 'axios';
import { CheerioAPI, Element, load } from 'cheerio';
import { BaseParser, Torrent } from '../../@types';
import { site_urls } from '../../utils';

class Nyaa extends BaseParser {
  name = 'Nyaa';
  baseUrl = site_urls.NYAA;

  async search(query: string, ...args: any[]): Promise<Torrent[]> {
    try {
      const searchUrl = `${this.baseUrl}/?q=${query}&f=0&c=0_0`;
      const response = await axios.get(searchUrl, {
        headers: {},
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
    const name = $(torrent).find('td').eq(1).find('a:not(.comments)').text().trim();
    const magnet = $(torrent).find('a[href^="magnet:?xt=urn:btih"]').attr('href');
    const size = $(torrent).find('td').eq(3).text().trim();
    const seeders = parseInt($(torrent).find('td').eq(5).text().trim(), 10);
    const leechers = parseInt($(torrent).find('td').eq(6).text().trim(), 10);
    const findUrl = $(torrent).find('td').eq(1).find('a:not(.comments)').attr('href');
    const url = `${this.baseUrl}${findUrl}`;

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

export default Nyaa;
