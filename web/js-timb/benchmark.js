// var b = Benchmark();
// b.start("something") // start a timer named "something"
// b.stop("something") // stop it
// b.something <-- time it took between start and stop calls in ms
// b.total <--- total ms of all benchmarks

var Benchmark = function(){
  var b = Object.create(Benchmark.proto);
  b.total = 0;
  return b;
};
Benchmark.proto = {};
Benchmark.proto.start = function(name){
  this[name+"_start_timestamp"] = Date.now();
};
Benchmark.proto.stop = function(name){
  if (!this[name+"_start_timestamp"]) return;
  var val = Date.now() - this[name+"_start_timestamp"];
  delete this[name+"_start_timestamp"];
  this[name] = val + (this[name] || 0);
  this.total += val;
};

//module.exports = Benchmark;

if (typeof module !== "undefined") module.exports = Benchmark;