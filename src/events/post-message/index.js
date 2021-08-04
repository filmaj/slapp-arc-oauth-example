const arc = require('@architect/functions');
const { WebClient } = require('@slack/web-api');

exports.handler = arc.events.subscribe(async function subscribe (event) {
  const { text, thread_ts, channel, team } = event;
  const tables = await arc.tables();
  const data = tables.data;
  const installation = await data.get({ pk: team, sk: '#META' });
  if (!installation) {
    console.error('Installation not found for team!', team);
    return;
  }
  const token = installation.token || process.env.BOT_TOKEN;
  const slack = new WebClient(token);
  await slack.chat.postMessage({ channel, text, thread_ts });
});
