var fs = require('fs'),
  , path = require('path')
  , util = require('util')


function dirTree(filename) {
    var stats = fs.lstatSync(filename),
        info = {
            path: filename,
            name: path.basename(filename)
        };

    if (stats.isDirectory()) {
        info.type = "folder";
        info.children = fs.readdirSync(filename).map(function(child) {
            return dirTree(filename + '/' + child);
        });
    } else {
        // Assuming it's a file. In real life it could be a symlink or
        // something else!
        info.type = "file";
    }

    return info;
}

var tree2tiles = function(tree){
    var tiles = [];
    var min_zoom = 3;
    var max_zoom = 7;
    for (var zi = 0, z; z = tree.children[zi]; zi++){
        for (var yi = 0, y; y = z.children[yi]; yi++){
            for (var xi = 0, x; x = y.children[xi]; xi++){
                // var url = '/' + z.name + '/' + y.name + '/' + x.name;
                var url = z.name + '/' + y.name + '/' + x.name.split('.')[0];

                tiles.push(url);
            }
        }
    }
    return tiles;
};

var tiles2object = function(tiles){
    var obj = {};
    for (var i=0, tile; tile=tiles[i]; i++){
        tile = tile.split('/');
        var z = parseInt(tile[0]), y = parseInt(tile[1]), x = parseInt(tile[2]);
        if (!(z in obj)) obj[z] = {}
        if (!(y in obj[z])) obj[z][y] = []
        if (obj[z][y].indexOf(x) === -1) obj[z][y].push(x)
    }
    return obj;
}

if (module.parent == undefined) {
    // node dirTree.js ~/foo/bar
    var tree = dirTree('tiles');
    var tiles = tree2tiles(tree);
    var tiles_obj = tiles2object(tiles);
    // console.log(util.inspect(tiles));
    var str = util.inspect(tiles_obj);
    str = str.replace(/ |\n|\'/g, '');
    console.log(str);

    // console.log(util.inspect(dirTree(process.argv[2]), false, null));
}
// from http://stackoverflow.com/questions/11194287/convert-a-directory-structure-in-the-filesystem-to-json-with-node-js