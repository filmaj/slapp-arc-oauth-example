const arc = require('@architect/functions');
const { WebClient } = require('@slack/web-api');
const slack = new WebClient();

exports.handler = arc.events.subscribe(async function subscribe (event) {
  let { code, redirect_uri } = event;
  if (!code) return;
  console.log('Got temporary access code', code, '- asking for access token');
  const result = await slack.oauth.v2.access({
    client_id: process.env.SLACK_CLIENT_ID,
    client_secret: process.env.SLACK_CLIENT_SECRET,
    code,
    redirect_uri
  });
  let token = result.access_token;
  delete result.access_token;
  console.log('Got exchange answer', result);
  const tables = await arc.tables();
  const data = tables.data;
  let dbRecord = {
    pk: result.team.id,
    sk: '#META',
    token: token,
    team: result.team.id
  };
  if (result.enterprise) dbRecord.enterprise = result.enterprise.id;
  await data.put(dbRecord);
  console.log('Saved to db');
});
