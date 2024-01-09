import axios from 'axios';
import { CheerioAPI, Element, load } from 'cheerio';
import { BaseParser, Torrent } from '../../@types';
import { USER_AGENT, site_urls } from '../../utils';

class One337x extends BaseParser {
  name = '1337x';
  baseUrl = site_urls.ONE337X;

  async search(query: string, ...args: any[]): Promise<Torrent[]> {
    try {
      const searchUrl = `${this.baseUrl}/srch?search=${query}`;
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      const $ = load(response.data);
      const torrents: Torrent[] = [];
      const torrentTable = $('.table-list tbody tr');
      for (let i = 0; i < torrentTable.length; i++) {
        const tr = torrentTable[i];
        const torrentDetails = await this.scrape(tr, $);
        torrents.push(torrentDetails);
      }

      return torrents;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  private async scrape(torrent: Element, $: CheerioAPI): Promise<Torrent> {
    const name = $(torrent).find('.coll-1.name a').last().text().trim();
    const url = `${this.baseUrl}${$(torrent).find('.coll-1.name a').last().attr('href')}`;
    const seeders = parseInt($(torrent).find('.coll-2.seeds').text().trim(), 10);
    const leechers = parseInt($(torrent).find('.coll-3.leeches').text().trim(), 10);
    const size = $(torrent).find('.coll-4.size').text().trim().replace(seeders.toString(), '');
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

export default One337x;
