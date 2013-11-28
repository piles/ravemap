var math = {};

math.lerp = function(a, b, w){
  return (1 - w) * a + w * b;
}

module.exports = math;