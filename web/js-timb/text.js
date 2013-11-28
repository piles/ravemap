var text = {};


// ported from http://www.cse.yorku.ca/~oz/hash.html
// probably a bad idea to % unicode char values into a byte?
text.hash_djb2 = function(txt){
  var chars = txt.split("")
  var hash = 5381;
  var c

  while (c = chars.pop())
    hash = ((hash << 5) + hash) + (c.charCodeAt(0) % 256); /* hash * 33 + c */

  return hash
}

module.exports = text;