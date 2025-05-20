const REQUIRED_ORIGIN_PATTERN =
  /^((\*|([\w_-]{2,}))\.)*(([\w_-]{2,})\.)+(\w{2,})(\,((\*|([\w_-]{2,}))\.)*(([\w_-]{2,})\.)+(\w{2,}))*$/;

if (!process.env.ORIGINS.match(REQUIRED_ORIGIN_PATTERN)) {
  console.error("ENV", process.env.ORIGINS);
  console.log(
    "Pattern match:",
    process.env.ORIGINS.match(REQUIRED_ORIGIN_PATTERN)
  );
  console.log("https://gabrielcodeproject.github.io".match(pattern)); // should NOT be null
  console.log("https://gabrielcodeproject.github.io/".match(pattern)); // may be null
  console.log("https://gabrielcodeproject.github.io/pool".match(pattern)); //will be null
  throw new Error(
    "process.env.ORIGINS MUST be comma separated list \
    of origins that login can succeed on."
  );
}
const origins = process.env.ORIGINS.split(",");

module.exports = (oauthProvider, message, content) => `
<script>
(function() {
  function contains(arr, elem) {
    for (var i = 0; i < arr.length; i++) {
      if (arr[i].indexOf('*') >= 0) {
        const regex = new RegExp(arr[i].replaceAll('.', '\\\\.').replaceAll('*', '[\\\\w_-]+'))
        console.log(regex)
        if (elem.match(regex) !== null) {
          return true;
        }
      } else {
        if (arr[i] === elem) {
          return true;
        }
      }
    }
    return false;
  }
  function recieveMessage(e) {
    console.log("recieveMessage %o", e)
    if (!contains(${JSON.stringify(
      origins
    )}, e.origin.replace('https://', 'http://').replace('http://', ''))) {
      console.log('Invalid origin: %s', e.origin);
      return;
    }
    // send message to main window with da app
    window.opener.postMessage(
      'authorization:${oauthProvider}:${message}:${JSON.stringify(content)}',
      e.origin
    )
  }
  window.addEventListener("message", recieveMessage, false)
  // Start handshare with parent
  console.log("Sending message: %o", "${oauthProvider}")
  window.opener.postMessage("authorizing:${oauthProvider}", "*")
})()
</script>`;
