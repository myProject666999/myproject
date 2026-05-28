const { create } = require('xmlbuilder2');
const fs = require('fs');
const path = require('path');

class RSSGenerator {
    generateFeed(podcast, episodes, baseUrl) {
        const rss = create({ version: '1.0', encoding: 'UTF-8' })
            .ele('rss', {
                version: '2.0',
                'xmlns:itunes': 'http://www.itunes.com/dtds/podcast-1.0.dtd',
                'xmlns:content': 'http://purl.org/rss/1.0/modules/content/',
                'xmlns:atom': 'http://www.w3.org/2005/Atom'
            })
            .ele('channel');

        rss.ele('title').txt(podcast.title);
        rss.ele('description').txt(podcast.description || '');
        rss.ele('link').txt(podcast.website || baseUrl);
        rss.ele('language').txt(podcast.language || 'zh-CN');
        rss.ele('copyright').txt(`© ${new Date().getFullYear()} ${podcast.author || ''}`);
        
        if (podcast.cover_image) {
            rss.ele('itunes:image', { href: podcast.cover_image });
            rss.ele('image')
                .ele('url').txt(podcast.cover_image).up()
                .ele('title').txt(podcast.title).up()
                .ele('link').txt(podcast.website || baseUrl);
        }

        rss.ele('itunes:author').txt(podcast.author || '');
        rss.ele('itunes:subtitle').txt(podcast.description?.substring(0, 255) || '');
        rss.ele('itunes:summary').txt(podcast.description || '');
        rss.ele('itunes:explicit').txt(podcast.explicit ? 'yes' : 'no');

        if (podcast.category) {
            rss.ele('itunes:category', { text: podcast.category });
        }

        rss.ele('atom:link', {
            href: `${baseUrl}/rss/${podcast.id}`,
            rel: 'self',
            type: 'application/rss+xml'
        });

        for (const episode of episodes) {
            if (episode.status !== 'published') continue;

            const item = rss.ele('item');
            item.ele('title').txt(episode.title);
            item.ele('description').txt(episode.description || '');
            item.ele('pubDate').txt(new Date(episode.published_at || episode.created_at).toUTCString());
            item.ele('guid', { isPermaLink: 'false' }).txt(`episode-${episode.id}`);
            
            const audioUrl = `${baseUrl}/exports/${episode.id}.mp3`;
            item.ele('enclosure', {
                url: audioUrl,
                length: episode.file_size || 0,
                type: 'audio/mpeg'
            });

            item.ele('itunes:duration').txt(this.formatDuration(episode.duration));
            item.ele('itunes:author').txt(podcast.author || '');
            item.ele('itunes:subtitle').txt(episode.description?.substring(0, 255) || '');
            item.ele('itunes:summary').txt(episode.description || '');
            item.ele('itunes:explicit').txt('no');
            item.ele('itunes:episodeType').txt('full');
        }

        return rss.end({ prettyPrint: true });
    }

    formatDuration(seconds) {
        if (!seconds) return '00:00:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    async saveFeed(podcastId, xmlContent, outputDir) {
        const feedPath = path.join(outputDir, `feed_${podcastId}.xml`);
        fs.writeFileSync(feedPath, xmlContent, 'utf8');
        return feedPath;
    }
}

module.exports = new RSSGenerator();
