const process = require('process');
const path = require('path');
const fs = require('fs');
const RssParser = require('rss-parser')
const axios = require('axios');

function isURL(url) {
  let isUrl;
  try {
    const z = new URL(url);
    isUrl = true;
  } catch {
    isUrl = false;
  }
  return isUrl;
}

async function getFeedXml(url) {
  let xml = '<noset/>';

  if (isURL(url)) {
    const response = await axios.get(url, {responseType: 'text'});
    xml = response.data;
  } else {
    const rssPath = path.join(__dirname, url);
    xml = (await fs.readFileSync(rssPath, 'utf-8')).toString();
  }
  return xml;
}
 
(async () => {
  let args = process.argv.slice(2);

  if (args.length < 1) {
    process.exit(-200);
  }
  const outputPath = args[0];
  if ( !outputPath ) {
    process.exit(-201);
  }

  const parser = new RssParser()

  // const xml = await getFeedXml('./rss.xml'); // standalone debug
  const xml = await getFeedXml('https://note.com/hosts2ch/rss');

  const feed = await parser.parseString(xml)
  const latest = feed.items[0];

  // generate output result
  const content = JSON.stringify(
    {
      ...latest
      // description: he.decode(latest.description),
      // link: he.decode(latest.link),
      // pubDate: he.decode(latest.pubDate),
    }
  );


  const contentPath = outputPath;//path.join(__dirname, './latestblog.json');
  await fs.writeFile(contentPath, content, 'utf8', error => {
    if (error) {
      process.exit(-3);
    }
  });
  // process.stdout.write(content);
})();