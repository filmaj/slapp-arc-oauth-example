@app
slapp-arc-oauth-example

@http
get /
post /events
get /oauth-redirect

@events
post-message
oauth-access

@tables
data
  pk *String
  sk **String

# @aws
# profile default
# region us-west-1
