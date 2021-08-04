exports.handler = async function http (req) {
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
  <title>Architect Slack App</title>
</head>
<body>
  <h1>Amazing Slack App!</h1>
  <br/>
  <a href="https://slack.com/oauth/v2/authorize?scope=app_mentions:read,chat:write&client_id=${process.env.SLACK_CLIENT_ID}&redirect_uri=${encodeURIComponent(`https://${req.requestContext.domainName}/oauth-redirect`)}"><img alt=""Add to Slack"" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcset="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>
</body>
</html>
`
  }
}
