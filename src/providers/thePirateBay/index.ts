import axios from 'axios';
import { CheerioAPI, Element, load } from 'cheerio';
import { BaseParser, Torrent } from '../../@types';
import { USER_AGENT, site_urls } from '../../utils';

class ThePirateBay extends BaseParser {
  name = 'The Pirate Bay';
  baseUrl = site_urls.TPB;

  async search(query: string, ...args: any[]): Promise<Torrent[]> {
    try {
      const url = `${this.baseUrl}/search/${query}/1/99/0`;

      const res = await axios.get(url, {
        headers: { 'User-Agent': USER_AGENT },
      });

      const $ = load(res.data);
      const $element = $('table tbody');
      const torrents: Torrent[] = [];
      for (const torrent of $element.find('tr:not(:last-child)')) {
        const torrentDetails = await this.scrape(torrent, $);
        torrents.push(torrentDetails);
      }

      return torrents;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  private async scrape(torrent: Element, $: CheerioAPI): Promise<Torrent> {
    const name = $(torrent).find('.detName .detLink').text().trim();
    const url = $(torrent).find('.detName .detLink').attr('href')!;
    const magnet = $(torrent).find('a[href^="magnet:?xt=urn:btih"]').attr('href');
    const seeders = parseInt($(torrent).find('td').eq(2).text().trim(), 10);
    const leechers = parseInt($(torrent).find('td').eq(3).text().trim(), 10);
    const sizeInfo = $(torrent).find('.detDesc').text().trim();
    const size = sizeInfo.split(',')[1].replace('Size', '').trim();

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

export default ThePirateBay;
