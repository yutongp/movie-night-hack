
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.test = function(req, res){
  res.render('test', { title: 'Movie Night' });
};

exports.test2 = function(req, res){
  res.render('test2.html');
};
