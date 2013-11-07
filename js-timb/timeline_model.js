var model = {};

model.year_min = 1988
model.year_max = 1998
model.months_total = (model.year_max - model.year_min) * 12
model.months_range = d3.range(model.months_total) // 0 - months_total-1
// map mouse co-ords to months scale. 
// input domain for d3 scale is set in resize fn.
model.months_scale = d3.scale.quantize().range(model.months_range)
// initial date
model.step = (model.months_total/2) |0;
model.mouseover = false
model.dirty = true;
model.resize = true;

module.exports = model;