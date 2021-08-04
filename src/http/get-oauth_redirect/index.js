const arc = require('@architect/functions');

exports.handler = arc.http.async(async function http (req) {
  if (req.queryStringParameters && req.queryStringParameters.code) {
    // Likely redirect from Slack w/ code to use for exchange
    // Delegate to async event to handle doing the exchange and saving the
    // access token to our database
    await arc.events.publish({ name: 'oauth-access', payload: {
      code: req.queryStringParameters.code,
      redirect_uri: `https://${req.requestContext.domainName}/oauth-redirect`
    }});
  }
  return {
    statusCode: 200,
    headers: {
      'cache-control': 'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
      'content-type': 'text/html; charset=utf8'
    },
    body: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Architect Slack App OAuth Redirect</title>
</head>
<body>
  <h1>
    Hello new application user! Welcome!
  </h1>
</body>
</html>
`
  }
});
