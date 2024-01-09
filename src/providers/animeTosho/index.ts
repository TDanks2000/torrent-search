import axios from 'axios';
import { CheerioAPI, Element, load } from 'cheerio';
import { BaseParser, Torrent } from '../../@types';
import { USER_AGENT, site_urls } from '../../utils';

class AnimeTosho extends BaseParser {
  name = 'Anime Tosho';
  baseUrl = site_urls.ANIME_TOSHO;

  async search(query: string, ...args: any[]): Promise<Torrent[]> {
    try {
      const searchUrl = `${this.baseUrl}/search?q=${query}`;
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': USER_AGENT,
        },
      });
      const $ = load(response.data);
      const $element = $('#content');
      const torrents: Torrent[] = [];
      for (const torrent of $element.find('.home_list_entry')) {
        const torrentDetails = await this.scrape(torrent, $);
        torrents.push(torrentDetails);
      }

      return torrents;
    } catch (error) {
      throw new Error((error as Error).message);
    }
  }

  private async scrape(torrent: Element, $: CheerioAPI): Promise<Torrent> {
    const name = $(torrent).find('.link a').text().trim();
    const url = $(torrent).find('.link a').attr('href')!;
    const size = $(torrent).find('.size').text().trim();
    const magnet = $(torrent).find('a[href^="magnet:?xt=urn:btih"]').attr('href');
    const SL = $(torrent).find('span[style*="color: #808080;"]').text().trim();

    // Regular expression to match numbers and arrows
    const regex = /(\d+)\s*↑\/\s*(\d+)\s*↓/;

    // Match the regular expression against the span content
    const match = SL.match(regex);

    // Extract seeders and leechers
    const seeders = match ? parseInt(match[1], 10) : 0;
    const leechers = match ? parseInt(match[2], 10) : 0;

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

export default AnimeTosho;
