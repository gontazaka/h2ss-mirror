const process = require('process');
const parser = require('fast-xml-parser')
const he = require('he');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

function isURL(url) {
  let isUrl;
  try {
    release_url = new URL(url);
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

  // xml = getRssContent('./rss.xml'); // standalone debug
  const xml = await getFeedXml('https://note.com/hosts2ch/rss');

  if ( !parser.validate(xml) ) {
    process.exit(-1);
  }
  const parsed = parser.parse(xml);

  const latest = parsed?.rss?.channel?.item[0];
  if ( !latest ) {
    process.exit(-2);
  }
  
  // generate output result
  const content = JSON.stringify(
    {
      ...latest
      // description: he.decode(latest.description),
      // link: he.decode(latest.link),
      // pubDate: he.decode(latest.pubDate),
    }
  );


  const outputJson = outputPath;//path.join(__dirname, './latestblog.json');
  await fs.writeFile(outputJson, content, 'utf8', error => {
    if (error) {
      process.exit(-3);
    }
  });
  // process.stdout.write(content);
})();