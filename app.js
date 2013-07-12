var http           = require('http')
  , less           = require('less-middleware')
  // , mongo          = require('mongodb')
  , routes         = require('./routes')
  , express        = require('express');

var app = express();
http.createServer(app);

app.locals.env = app.get('env');
app.locals.scripts = (require('./express/app-scripts')(process.cwd())).getScriptSrc(app.get('env'));

// Perform canonicalization
app.use(function(req, res, next) {
  var host = req.headers.host;

  if (host === 'less2css.org') {
    next(); // Quick next for canonical
  } else if (host === 'www.less2css.org' || /(www\.)?(less2css\.com|preprocessors\.net)/i.test(host)) {
    res.redirect(301, 'http://less2css.org' + req.url);
  } else {
    next();
  }
});

// Begin config
app.configure('all', function() {
  app.set('port', '3000');
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.compress());
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(less({
      src: __dirname + '/public'
    , compress: true
  }));
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({
      showStack: true
    , dumpExceptions: true
  }));
});

app.configure('production', function() {
  app.use(express.errorHandler({ dumpExceptions: true }));
});

app.use(routes.fourOhfour);

// Begin Routes
app.get('/', routes.home);
app.get('/less-options', routes.lessOptions);

app.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/share/:id([A-Za-z0-9]{1,6})', routes.share);
app.post('/compile', routes.compile);

// Init
app.listen(app.get('port'), function(){
  console.log("Server started on port " + app.get('port') + ' in ' + app.get('env') + ' mode.');
});
