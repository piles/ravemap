Array.prototype.random = function(){ 
  return this[ (Math.random() * this.length) | 0 ]
};

pin_ids = ['blue_1',
'blue_10',
'blue_11',
'blue_12',
'blue_13',
'blue_14',
'blue_15',
'blue_16',
'blue_2',
'blue_3',
'blue_4',
'blue_5',
'blue_6',
'blue_7',
'blue_8',
'blue_9',
'red_1',
'red_10',
'red_11',
'red_12',
'red_13',
'red_14',
'red_15',
'red_16',
'red_2',
'red_3',
'red_4',
'red_5',
'red_6',
'red_7',
'red_8',
'red_9',
'green_1',
'green_10',
'green_11',
'green_12',
'green_13',
'green_14',
'green_15',
'green_16',
'green_2',
'green_3',
'green_4',
'green_5',
'green_6',
'green_7',
'green_8',
'green_9'];

for (var i = 18; i >= 0; i--) {
	var pin = document.createElement('div');
	pin.className = 'pin';
	pin.id = pin_ids.random();
	pin.style.position = 'absolute';
	pin.style.top =  (Math.random()*90|0) + "%"
	pin.style.left = (Math.random()*90|0) + "%"
	document.body.appendChild(pin);
};