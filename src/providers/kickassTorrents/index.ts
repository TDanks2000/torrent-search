import axios from 'axios';
import { CheerioAPI, Element, load } from 'cheerio';
import { BaseParser, Torrent } from '../../@types';
import { USER_AGENT, site_urls } from '../../utils';

class KickAssTorrents extends BaseParser {
  name = 'Kick Ass Torrents';
  baseUrl = site_urls.KICKASS;

  async search(query: string, ...args: any[]): Promise<Torrent[]> {
    try {
      const url = `${this.baseUrl}/usearch/${query}/`;

      const res = await axios.get(url, {
        headers: { 'Content-Type': 'text/html', 'User-Agent': USER_AGENT },
      });

      const $ = load(res.data);
      const $element = $('table.data tbody');

      const torrents: Torrent[] = [];

      for (const torrent of $element.find('tr:not(.firstr)')) {
        const torrentDetails = await this.scrape(torrent, $);
        torrents.push(torrentDetails);
      }

      return torrents;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  private async scrape(torrent: Element, $: CheerioAPI): Promise<Torrent> {
    const name = $(torrent).find('td .torrentname div a').eq(0).text().trim();
    const torrentUrl = $(torrent).find('td .torrentname div a').eq(0).attr('href');
    const size = $(torrent).find('td').eq(1).text().trim();
    const seeders = parseInt($(torrent).find('td').eq(4).text().trim(), 10);
    const leechers = parseInt($(torrent).find('td').eq(5).text().trim(), 10);

    const url = `${this.baseUrl}${torrentUrl}`;
    const magnetPage = await axios.get(url);
    const magnetLink = load(magnetPage.data);
    const magnet = magnetLink('a[href^="magnet:?xt=urn:btih"]').attr('href');

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

export default KickAssTorrents;
