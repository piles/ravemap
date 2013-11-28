var id = 0;

var uid = function(){
  id += 1
  return id + ""
}

module.exports = uid;