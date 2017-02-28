/*
Creates an SVG line graph of the datasets passed. All datasets use the same
y axis, so values should be on roughly the same scale or the graph won't look
very good.

datasets is an array of objects of the following format:
{
	data:[] // Array of values to plot. Index in the array is the x value.
	color:"white" // Can be a svg compatible color, #RRGGBB, or a base
	 			  // RESOURCE_* constant
	width:2 // Line width
	// default values specified for <color> and <white>
}
width and height are optional and specified in pixels
*/

global.consoleGraph = function(datasets, width=1000, height=300) {
	let steps = [1,2.5,5,10];
	let axesLineStyle = `style="fill:none;stroke:#999999;stroke-width:1"`
	let gridLineStyle = `style="fill:none;stroke:#999999;stroke-width:.25"`
	let RES_COLOR = {
		[RESOURCE_HYDROGEN]: `#989898`,
		[RESOURCE_OXYGEN]: `#989898`,
		[RESOURCE_UTRIUM]: `#48C5E5`,
		[RESOURCE_LEMERGIUM]: `#24D490`,
		[RESOURCE_KEANIUM]: `#9269EC`,
		[RESOURCE_ZYNTHIUM]: `#D9B478`,
		[RESOURCE_CATALYST]: `#F26D6F`,
		[RESOURCE_ENERGY]: `#FEE476`,
		[RESOURCE_POWER]: `#F1243A`,
	};

	let maxVal = -Infinity;
	datasets.forEach(dataset => maxVal = Math.max(maxVal, _.max(dataset.data)));
	let step = Math.max(1, Math.floor(maxVal / 10));
	if (step > 5) {
		let multiplier = Math.pow(10, Math.max(1, step.toString().length - 1));
		step = multiplier * steps.find(s => s * multiplier >= step);
	}

	let out = '<svg height=' + height + ' width=' + width + '>';
	// Draw axes
	out += `<polyline points="0,${height-1} ${width-100},${height-1}" ${axesLineStyle}/>`
	out += `<polyline points="${width-100},0 ${width-100},${height}" ${axesLineStyle}/>`
	// Draw grid lines + labels
	for (let i = 0; i * step < (maxVal*0.95); i++) {
		let y = height - Math.floor(height * ((i * step) / maxVal));
		out += `<polyline points="0,${y} ${width-95},${y}" ${gridLineStyle}/>`
		out += `<text style="fill:#FFFFFF;" x="${width-95}" y="${y}">${i * step}</text>`
	}

	datasets.forEach(dataset => {
		out += `<polyline points="`
		for (let i = 0; i < dataset.data.length; i++) {
			let x = Math.floor((width-100) * (i/dataset.data.length));
			let y = height - Math.floor(height * (dataset.data[i] / maxVal));
			out += `${x},${y} `
		}
		let color = dataset.color;
		if (color && RES_COLOR[color]) {
			color = RES_COLOR[color];
		}
		if (!color) {
			color = `#FFFFFF`;
		}
		let stroke_width = dataset.width;
		if (!stroke_width) {
			stroke_width = 2;
		}
		out += `" style="fill:none;stroke:${color};stroke-width:${stroke_width}"/>`
	});
	out += `</svg>`;
	console.log(out);
}
