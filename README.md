# Architect-based Slack App With OAuth

> Building a Slack application with OAuth using [architect][arc]

## Overview

This Slack app is a simplistic example: it responds to at-mentions by posting a
reply within a thread of the original at-mention message. It is built with
[architect][arc], a serverless application framework.

The main components of the application are declared using the `app.arc` manifest
file. It defines several HTTP routes (under the `@http` section), two
asynchronous publish/subscript topics (under the `@events` section) and a
database table (under the `@tables` section). Code for these HTTP and event routes
are located under `src/`.

### HTTP Routes

- `get /`: a simple index route for when you load the `/` URL. It contains an
    "Add to Slack" button to allow for people to install the app.
- `post /events`: Handles HTTP POST requests to the `/events` URL. Events via
    the [Events API from Slack][events] will be posted to this route.
- `get /oauth-redirect`: Users installing the app will go through an OAuth
    dance; after a successful dance, installing users will be redirected to this
    URL.

### Asynchronous Events

- `post-message`: this event handler does nothing more than execute the
    `chat.postMessage` Slack API. By offloading this task to an async event, we
    don't block the HTTP response back to Slack with Slack API calls. This keeps
    our app responsive and ensures we fit under the 3 second Slack response timeout.
- `oauth-access`: when a user installs your app to a Slack workspace, they will
    get redirected back to this application with a temporary access code. This
    event handler uses this access code to exchange it for an access token that
    it then stores in the database for use again in the future.

### Database

Defined under the `@tables` section of the `app.arc` manifest, the DB is used to
solely store access tokens for different Slack workspaces.

## Requirements

- node.js 12 or newer
- an AWS account with credentials to this account set up locally. It is
    probably best to [install the AWS
    CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html)
    and then run through the [configuration
    basics](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-quickstart.html)
    in order to set up your account credentials on your machine.
- [create a Slack app](https://api.slack.com/authentication/basics) and
    configure the app on [api.slack.com/apps][apps] as
    follows:
  - click on your new app and under OAuth & Permissions:
    - under Scopes -> Bot Token Scopes, add the `app_mention` and `chat:write` scopes
  - head to the Basic Information page of your app, and make note of your client
      ID and secret - you'll need these in the next section.

## Getting Started

First make sure you have met the [requirements](#requirements) above!

Then, clone this repo, install the dependencies and set up the app client ID and
secret as environment variables in the app:

    cd into/this/project
    npm install
    arc env staging SLACK_CLIENT_ID <your-client-id> # see Requirements above
    # if you are asked about creating a local preferences file, you can tell arc "no"
    arc env staging SLACK_CLIENT_SECRET <your-client-secret> # see Requirements above

Next, we will deploy this app to the world!

    arc deploy

Deploying might need a little bit of time - usually no more than a few minutes.
If the command completed successfully, you should see a URL outputted at the
end. Load that URL to see an Add to Slack button - but don't click it just yet!
We still need to configure the Slack app.

Next we will use this URL to register our app with Slack events. As we defined
in the `app.arc` manifest, we created an HTTP POST handler for the `/events`
path. We will provide this path, prefixed with the URL outputted from the `arc
deploy` command, to Slack so that Slack sends events from its [Events
API][events] to our application. This is a key concept in how this app works:
events from Slack get POST'ed over HTTP to our app's `/events` route. This HTTP
handler determines what action to take and fires off an asynchronous task using
[architect's `@events` primitive](https://arc.codes/docs/en/reference/app.arc/events).
In our application, we have an `@event` called `post-message` which, as
you probably guessed, posts a chat message to Slack.

OK, back to registering events with our app! After running `arc deploy`, the
command should have output something like this at the end:

    ✓ Success! Deployed app in 118.353 seconds

    https://someid.execute-api.us-west-2.amazonaws.com

Let's take this URL and add `/events` at the end - and this will be our event
subscription URL we will enter under the Slack app's Event Subscriptions
section. Using the above example, our Event Subscriptions Request URL is
`https://someid.execute-api.us-west-2.amazonaws.com/events`.

Once you enter the above URL into the Event Subscriptions Request URL field under
[your app on api.slack.com][apps], after a few seconds the field should show
"Verified" in green.

Next, under the Subscribe to bot events section of the Event Subscriptions page,
click 'Add Bot User Event' and select `app_mention`. Click 'Save Changes' at the
bottom of the page. Now, every time your app is at-mentioned, the
`src/http/post-events` route in this project will be triggered with a payload
from Slack!

Lastly, head to OAuth & Permissions in your [app on api.slack.com][apps]. Scroll
down to Redirect URLs and add the domain name where your app was deployed. Using
our above example, you would add
`https://someid.execute-api.us-west-2.amazonaws.com` as a redirect URL.

Give it a shot! Invite your app to a channel, and then post a message to that
channel with an at-mention of your bot. The bot should answer you inside the
thread.

[arc]: https://arc.codes
[apps]: https://api.slack.com/apps
[events]: https://api.slack.com/apis/connections/events-api
