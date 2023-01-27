import express from 'express';
import https from 'https';

import path from 'node:path';

require('dotenv').config({ path: path.join(__dirname, '../.env') });

const KEY = process.env.API_KEY;
const app = express();
const port = 8080;

app.get('/', async (req, res) => {
  const channelNames: string[] = (req.query.name as string).split('%25');
  const getID = (channelName: string) => new Promise((resolve) => {
    https.get(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&eventType=live&q=${channelName?.split(' ').join('%20')}&type=video&key=${KEY}`, (resp) => {
      let data = '';

      resp.on('data', (chunk) => {
        data += chunk;
      });

      resp.on('end', () => {
        resolve(JSON.parse(data)?.items[0]?.id?.videoId ?? 'No live stream found');
      });
    });
  });

  const idArray = channelNames.map(async (channelName) => getID(channelName));

  const IDs = await Promise.all(idArray);

  const response = {
    status: 'success',
    channels: IDs,
  };

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  res.send(response);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Quell server started at port: ${port}!`);
});
