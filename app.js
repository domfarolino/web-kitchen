const cmd = require("node-cmd");
const express = require('express');
const app = express();

// GitHub web hook for auto-deployment. Inspired by, but modified version of:
// https://support.glitch.com/t/tutorial-how-to-auto-update-your-project-with-github/8124/1.
app.post('/git', (req, res) => {
  // If event is "push"
  console.log(req.headers['x-github-event']);
  cmd.runSync('git reset --hard');
  cmd.runSync('refresh');
  console.log("> [GIT] Updated with origin/master");

  return res.sendStatus(200); // Send back OK status
});

app.get('*', (request, response, next) => {
  const final_headers = {
    'Access-Control-Allow-Origin': '*',
    'Supports-Loading-Mode': 'fenced-frame',
    'Cache-Control': 'no-store',
  };

  if (request.query.headers) {
    const query_headers = request.query.headers.split('|');
    for (header of query_headers) {
      if (header.split(':').length < 2) {
        response.status(400);
        response.send("Malformed, check log");
        console.log("Malformed, check log");
        console.log(header);
        return;
      }
      const [header_name, ...rest] = header.split(':');
      const header_value = rest.join(':');

      console.log('Header name: ', header_name);
      console.log('Header value: ', header_value);
      final_headers[header_name] = header_value;
    } // for
  } // if

  response.set(final_headers);
  next();
});

app.get('/redirect', (request, response, next) => {
  console.log('In the redirect handler');
  console.log(request.query.location);
  response.redirect(request.query.location);
});

app.get('/document-policy.html', (request, response, next) => {
  response.set({
    'Document-Policy': 'lossless-images-max-bpp=2.0'
  });

  next();
});

app.get('/coop.html', (request, response, next) => {
  response.set({
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  });
  next();
});

app.get('/random-redirect.html', (request, response, next) => {
  response.redirect('http:google.com');
});

let counter = 0;
app.get('/redirect-to-unparseable.html', (request, response, next) => {
  if (counter % 2 == 0)
    response.redirect('https://example.com:notaport');
  else
    response.send('Done!');
  counter++;
});

app.get('/print-headers.html', (request, response, next) => {
  console.log(request.headers);
  setTimeout(() => {
    response.status(200);
    response.send('console.log("I loaded")');
  }, 2000);
});

app.get('/slow.js', (request, response, next) => {
  setTimeout(() => {
    response.status(200);
    response.send('console.log("I loaded")');
  }, 2000);
});

app.get('/slow-xhr', (request, response, next) => {
  setTimeout(() => {
    response.status(200);
    response.send('slow-xhr complete');
  }, 1000);
});

app.get('/headers', (request, response, next) => {
  const query_headers = request.query.headers.split('|');
  const final_headers = {};
  for (header of query_headers) {
    if (header.split(':').length <= 2) {
      response.status(400);
      response.send("Malformed, check log");
      console.log(header_components);
      return;
    }
    const [header_name, ...rest] = header.split(':');
    const header_value = rest.join(':');

    console.log('Header name: ', header_name);
    console.log('Header value: ', header_value);
    final_headers[header_name] = header_value;
  }
  response.set(final_headers);
  response.send("All done!");
});

app.get('/img', (request, response, next) => {
  var img = new Buffer('iVBORw0KGgoAAAANSUhEUgAAAAUA AAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO 9TXL0Y4OHwAAAABJRU5ErkJggg==', 'base64');

  setTimeout(() => {
    response.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': img.length
    });
    response.end(img);
  }, 3000);
});

app.use('/', express.static('public'));

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
