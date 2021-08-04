const arc = require('@architect/functions');

exports.handler = arc.http.async(async function http (req) {
  const body = req.body;
  if (!body) {
    return {
      statusCode: 400,
      headers: {
        'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
        'content-type': 'text/plain'
      },
      body: ''
    };
  }
  console.log('Payload received', body);
  // Initial config / set up of Slack Events API
  if (body && body.challenge && body.type === 'url_verification') {
    return {
      statusCode: 200,
      headers: {
        'content-type': 'text/plain'
      },
      body: body.challenge
    };
  }
  // Which events from the Event API we want to handle?
  // The ones we do, offload to a pub/sub async topic (AWS SNS) so as to not
  // block the HTTP response
  if (body && body.event && body.event.type) {
    switch (body.event.type) {
      case 'app_mention':
        let payload = {
          channel: body.event.channel,
          team: body.team_id
        };
        if (body.event.thread_ts) {
          payload.thread_ts = body.event.thread_ts;
          payload.text = 'Responding to in-thread app mention - inside the thread';
        } else {
          payload.thread_ts = body.event.ts;
          payload.text = 'Responding to parent message app mention - but inside the thread';
        }
        await arc.events.publish({
          name: 'post-message',
          payload
        });
        break;
      default:
        break;
    }
  }
  return {
    statusCode: 200,
    headers: {
      'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
      'content-type': 'text/plain'
    },
    body: ''
  };
});
