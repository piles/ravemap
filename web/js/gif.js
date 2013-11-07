// gif.js by @timb :)
;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// @timb: edit of https://github.com/kig/bitview.js by Ilmari Heikkinen
var BitView = function(buf, offset) {
  this.buffer = buf;
  this.u8 = new Uint8Array(buf, offset);
};

BitView.prototype.getBit = function(idx) {
  var v = this.u8[idx >> 3];
  var off = idx & 0x7;
  return (v >> (7-off)) & 1;
};

module.exports = BitView;
},{}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
var tokenize = require('./string/tokenize');
var BitView = require('../deps/bitview/bitview.timb.js');

var BinarySpecReader = function(spec){
  var reader = Object.create(BinarySpecReader.proto);
  var parts = reader.parts = {};

  for (var partName in spec)
    parts[partName] = decodeSpecPart(spec[partName]);

  return reader;
};

BinarySpecReader.proto = {};

// decodes GIF parsing info from the specification
var decodeSpecPart = function(part){

  var bitSizes = {
    "bit": 1,
    "str": 8,
    "i8": 8,
    "u8": 8,
    "i16": 16,
    "u16": 16,
    "i32": 32,
    "u32": 32
  };

  var parsedSpec = {"fields": []};
  var size = 0;

  for (var i=0; i<part.length; i++){
    
    var instruction = tokenize(part[i]);
    var ignore = /(^|\s)ignore($|\s)/.test(part[i]);
    var typeInfo = instruction[0].split("["); // eg "uint(16)"
    var fieldType = typeInfo[0];
    var fieldLength = parseInt(typeInfo[1] || 1);
    var isArray = (typeInfo.length > 1);
                                                // char(2) is 16 bits. uint(16) is 16 bits
    var bitSize = bitSizes[fieldType] * fieldLength;

    parsedSpec.fields.push({"name": instruction[1],
                      "type": fieldType,
                      "ignore": ignore,
                      "bitSize": bitSize,
                      "isArray": isArray});
    size += bitSize;
  }
  
  parsedSpec.bitSize = size;
  parsedSpec.byteSize = size / 8;

  return parsedSpec;
};

// decodes a chunk according to data types in gif.spec.js
// todo: rewrite the binary decoding stuff to not be so shit
BinarySpecReader.proto.decodeBinaryFieldsToJSON = function(partName, cursor, buf){ var reader = this;

  var part = reader.parts[partName];

  var fields = {}, numFields = part.fields.length, bitPos = 0;

  for(var i = 0; i < numFields; i++){

    var field = part.fields[i];
    if (!field.ignore) {
      var bitOffset = bitPos % 8;
      var decodeByteStart = Math.floor((bitPos - bitOffset) / 8);
      var decodeByteEnd = decodeByteStart + Math.ceil(field.bitSize / 8);

      switch(field.type){
        case "u8":
          fields[field.name] = buf.u8[cursor + decodeByteStart]; break;
        case "i8":
          fields[field.name] = buf.dv.getInt8(cursor + decodeByteStart); break;
        case "u16":
          fields[field.name] = buf.dv.getUint16(cursor + decodeByteStart, true); break;
        case "i16":
          fields[field.name] = buf.dv.getInt16(cursor + decodeByteStart, true); break;
        case "u32":
          fields[field.name] = buf.dv.getUint32(cursor + decodeByteStart, true); break;
        case "i32":
          fields[field.name] = buf.dv.getInt32(cursor + decodeByteStart, true); break;
        case "str":
          fields[field.name] = abuf2str(buf.abuf, cursor + decodeByteStart, field.bitSize >> 3); break;
        case "bit":
          if (!field.isArray) {
            fields[field.name] = new BitView(buf.abuf, cursor + decodeByteStart).getBit(bitOffset);
          } else {
            var bv = new BitView(buf.abuf, cursor + decodeByteStart);
            var bits = [];
            for (var bb=bitOffset; bb<bitOffset+field.bitSize; bb++){
              bits.push(bv.getBit(bb))
            }
            fields[field.name] = bits;
          }
          break;
         // fields[field.name] = abuf2str(buf.abuf, cursor + decodeByteStart, field.bitSize / 8); break;
        default:
          console.log("please implement: " + field.type + ", " + partName);
      }
    }
    bitPos += field.bitSize;
  }
  //gif.cursor += part.byteSize;
  //GIF.decode.handleLoadedPart[gif.nextPart](gif, fields);
  // console.log(fields);
  return fields
}

// todo: wasteful of space?
var abuf2str = function(abuf, offset, len) {
  return String.fromCharCode.apply(null, new Uint8Array(abuf, offset, len));
}


module.exports = BinarySpecReader;
},{"../deps/bitview/bitview.timb.js":1,"./string/tokenize":19}],4:[function(require,module,exports){
var Benchmark = require('./benchmark');
var setproto = require('./object/setproto');
var extend = require('./object/extend');
var Tube = require('./tube');

// usage: Buffer(url || File || ArrayBuffer)
var BufferLoader = function(src, opts){

  var loader = Tube();
  setproto(loader, BufferLoader.proto);

  if (opts && opts.benchmark) loader.benchmark = opts.benchmark;

  //buf.remember("load error")
  // loader.on("load", function(abuf){ setupBuffer(loader, abuf) }); // <-- hm, needs ref to buf

  loader.src = src;

  return loader;
}

BufferLoader.proto = {};
extend(BufferLoader.proto, Tube.proto);

BufferLoader.proto.load = function(){ var loader = this;
  var src = loader.src;
  if (typeof src === "string") loader.loadFromUrl(src)
  else if (src instanceof File) loader.loadFromFile(src);
  else if (src instanceof ArrayBuffer) loader("load", src);
}

BufferLoader.proto.loadFromFile = function(file){ var loader = this;

  var r = new FileReader();
  
  r.addEventListener('load', function(e){
    if (loader.benchmark) loader.benchmark.stop("fetch-from-disk");
    loader('load', r.result, e);
    // console.log(r.file.name + " 100%: " + r.result.byteLength + " bytes")
  });

  r.addEventListener('error', function(e){
    // console.log(arguments);
    loader('error', e, r)
  });

  r.addEventListener('progress', function(e){ 
    //console.log(r.file.name + " " + (e.loaded / e.total * 100) + "%: " + e.loaded + " bytes") 
    loader('progress', e)
  });

  if (loader.benchmark) loader.benchmark.start("fetch-from-disk");
  r.readAsArrayBuffer(file);

};


BufferLoader.proto.loadFromUrl = function(url){ var loader=this;

  var xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  xhr.responseType = "arraybuffer";

  xhr.addEventListener('load', function(e){
    if (loader.benchmark) loader.benchmark.stop("fetch-from-network");
    // console.log(r.file.name + " 100%: " + r.result.byteLength + " bytes")
    loader('load', xhr.response, e);
  });

  xhr.addEventListener('error', function(e){
    // console.log(arguments);
    loader('error', e, xhr);
  });

  xhr.addEventListener('readystatechange', function(e){
    // console.log(xhr.readyState, xhr.status, xhr)
  })

  xhr.addEventListener('progress', function(e){ 
    //console.log(r.file.name + " " + (e.loaded / e.total * 100) + "%: " + e.loaded + " bytes") 
    loader('progress', e)
  });

  if (loader.benchmark) loader.benchmark.start("fetch-from-network");
  // xhr.open("GET", url); 
  
  xhr.send();

};

module.exports = BufferLoader;
},{"./benchmark":2,"./object/extend":16,"./object/setproto":17,"./tube":20}],5:[function(require,module,exports){
var rgba2css = function(rgba){
  //return "rgba(" + rgba.join(",") + ")"
  // arraybuffers have no join...
  return "rgba(" + rgba[0] + "," + rgba[1] + "," + rgba[2] + "," + rgba[3] + ")"
}
module.exports = rgba2css;
},{}],6:[function(require,module,exports){
var create2d = function(w, h){
  var canvas = document.createElement("canvas");
  canvas.width = w || 0;
  canvas.height = h || 0;
  return canvas.getContext("2d");
};

if (typeof module !== "undefined") module.exports = create2d;
},{}],7:[function(require,module,exports){
var createImageData = function createImageData(w, h){
  return createImageData.ctx.createImageData(w, h);
};
createImageData.ctx = document.createElement("canvas").getContext("2d");

if (typeof module !== "undefined") module.exports = createImageData;
},{}],8:[function(require,module,exports){
//make a function on a gif that determines which frame to show given a timestamp.
// this allows all gifs to be synced no matter when they are loaded
// however, this is undesirable if you want to start an animation on frame 0 when it is displayed.
var makeCurrentFrame = function(){
  var defaultDelay = 100; // msecs

  if (this.frames.length === 1){ // shortcut for static gifs
    this.currentFrame = function(){ return 0 };
  }

  var totalDelay = 0;
  var delays = [];
  for(var i=0; i<this.frames.length; i++){
    var frame = this.frames[i];
    var delay = ("delay" in frame && frame.delay > 0) ? frame.delay * 10 : defaultDelay;
    totalDelay += delay;
    delays.push(totalDelay);
  }

  this.currentFrame = makeCurrentFrameFunction(delays);
};

var makeCurrentFrameFunction = function(delays){ 
  var totalTime = delays[delays.length - 1];
  return function(timestamp){
    var r = (timestamp || Date.now()) % totalTime;
    for(var i=0; i<delays.length; i++)
      if (r < delays[i])
        return i;
    return i;
  }
};

exports.makeCurrentFrame = makeCurrentFrame;
},{}],9:[function(require,module,exports){
// looked at imagemagick implementation instead of trying to figure out my buggy one

/*
    decodes an lzw compressed gif frame 
    mostly based on imagemagick's implementation

    data, binary string
    data_size, lzw compression code size
    w, h, width and height of image
    paletteRemap is an optional array of different palette indexes to use

    returns typed array of palette index values

    this assumes we have the entire data for the frame buffered...  
    its possible to modify this so that a resumable state could be passed in, but prob not necessary
*/ 
// TODO: cache stacks?
var lzwImageData = function(blockinfo, u8buf, data_size, w, h, pixels, paletteRemap){
  var MaxStack = 4096;
  var NullCode = -1;
  var cursor = 0
  var npix = w * h;
  var code, in_code, old_code;
  var first = 0;
  var top = 0;
  var pi = 0
  var pixels = pixels || new Uint8Array(npix);
  var prefix = new Uint16Array(MaxStack*2) //Uint16Array(MaxStack*1.5) <-- this makes a nice glitch
  var suffix = new Uint8Array(MaxStack)
  // var prefix = lzwImageData.prefix;
  // var suffix = lzwImageData.suffix;
  var pixelStack = new Uint8Array(MaxStack+1)

  //  Initialize GIF data stream decoder.
  var clear = 1 << data_size;
  var end_of_information = clear + 1;
  var available = clear + 2;
  old_code = NullCode;
  var code_size = data_size + 1;
  var code_mask = (1 << code_size) - 1;
  for (code = 0; code < clear; code++){
    prefix[code] = 0;
    suffix[code] = code;
  }

  var bits = 0; var datum = 0;
  var dvcursor = blockinfo.start;
  var blockEnds = blockinfo.blockEnds;
  // var blockCounter = 0;
  var blockEnd = blockEnds.shift();
  // var blockEnd = blockEnds[blockCounter++];

  for (var i = 0; i < npix;){
    if (top === 0){

      if (bits < code_size){
        datum += u8buf[dvcursor] << bits;

        bits += 8;

        dvcursor++;
        if (dvcursor === blockEnd){
          dvcursor += 1;
          blockEnd = blockEnds.shift();
          // can't figure out why ^^ is faster than, eg
          // blockEnd = blockEnds[blockCounter++]
        }

        continue;

      }
      code = datum & code_mask;
      datum >>= code_size;
      bits -= code_size;

      if (code > available) {
        console.log(":(");
      //  console.log(num2bin(code));
      //  break;
      } // if we get here something bad happened ;(
      if (code === end_of_information) { console.log("fuck"); break};
      if (code === clear) {
        code_size = data_size + 1;
        code_mask = (1 << code_size) - 1;
        available = clear + 2;
        old_code = NullCode;
        continue;
      }
      if (old_code === NullCode){
        pixelStack[top++] = suffix[code];
        old_code = code;
        first = code;
        continue;
      }
      in_code = code;
      if (code === available){
        pixelStack[top++] = first;
        code = old_code;
      }
      while (code > clear){
        pixelStack[top++] = suffix[code];
        code = prefix[code];
      }
      first = (suffix[code]) // & 0xff;
                              // ^^ timb: not needed?
      //  Add a new string to the string table,
      if (available >= MaxStack) { /*console.log("maxstack!");*/ /*break;*/ }
      pixelStack[top++] = first;
      prefix[available] = old_code;
      suffix[available] = first;
      available++;
      /* why does == have higher precedence than & ?
         i just looked it up and i think it is because javascript
         has basically the same precedence as C and 
         "once upon a time, C didn't have the logical operators && and ||, 
         and the bitwise operators & and | did double duty."
      */
      if ((available & code_mask) === 0 && available < MaxStack){
        code_size++;
        code_mask += available;
      }
      old_code = in_code;
    }

    top--;
    if (paletteRemap)
      pixels[pi++] = paletteRemap[pixelStack[top]];
    else
      pixels[pi++] = pixelStack[top];
    i++;
  }

  // not needed: typed arrays init'd to 0 already
  // for (i = pi, len=pixels.length; i < len; i++) 
        // pixels[i] = 0; // clear missing pixels


  return pixels
};

var MaxStack = 4096;
// lzwImageData.prefix = new Uint16Array(MaxStack*2)
// lzwImageData.suffix = new Uint8Array(MaxStack)

module.exports = lzwImageData;
},{}],10:[function(require,module,exports){
var blockSigs = require('./spec').blockSigs;
var extSigs = require('./spec').extSigs;
var palette = require('./palette');
var makeCurrentFrame =  require('./animate').makeCurrentFrame;

var BinarySpecReader = require('../../binaryspec');
var spec = require('./spec').spec;
var specReader = BinarySpecReader(spec);

var decode = function(gif, opts){
  decodeNextPart(gif);
};


// this gets called when more binary data is ready to process
// it gets set as BufferedReader's onload function
/*
var moreDataInBufferEvent = function(gif){
  if (gif.waitingForFileBuffer) decodeNextPart(gif);
};
*/

/*
loads the next part of the gif, eventually calling the gif's onload function when every part has been loaded

this function gets called when a previous part has finished loading, 
and when there's more data in the buffered reader

if the next part has a fixed size according to spec, we know whether we have to wait on the buffer to fill or not
if the next part has a variable size, call the howToDecode function which will try to load it
*/
var decodeNextPart = function(gif, nextPart){
  //gif.waitingForFileBuffer = false;

  nextPart = nextPart || "header";
  var buf = gif.buf;

  while (nextPart !== "done" && nextPart !== "error"){

    if (nextPart in howToDecode && typeof howToDecode[nextPart] === "function") { // dont know size
      nextPart = howToDecode[nextPart](gif);
    } else { // we know exact size of next part

      var partSize = specReader.parts[nextPart].byteSize;

      if (buf.abuf.byteLength < partSize + buf.cursor){
        gif.waitingForFileBuffer = true;
        return;
      } else {
        var fields = specReader.decodeBinaryFieldsToJSON(nextPart, buf.cursor, buf);
        buf.cursor += specReader.parts[nextPart].byteSize;
        nextPart = handleLoadedPart[nextPart](gif, fields);
      }
    }
    // todo: maybe do this when and return unknown from dataBlock read
    // if (nextPart === "unknown") nextPart = "dataBlock"

  }

  if (nextPart === "done"){
    // create palette from all frames' palettes

    if (gif.benchmark) gif.benchmark.start("palette");
    gif.paletteTotal = palette.create(gif);
    if (gif.benchmark) gif.benchmark.stop("palette");

    // todo: move elsewhere
    makeCurrentFrame.bind(gif)();
//    GIF.decode.doneDecodingCleanup(gif);
    //gif.tube("progress", "done");
    gif.decoded = true;
    gif.tube("decoded");
    return;
  }
  
};


var howToDecode = {
  "globalPalette": function(gif){ var buf = gif.buf;
    var paletteSize = gif.paletteSize * 3; // r,g,b bytes

    if (buf.abuf.byteLength < buf.cursor + paletteSize) {
      gif.waitingForFileBuffer = true;
      return;
    }

    //gif.palette = GIF.palette.binary2rgba(gif.reader.buffer.slice(gif.cursor, gif.cursor + paletteSize));
    gif.palette = palette.binary2rgba(new Uint8Array(buf.abuf, buf.cursor, paletteSize));
    buf.cursor += paletteSize;

    return "dataBlock";
  },
  "localPalette": function(gif){ var buf = gif.buf;
    var paletteSize = gif.frames[gif.frames.length - 1].paletteSize * 3; // r,g,b bytes

    if (buf.abuf.byteLength < buf.cursor + paletteSize) {
      gif.waitingForFileBuffer = true;
      return;
    }

    gif.frames[gif.frames.length - 1].palette = palette.binary2rgba(new Uint8Array(buf.abuf, buf.cursor, paletteSize));
    buf.cursor += paletteSize;
    return "imageData";
  },
  "dataBlock": function(gif){ var buf = gif.buf;

    if (buf.abuf.byteLength < buf.cursor + 1) {
      gif.waitingForFileBuffer = true;
      return;
    }

    var blockType = "unknown",
        extType = "unknown",
        nextPart;

    var blockSig = buf.u8[buf.cursor];
    
    if (blockSig in blockSigs) {
      blockType = blockSigs[blockSig];
    } else {
      //console.log("unknown data block type ("+ Number(blockSig).toString(16) +")!");
      nextPart = "done";
    }

    if (blockType === "extension"){ // we need to determine what kind of extension the block is
      // need next two bytes to find out what kind of extension the data block is
      if (buf.abuf.byteLength < buf.cursor + 2) {
        gif.waitingForFileBuffer = true;
        return;
        console.log("ran out of buffer")
      }
      var extSig = buf.u8[buf.cursor+1];
      if (extSig in extSigs) {
        extType = extSigs[extSig];
        nextPart = extType;
      } else { 
        //console.log("unknown extension type ("+ Number(extSig).toString(16) +")")
        nextPart = "done";
      }
    } else {
      if (blockType === "unknown") { blockType = "dataBlock"; buf.cursor += 1 }
      nextPart = blockType;
    }

    return nextPart;

  },
  "trailer": function(gif){
    return "done";
  }
};

var handleLoadedPart = {
  "header": function(gif, fields){

    if (fields.signature != "GIF"){
      gif.tube("error", "file doesn't seem to be a gif (file signature: '"+fields.signature+"')");
      return "error";
    }

    // gif.version = fields.version
      
    return "screenDesc";
  },
  "screenDesc": function(gif, fields){
    for (var field in fields) gif[field] = fields[field];
    // todo: make nicer
    // this should be a u3 not this bit[3] bit-shifted horseshit 
    gif.paletteSize = (gif.paletteSize[0] << 2) + (gif.paletteSize[1] << 1) + (gif.paletteSize[2]);
    gif.paletteSize = Math.pow(2, gif.paletteSize + 1)

    if (gif.paletteExists) return "globalPalette";
    else return "dataBlock";
  },
  "imageDesc": function(gif, fields){
    // make a blank image frame if none exists or the last frame already has image data
    // we don't know if a blank frame has already been created because a graphic control block might
    // have come before this block and made one
    if (!gif.frames.length || ("w" in gif.frames[gif.frames.length - 1]))
      gif.frames.push({})
    
    var frame = gif.frames[gif.frames.length - 1]

    for (var field in fields) frame[field] = fields[field];
    frame.paletteSize = (frame.paletteSize[0] << 2) + (frame.paletteSize[1] << 1) + (frame.paletteSize[2]);
    frame.paletteSize = Math.pow(2, frame.paletteSize + 1)

    if (frame.paletteExists) return "localPalette";
    else return "imageData";
  },
    // if sublocks was able to read:
    //   increase cursor from subblocks
    //   increase cursor from fields
    // else
    //   set waiting
    //   subtract 2 from cursor (for the 2 that was read to get the data block)
    //   subtract part.bytesize from cursor (not needed in this case?)
  "applicationExtension": function(gif, fields){
    var blockinfo = readSubBlocks(gif);
    if (blockinfo === false) {
      gif.waitingForFileBuffer = true
      gif.buf.cursor -= specReader.parts.applicationExtension.byteSize
      return;
    } else {
      var extension = {"data": blockinfo};
      for(var field in fields)
        extension[field] = fields[field]
      gif.extensions.push(extension)
      return "dataBlock";
    }
  },
  "comment": function(gif, fields){
    var blockinfo = readSubBlocks(gif);
    if (blockinfo === false) {
      gif.waitingForFileBuffer = true;
      gif.buf.cursor -= specReader.parts.comment.byteSize;
      return;
    } else {
      var extension = {"comment": blockinfo};
      for(var field in fields)
        extension[field] = fields[field];
      gif.extensions.push(extension);
      return "dataBlock";
    }
  },
  "plainText": function(gif, fields){
    var blockinfo = readSubBlocks(gif);
    if (blockinfo === false) {
      gif.waitingForFileBuffer = true;
      gif.buf.cursor -= specReader.parts.plainText.byteSize;
      return;
    } else {
      var extension = {"plainText": blockinfo};
      for(var field in fields)
        extension[field] = fields[field];
      gif.extensions.push(extension);
      return "dataBlock";
    }
  },
  "graphicControl": function(gif, fields){
    var dm = (fields.disposalMethod[0] << 2) + (fields.disposalMethod[1] << 1) + (fields.disposalMethod[2]);
    gif.frames.push({"delay": fields.delay,
                     "transparentIndex": fields.transparentColor ? fields.transparentIndex : -1,
                     "disposalMethod": dm})
    return "dataBlock";
  },
  "imageData": function(gif, fields){
    var blockinfo = readSubBlocks(gif);
    if (blockinfo === false) {
      gif.waitingForFileBuffer = true
      gif.buf.cursor -= specReader.parts.imageData.byteSize
      console.log("fucked")
      return;
    } else {

// TODO: ENABLE THIS!
//      gif.tube("progress", "found " + gif.frames.length + " frames");

      var frame = gif.frames[gif.frames.length - 1];
      //var palette = ("palette" in frame) ? frame.palette : gif.palette // local palette otherwise global palette
      frame.lzwCodeSize = fields.lzwCodeSize;
      frame.blockinfo = blockinfo;
//      var transparentIndex = ("transparentIndex" in frame) ? frame.transparentIndex : -1
      return "dataBlock";
    }    

  }
};

// read subblocks out of a gif's buffer...
// reads block sizes and returns an object with a start cursor and an array of block ends
// returns false if there's not enough data 
var readSubBlocks = function(gif){

  if (gif.benchmark) gif.benchmark.start("read-subblocks");

  var blockEnds = [];

  var buf = gif.buf,
      u8 = buf.u8,
      byteLength = u8.byteLength;
  
  // gif.cursor is for whole file... pos is a cursor for just this blob
  var startBlockCursor = buf.cursor;
  var pos = buf.cursor;
  startBlockCursor += 1;
  var byteSize = 0;
  var outOfData = false

  // only actually advance cursor if we can read in all the sub blocks from the buffer
  var cursorTemp = 0;

  while(!outOfData){
    // get block size
    if (byteLength < pos + 1) { outOfData = true; break;}
    byteSize = u8[pos];
    pos += 1;

    // a sub block with size 0 indicates end of sub blocks
    if (byteSize === 0) { cursorTemp += 1; break;}
    
    // read block
    if (byteLength < pos + byteSize) { outOfData = true; break;}
    blockEnds.push(pos + byteSize);
    
    pos += byteSize
    cursorTemp += byteSize + 1
    // gif.subBlocksRead += 1
  }

  // TODO? CLEAN UP!
  if (outOfData) { 
    // gif.bufferMisses += 1
    // gif.benchmark.wasted += (Date.now() - start) / 1000
    console.log("out of data")
    return false

  } else { // end of sub blocks happened
    buf.cursor += cursorTemp
    //if ("onprogress" in gif) gif.onprogress(gif, Math.floor(gif.cursor / gif.file.size * 100))
//    gif.benchmark.subblocks += (Date.now() - start) / 1000;
    if (gif.benchmark) gif.benchmark.stop("read-subblocks");
    return {start: startBlockCursor, blockEnds: blockEnds};

  }
};

module.exports = decode;
},{"../../binaryspec":3,"./animate":8,"./palette":12,"./spec":14}],11:[function(require,module,exports){
var Benchmark = require('../../benchmark');
var Tube = require('../../tube');
var BufferLoader = require('../../bufferloader');

var decode = require('./decode');
var render = require('./render-canvas');

var GIF = function(src, opts){

  var gif = Object.create(GIF.proto);

  gif.buf = {}; // buffers used to store binary data
  gif.tube = Tube();
  gif.benchmark = Benchmark();

  if (src instanceof File){
    gif.src = src;
  }
  else if (typeof src === 'string'){ // url
    gif.src = src;
  }
  
  return gif;

};


/*
states:
empty
buffering: fetching a resource (File, url) into an ArrayBuffer
decoding: decode binary data into different data chunks
rendering: render data into frames as canvas contexts, or into a texture for webgl, etc
*/

GIF.proto = {};

GIF.setupBuffers = function(gif, abuf){
  gif.buf.cursor = 0;
  gif.buf.abuf = abuf;
  gif.buf.u8 = new Uint8Array(abuf);
  gif.buf.dv = new DataView(abuf);
};

GIF.proto.on = function(){ var gif = this;
  gif.tube.on.apply(gif.tube, arguments)
};
GIF.proto.off = function(){ var gif = this;
  gif.tube.off.apply(gif.tube, arguments)
};

GIF.proto.load = function(){ var gif = this;
  // if (!gif.src) throw new Error('gif needs a src');

  gif.loader = BufferLoader(gif.src, {benchmark: gif.benchmark});
  gif.loader.on("load", function(abuf){ 
    GIF.setupBuffers(gif, abuf)
    gif.loaded = true;
    gif.tube("loaded")
  });
  gif.loader.on("error", function(e, xhr){ gif.tube("error", e, xhr)} );
  gif.loader.load();

};

GIF.proto.decode = function(){ var gif = this;

  if (!gif.loaded) {
    gif.on("loaded", gif.decode.bind(gif)) // ugh
    gif.load();
    return gif
  }

  // TODO: deal with
  gif.extensions = [];
  gif.frames = [];
  //gif.cursor = 0;

  decode(gif);
  
};

GIF.proto.render = function(){ var gif = this;
  if (!gif.decoded){
    gif.on("decoded", gif.render.bind(gif)) // ugh
    gif.decode();
    return gif
  }

  render(gif);

};


//if (typeof module !== "undefined") module.exports = GIF;
if (typeof window !== "undefined") window.GIF = GIF;
},{"../../benchmark":2,"../../bufferloader":4,"../../tube":20,"./decode":10,"./render-canvas":13}],12:[function(require,module,exports){
var rgba2css = require('../../color/rgba2css');
var create2d = require('../../create/2d');
var createImageData = require('../../create/imagedata');

var palette = {};

// flat typed array of r g b a values from binary GIF palette
palette.binary2rgba = function(abuf /*, transparentIndex */){
  var table = new Uint8Array(abuf.byteLength/3*4);
  var counter = 0
  for(var i = 0, length = abuf.byteLength/3*4; i<length; i+=4){
    table[i] = abuf[counter];
    table[i+1] = abuf[counter+1];
    table[i+2] = abuf[counter+2];
    table[i+3] = 255;
    counter += 3;
  }
/*
  if (transparentIndex !== undefined)
    table[transparentIndex*4 + 3] = 0;
*/
  return table;
};


// TODO. break this up, make less confusing, etc.
// horrible monolithic palette mappings constructor
// builds a hash lookup to map rgba value to palette index
// builds an array to map indexes to rgba values
// builds an array to map indexes to css values
// builds an imagedata to map indexes to colors
//
// gif palette index numbers are not preserved... 
// this makes a palette from all local palettes (frames) plus global palette
// only ONE transparent value is included... 0,0,0,0, others are ignored
palette.create = function(gif){

  // boot up palette with a transparent color to start with
  var rgba2Index = {"0":0},
      index2Css = ["rgba(0,0,0,0)"],
      index2Rgba = [[0,0,0,0]];

  var addPalette = function(palette){
    for(var i=0, size=palette.length; i<size; i+=4){
      var a = palette[i+3]
      if (a === 0) continue; // skip transparent values... just use first palette index for them
      var r = palette[i],
          g = palette[i+1],
          b = palette[i+2],
          index = (r | (g << 8) | (b << 16) | (a << 24)).toString();
          // http://jsperf.com/rgba-hash-lookup
          // also... this overflows and flips sign... is that safe over diff. js implementations?
          if (index in rgba2Index) continue;
          rgba2Index[index] = index2Rgba.length
          var rgba = [r,g,b,a]
          index2Rgba.push(rgba)
          index2Css.push(rgba2css(rgba))
    }
  };

  if ("palette" in gif)
    addPalette(gif.palette)

  for(var f=0; f<gif.frames.length; f++){
    var frame = gif.frames[f];
    if (!("palette" in frame)) continue;
    addPalette(frame.palette)
  }

  // create this last, as we don't know palette size until it is built
  var imagedata = createImageData(index2Rgba.length, 1)
  for(var i=0, size=index2Rgba.length*4, data=imagedata.data; i<size; i+=4){
    var rgba = index2Rgba[i/4]
    data[i] = rgba[0]
    data[i+1] = rgba[1]
    data[i+2] = rgba[2]
    data[i+3] = rgba[3]
  }

  return {"rgba2Index": rgba2Index,
          "index2Rgba": index2Rgba,
          "index2Css": index2Css,
          "imagedata": imagedata,
          "length": index2Rgba.length}
};

module.exports = palette;
},{"../../color/rgba2css":5,"../../create/2d":6,"../../create/imagedata":7}],13:[function(require,module,exports){
var create2d = require('../../create/2d');
var createImageData = require('../../create/imagedata');
//import queueOrNextTick from 'lib/nexttick4';
var nextTick = require('../../nexttick');
// var make_fast_pixeldata_fn = require('./test-asm');


var lzw = require('./decode-lzw');
// var lzw = require('./decode-lzw-asm');

/*
  this has two rendering types... canvas and webgl
  both build gif image frames from binary data that was decoded when the gif loaded

  canvas method will build full-frame canvas objects and place them into each frame of the gif.
  eg, render.canvas(gif) will create gif.frames[0].ctx and so on

  webgl method builds imagedata textures and tries to pack multiple frames efficiently into channels if it can.

  in gifs, each frame stored might just be a rectangle that changed from the previous frame.
  these are referred to as "raw frames" in this code
*/

var render = function(gif, config){

  config = config || {};

  var bench = gif.benchmark || false;

  var frameNum = config.frameNum || 0;

  if (frameNum === 0){ // preallocate all frames
    for (var i=0; i<gif.frames.length; i++){
      gif.frames[i].ctx = create2d(gif.w, gif.h);
      gif.buf.pixeldata = new Uint8Array(gif.w * gif.h);
    }
  }

  if (frameNum >= gif.frames.length) { // done making frames
    //gif.tube("progress", "done")
    gif.rendered = true;
    gif.tube("rendered");
    return
  }

  var frame = gif.frames[frameNum];
  var pixeldata = gif.buf.pixeldata;

  // gif.percentLoaded = frameNum / gif.frames.length
  //gif.tube("decompressing frame " + (frameNum+1))



  // lzw
  if (bench) bench.start("decompress-lzw");
  // var pixeldata = new Uint8Array(frame.w * frame.h);
  //pixeldata.area = frame.w * frame.h;
  lzw(frame.blockinfo, gif.buf.u8, frame.lzwCodeSize, frame.w, frame.h, pixeldata);
  if (bench) bench.stop("decompress-lzw");

  // deinterlace
  if (frame.interlaced) {
    if (bench) bench.start("deinterlace");
    pixeldata = deinterlacePixels(pixeldata, frame.w, frame.h)
    if (bench) bench.stop("deinterlace");
  }

  // canvas-ize
  if (bench) bench.start("pixeldata-to-canvas");
  makeFullFrame(pixeldata, gif, frameNum);
  if (bench) bench.stop("pixeldata-to-canvas");

  // todo: queue this better
  var func = render.bind(undefined, gif, {"frameNum": frameNum+1});
  // queueOrNextTick(func);
  nextTick(func);
  // setZeroTimeout(func);
  //setTimeout(func, 1) // otherwise progress won't show in chrome

};

var makeFullFrame = function(pixeldata, gif, frameNum){

  var frame = gif.frames[frameNum],
      ctx = frame.ctx;

  if (frameNum === 0){ // don't need previous frame info to do disposal if it's the first frame
    ctx.putImageData(pixelDataToImageData(pixeldata, gif, frame), frame.x, frame.y,
                        0,0,frame.w,frame.h);
    return;
  }

  var prevFrameNum = frameNum-1,
      prevFrame = gif.frames[prevFrameNum],
      prevCanvas = prevFrame.ctx.canvas,
      rawCtx;

  // disposal method is 0 (unspecified) or 1 (do not dispose)
  // do nothing, paste new frame image over old one
  if (prevFrame.disposalMethod === 0 || prevFrame.disposalMethod === 1 || prevFrame.disposalMethod === undefined || prevFrame.disposalMethod > 3){
    rawCtx = makeRawFrameAsContext(gif, frameNum, pixeldata);
    ctx.drawImage(prevCanvas, 0, 0)
    ctx.drawImage(rawCtx.canvas, 0,0,frame.w,frame.h,   frame.x,frame.y,frame.w,frame.h)
  }

  // disposal method is 2 (restore to background color)
  // but everyone just restores to transparency
  // see notes on http://www.imagemagick.org/Usage/anim_basics/#background
  if (prevFrame.disposalMethod === 2){
    // fast path... whole frame cleared
    if (prevFrame.x === 0 && prevFrame.y === 0 && prevFrame.w === gif.w && prevFrame.h === gif.h) {
      // var rawContext = makeRawFrameAsContext(gif, frameNum)
      // frame.context.drawImage(rawContext.canvas, frame.x, frame.y);
      ctx.putImageData(makeRawFrameAsImageData(gif, frameNum, pixeldata), frame.x, frame.y,
                            0,0,frame.w,frame.h);
    } else { // draw the edges of the previous frame and then draw the current frame overtop
      /*
      .__________.
      |__________|
      | |      | |
      | |      | |
      |_|______|_|
      |__________|
      */
      //top
      if (prevFrame.y > 0)
        ctx.drawImage(prevCanvas, 0,0, gif.w,prevFrame.y,   
                                    0,0, gif.w,prevFrame.y);
      //left
      if (prevFrame.x > 0)
        ctx.drawImage(prevCanvas, 0,prevFrame.y, prevFrame.x,prevFrame.h, 
                                    0,prevFrame.y, prevFrame.x,prevFrame.h);
      // right
      if (prevFrame.x+prevFrame.w < gif.w)
        ctx.drawImage(prevCanvas, prevFrame.x+prevFrame.w, prevFrame.y,   (gif.w-prevFrame.x-prevFrame.w),prevFrame.h,
                                    prevFrame.x+prevFrame.w, prevFrame.y,   (gif.w-prevFrame.x-prevFrame.w),prevFrame.h);
      // bottom
      if (prevFrame.y+prevFrame.h < gif.h)
        ctx.drawImage(prevCanvas, 0,prevFrame.y+prevFrame.h,  gif.w,(gif.h-prevFrame.y-prevFrame.h),
                                    0,prevFrame.y+prevFrame.h,  gif.w,(gif.h-prevFrame.y-prevFrame.h))

      rawCtx = makeRawFrameAsContext(gif, frameNum, pixeldata);
      ctx.drawImage(rawCtx.canvas, 0,0,frame.w,frame.h,   frame.x,frame.y,frame.w,frame.h);

    }
  }

  // disposal method is 3 (restore to previous)
  if (prevFrame.disposalMethod === 3){
    // look for last previous frame that doesn't have "previous" disposal method
    while(prevFrameNum > 0 && gif.frames[prevFrameNum].disposalMethod === 3) prevFrameNum -= 1;
    prevFrame = gif.frames[prevFrameNum]
    // console.log(prevFrameNum)
    if (prevFrame.disposalMethod != 3) ctx.drawImage(prevFrame.ctx.canvas, 0, 0)
    rawCtx = makeRawFrameAsContext(gif, frameNum, pixeldata);
    ctx.drawImage(rawCtx.canvas, 0,0,frame.w,frame.h,   frame.x, frame.y,frame.w,frame.h)
  }

}

var makeRawFrameAsContext = function(gif, frameNum, pixeldata){
  // cache a context to reuse
  if (makeRawFrameAsContext.ctx && 
      makeRawFrameAsContext.ctx.canvas.width === gif.w &&
      makeRawFrameAsContext.ctx.canvas.height === gif.h) {
    var ctx = makeRawFrameAsContext.ctx;
  } else {
    var ctx = makeRawFrameAsContext.ctx = create2d(gif.w, gif.h);
  }

  var frame = gif.frames[frameNum];
  pixeldata = pixeldata || frame.pixelData;

  // TODO: gotta copy palette because i mutate the transparent index here :(
  // it happens in two other functions below also
  if ("palette" in frame)
    var palette = frame.palette;
  else if ("palette_copy" in frame)
    var palette = frame.palette_copy;
  else
    var palette = frame.palette_copy = new Uint8Array(gif.palette.buffer.slice(0));

  var transparentIndex = ("transparentIndex" in frame) ? frame.transparentIndex : -1;
  if (transparentIndex > -1) palette[(transparentIndex*4)+3] = 0;

  var rawImageData = pixelData2imageData_fast(gif, palette, pixeldata, frame.w, frame.h, transparentIndex);

  ctx.putImageData(rawImageData, 0, 0, 0,0,frame.w,frame.h)

  return ctx

  // return imageData2contextDirty(rawImageData, 0,0,frame.w,frame.h);
};

var makeRawFrameAsImageData = function(gif, frameNum, pixeldata){
  var frame = gif.frames[frameNum];
  pixeldata = pixeldata || frame.pixelData;

  if ("palette" in frame)
    var palette = frame.palette;
  else if ("palette_copy" in frame)
    var palette = frame.palette_copy;
  else
    var palette = frame.palette_copy = new Uint8Array(gif.palette.buffer.slice(0));

  var transparentIndex = ("transparentIndex" in frame) ? frame.transparentIndex : -1;

  if (transparentIndex > -1) palette[(transparentIndex*4)+3] = 0;

  return pixelData2imageData_fast(gif, palette, pixeldata, frame.w, frame.h, transparentIndex)
};

var pixelDataToImageData = function(pixeldata, gif, frame){
  // var frame = gif.frames[frameNum];
  
  if ("palette" in frame)
    var palette = frame.palette;
  else if ("palette_copy" in frame)
    var palette = frame.palette_copy;
  else
    var palette = frame.palette_copy = new Uint8Array(gif.palette.buffer.slice(0));

  var transparentIndex = ("transparentIndex" in frame) ? frame.transparentIndex : -1;

  if (transparentIndex > -1) palette[(transparentIndex*4)+3] = 0;

  return pixelData2imageData_fast(gif, palette, pixeldata, frame.w, frame.h, transparentIndex)
};


var pixelData2imageData = function(gif, palette, pixeldata, w, h, transparentIndex){
  if (pixelData2imageData.imagedata && 
      pixelData2imageData.imagedata.width === gif.w &&
      pixelData2imageData.imagedata.height === gif.h) {
    var imagedata = pixelData2imageData.imagedata;
    var u32 = pixelData2imageData.u32;
  } else {
    var imagedata = pixelData2imageData.imagedata = createImageData(gif.w, gif.h);
    var u32 = pixelData2imageData.u32 = new Uint32Array(imagedata.data.buffer);
  }

  var palette_u32 = new Uint32Array(palette.buffer);

  var gifw = gif.w;
  var i = 0;

  for (var y=0; y<h; y++){ 
    var yinc = y*gifw;
    for (var x=0; x<w; x++){
      u32[x + yinc] = palette_u32[pixeldata[i++]];
    }
  }

  return imagedata;
};











// var asm_module_pixelData2imageData = asm_module_definition_pixelData2imageData(window);

var pixelData2imageData_fast = function(gif, palette, pixeldata, w, h, transparentIndex){
  if (pixelData2imageData_fast.imagedata && 
      pixelData2imageData_fast.imagedata.width === gif.w &&
      pixelData2imageData_fast.imagedata.height === gif.h) {
    var imagedata = pixelData2imageData_fast.imagedata;
    var u32 = pixelData2imageData_fast.u32;
  } else {
    var imagedata = pixelData2imageData_fast.imagedata = createImageData(gif.w, gif.h);
    var u32 = pixelData2imageData_fast.u32 = new Uint32Array(imagedata.data.buffer);
  }

  var palette_u32 = new Uint32Array(palette.buffer);

  var gifw = gif.w;
  var i = 0;

  // var fast = make_fast_pixeldata_fn();
  // console.log(fast);

  for (var y=0; y<h; y++){ 
    var yinc = y*gifw;
    for (var x=0; x<w; x++){
      u32[x + yinc] = palette_u32[pixeldata[i++]];
    }
  }

  return imagedata;
};



// deinterlace the 4 chunks from one imageData blob in one pass
// see appendix e of gif spec
//
// ideas: canvasize first, then deinterlace... 
// and do canvas drawImage calls or putImageData calls to move the rows around?
var deinterlacePixels = function(oldpixels, w, h){

  var pixels = new Uint8Array(oldpixels.length)
  var stripes2 = Math.ceil(h/8) // the row where the 2nd interlaced chunk starts
  var stripes3 = Math.ceil(h/4)
  var stripes4 = Math.ceil(h/2)

  // pixels[(w*y) +x] = oldpixels[(w*y) +x] <- base calculation

  for(var y=0; y<h; y++){
    var interlacedRowOffset
    var rowOffset = w * y
    if (y % 8 === 0)
      interlacedRowOffset = w* (y/8)
    else if ((y + 4) % 8 === 0)
      interlacedRowOffset = w* ((y-4)/8+stripes2)
    else if (y % 2 === 0)
      interlacedRowOffset = w* ((y-2)/4+stripes3)
    else
      interlacedRowOffset = w* ((y-1)/2+stripes4)
    for(var x=0; x<w; x++)
      pixels[rowOffset+x] = oldpixels[interlacedRowOffset+x]
  }

  return pixels;
};

module.exports = render;
},{"../../create/2d":6,"../../create/imagedata":7,"../../nexttick":15,"./decode-lzw":9}],14:[function(require,module,exports){
var blockSigs = {
 0x21: "extension",
 0x2c: "imageDesc",
 0x3b: "trailer"
};

exports.blockSigs = blockSigs;

var extSigs = {
 0xf9: "graphicControl",
 0xfe: "comment",
 0x01: "plainText",
 0xff: "applicationExtension"
};

exports.extSigs = extSigs;

/*
GIF.getGeneralBlockType = function(sig){
  if (sig == 0x3b)
    return "trailer"
  else if (sig < 0x7F)
    return "graphic rendering block"
  else if (sig < 0xF9)
    return "control block"
  else return "special purpose block"
}

*/

var spec = {
  "header": [
    "str[3] signature",
    "str[3] version"
  ],
  "screenDesc": [
    "u16    w",
    "u16    h",
    "bit    paletteExists",
    "bit[3] resolution ignore",
    "bit    sortFlag ignore",
    "bit[3] paletteSize",
    "u8     bgColorIndex",
    "u8     aspectRatio ignore"
  ],
  "imageDesc": [
    "u8     sig ignore",
    "u16    x",
    "u16    y",
    "u16    w",
    "u16    h",
    "bit    paletteExists",
    "bit    interlaced",
    "bit    sortFlag",
    "bit[2] reserved ignore",
    "bit[3] paletteSize"   
  ],
  "applicationExtension": [
    "u8     sig ignore",
    "u8     extSig ignore",
    "u8     blockSize ignore",
    "str[8] identifier",
    "str[3] authCode ignore"
  ],
  "graphicControl": [
    "u8     sig ignore",
    "u8     extSig ignore",
    "u8     blockSize ignore",
    "bit[3] reserved ignore",
    "bit[3] disposalMethod",
    "bit    userInput ignore",
    "bit    transparentColor",
    "u16    delay",
    "u8     transparentIndex",
    "u8     blockTerminator ignore"
  ],
  "comment": [
    "u8     sig ignore",
    "u8     extSig ignore"
  ],
  "plainText": [
    "u8    sig ignore",
    "u8    extSig ignore",
    "u8    blockSize",
    "u16   textGridLeft",
    "u16   textGridTop",
    "u16   textGridWidth",
    "u16   textGridHeight",
    "u8    charCellWidth",
    "u8    charCellHeight",
    "u8    fgColorIndex",
    "u8    bgColorIndex"
  ],
  "imageData": [
    "u8     lzwCodeSize"
  ]
};

exports.spec = spec;
},{}],15:[function(require,module,exports){
// based on https://github.com/timoxley/next-tick/blob/master/index.js

// postMessage behaves badly on IE8
if (window.ActiveXObject || !window.postMessage) {

  var nextTick = function(fn) {
    setTimeout(fn, 0);
  }

} else {

  // based on setZeroTimeout by David Baron
  // - http://dbaron.org/log/20100309-faster-timeouts
  var timeouts = []
    , name = 'next-tick-zero-timeout'

  window.addEventListener('message', function(e){
    if (e.source == window && e.data == name) {
      if (e.stopPropagation) e.stopPropagation();
      if (timeouts.length) timeouts.shift()();
    }
  }, true);

  var nextTick = function(fn){
    timeouts.push(fn);
    window.postMessage(name, '*');
  }

}

module.exports = nextTick;
},{}],16:[function(require,module,exports){
module.exports = function(destination, source) {
  for (var property in source)
    destination[property] = source[property];
  return destination;
};
},{}],17:[function(require,module,exports){
// TODO: replace all uses of
// setproto(foo, proto)
// with
// foo.__proto__ = proto
// when IE is no longer shit

var setproto = function(obj, proto){
  if (obj.__proto__)
    obj.__proto__ = proto;
  else
    for (var key in proto)
      obj[key] = proto[key];
};
module.exports = setproto;
},{}],18:[function(require,module,exports){
// return true if string matches pattern
// todo: move caching into this method to avoid having to pass arrays to it

// can use * to match 0 or more : separated msgs
// globber("*".split(":"), "a:b:c".split(":")) => true
// globber("*:c".split(":"), "a:b:c".split(":")) => true
// globber("a:*".split(":"), "a:b:c".split(":")) => true
// globber("a:*:c".split(":"), "a:b:c".split(":")) => true

// based on codegolf.stackexchange.com/questions/467/implement-glob-matcher
var globber = function(patterns, strings) {
  // console.log("globber called with: " + patterns.join(":"), strings.join(":"))
  var first = patterns[0],
      rest = patterns.slice(1),
      len = strings.length,
      matchFound;

  if(first === '*') { 
    for(var i = 0; i <= len; ++i) {
      // console.log("* " + i + " trying " + rest.join(":") + " with " + strings.slice(i).join(":"))
      if(globber(rest, strings.slice(i))) return true;
    }
    return false;
  } else { 
    matchFound = (first === strings[0]);
    // console.log ("literal matching " + first + " " + strings[0] + " " + !!matched)
  }

  return matchFound && ((!rest.length && !len) || globber(rest, strings.slice(1)));
};
module.exports = globber;
},{}],19:[function(require,module,exports){
// trim a string and split it into array of strings
var tokenize = function(str, splitOn){
  return str
           .trim()
           .split(splitOn || tokenize.default);
};
tokenize.default = /\s+/g;

module.exports = tokenize;
},{}],20:[function(require,module,exports){
// tube.js: a channel-like object to pipe objects and messages into
/*

t = Tube()
t.on("foo", fn)
t("foo", "bar", [])

will call fn("bar", [], "foo")

*/

var setproto = require('./object/setproto');
var tokenize = require('./string/tokenize');
var globber = require('./string/globber');
var Uid = require('./uid');
var nextTick = require('./nexttick');

  // import queueOrNextTick from 'lib/nexttick4';

var globcache = {};

var Tube = function(opts){

  opts = opts || {};

  if (opts.queue){
    var c = function(){
      var args = arguments;
      // queueOrNextTick (function(){ c.send.apply(c, args) });
      nextTick (function(){ c.send.apply(c, args) });
      return c;
    };
  } else {
    var c = function(){
      c.send.apply(c, arguments);
      return c;
    };
  }

  setproto(c, Tube.proto);
  
  c.listeners = {};
  c.globListeners = {};

  return c;
};

Tube.total = {};

Tube.proto = {};
setproto(Tube.proto, Function.prototype);


/*
adds fns as listeners to a channel

on("msg", fn, {opts})
on("msg", [fn, fn2], {opts})
on("msg msg2 msg3", fn, {opts})
on({"msg": fn, "msg2": fn2}, {opts})
*/
Tube.proto.on = function(){ var chan = this;

  if (typeof arguments[0] === "string") { 
  //if (arguments.length > 1) {           // on("msg", f)
    var msgMap = {};
    msgMap[arguments[0]] = arguments[1];
    var opts = arguments[2] || {};
  } else {                              // on({"msg": f, ...})
    var msgMap = arguments[0];
    var opts = arguments[1] || {};
  }

  for (var string in msgMap){
    
    var msgs = string.split(" ");

    var fs = msgMap[string];
    if (!Array.isArray(fs)) fs = [fs];

    for(var i=0, f; f=fs[i]; i++){
      if (!f.uid) f.uid = Uid();
    }

    for(var i=0, msg; msg=msgs[i]; i++){

      var listeners = (msg.indexOf("*") === -1) ?
                        chan.listeners :
                        chan.globListeners;

      // todo: this probably wastes a lot of memory?
      // make a copy of the listener, add to it, and replace the listener
      // why not just push directly?
      // send might be iterating over it... and that will fuck up the iteration
      listeners[msg] = (msg in listeners) ?
                         listeners[msg].concat(fs) :
                         fs.concat();
    }
  }

  return chan;

};



/*
remove matched message listeners from a channel
off()
off("a:b:c")
off(f)
off("a:b:c", f)
off("a:b:c d:e:f")
off([f, f2])
off({"a": f, "b": f2})
*/
Tube.proto.off = function(){ var chan = this;

  var listeners, i, msgs, msg;

  // off() : delete all listeners. but replace, instead of delete
  if (arguments.length === 0) { 
    chan.listeners = {};
    chan.globListeners = {};
    return chan;
  }

  // off("a:b:c d:e:f")
  // remove all matching listeners
  if (arguments.length === 1 && typeof arguments[0] === "string"){
    // question... will this fuck up send if we delete in the middle of it dispatching?
    msgs = arguments[0].split(" ");

    for (i=0; msg=msgs[i]; i++){
      delete chan.listeners[msg];
      delete chan.globListeners[msg];
    }
    return chan;
  }

  // off(f) or off([f, f2])
  // remove all matching functions
  if (typeof arguments[0] === "function" || Array.isArray(arguments[0])) {
    var fs = (typeof arguments[0] === "function") ? 
               [arguments[0]] :
               arguments[0];
    // TODO
    return chan;
  }

  // off("a:b:c", f) or off({"a": f, "b": f2})
  if (arguments.length > 1) {           // off("msg", f)
    var msgMap = {};
    msgMap[arguments[0]] = arguments[1];
  } else {                              // off({"msg": f, ...})
    var msgMap = arguments[0];
  }
  
  for (var string in msgMap){
    msgs = string.split(" ");

    var fs = msgMap[string];
    if (typeof fs === "function") fs = [fs];

    for(var i=0; msg=msgs[i]; i++){

      if (msg in chan.listeners)
        listeners = chan.listeners;
      else if (msg in chan.globListeners)
        listeners = chan.globListeners;
      else
        continue;

      // gotta do this carefully in case we are still iterating through the listener in send
      // build a new array and assign it to the property, instead of mutating it.

      // console.log(" length of listeners[" + msg + "]: " + listeners[msg].length)
      // console.log(listeners[msg].join(","));
      // console.log(fs.join(","));

      listeners[msg] = listeners[msg].filter(
                         function(f){ return fs.indexOf(f) === -1 }
                       );
      // console.log(" length of listeners[" + msg + "]: " + listeners[msg].length)

    }
  }

  return chan;

};



Tube.proto.send = function(msgString /*, data... */){

  // todo: don't do this?
  if (!Tube.total[msgString]) Tube.total[msgString] = 0
  Tube.total[msgString]+=1;

  var listener,
      listeners = this.listeners,
      globListeners = this.globListeners,
      //args = Array.prototype.splice.call(arguments, 1),
      msgs = tokenize(msgString),
      msg, f;

  if (arguments.length) {
    var args = Array.prototype.splice.call(arguments, 1);
    args.push(msgString);

  } else {
    var args = [];
  }

  for (var m=0; msg=msgs[m]; m++){

    var fsToRun = [];
    var uidKeyFnValue = {};
    var uidKeyMsgStringValue = {};

    // note this will die on errors
    // todo: implement http://dean.edwards.name/weblog/2009/03/callbacks-vs-events/
    // exact matches
    if (listener = listeners[msg]) {
      for (var i=0; f=listener[i]; i++){
          // fsToRun.push([f, msg]);
        uidKeyFnValue[f.uid] = f;
        uidKeyMsgStringValue[f.uid] = msg;
      }
    }

    // glob matches
    var msgSplit = msg.split(":");

    for (var pattern in globListeners){

      if (pattern !== "*") { // * always matches
        var patternSplit = globcache[pattern] || (globcache[pattern] = pattern.split(":"));
        if (!globber(patternSplit, msgSplit)) continue;
      }

      listener = globListeners[pattern];

      for (var i=0; f=listener[i]; i++){
        //f.apply(window, args); // hm possibly pass the actual message to the func
        // fsToRun.push([f, msg]);
        uidKeyFnValue[f.uid] = f;
        uidKeyMsgStringValue[f.uid] = msg;
      }
    }

    var fns = [];
    for (var f in uidKeyFnValue) fns.push(uidKeyFnValue[f]);

    for (var i=0, f; f=fns[i]; i++)
      f.apply(f, args);

  }

  return this;

};

module.exports = Tube;
},{"./nexttick":15,"./object/setproto":17,"./string/globber":18,"./string/tokenize":19,"./uid":21}],21:[function(require,module,exports){
var Uid = function(){
  return (Uid.counter++ + "");
}

Uid.counter = 1;

module.exports = Uid;
},{}]},{},[11])
;