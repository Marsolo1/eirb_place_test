const start = [,];

const image = [[]];

const n = image.length;
const m = image[0].length;

async function getPixelColor(x, y) {
	try {
		const response = await placeAjax.get(`api/pos-info?x=${x}&y=${y}`).then((data) => {
			if ("pixel" in data) {
				if (data.pixel != null && data.pixel != undefined && "colour" in data.pixel) {
					console.log(`(${x},${y}) is %c${data.pixel.colour}`, `color: #${data.pixel.colour}`);
					return data.pixel.colour;
				} else {
					console.log(`(${x},${y}) is empty`);
					return "";
				}
			} else {
				console.log(`(${x},${y}) : no pixel found`);
			}
		});
		return response;
	} catch (error) {
		console.log(error);
	};
}

async function placePixel(x, y, hex) {
	try {
		const response = await placeAjax.post(`api/place`, { x: x, y: y, hex: hex }).then((data) => {
			return data;
		});
		return response;
	} catch (error) {
		console.log(error);
	};
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
	console.log('Starting...');
	let x = 0;
	let y = 0;
	let currentHex = '#000000';
	let noskip = false;
	while (true) {
		px = start[0] + x;
		py = start[1] + y;
		currentHex = image[x][y];
		if (currentHex.startsWith('#')) {
			await getPixelColor(px, py).catch((error) => { console.log(error); noskip = false }).then((data) => {
				if (data == null || data == undefined) {
					noskip = false;
				} else if (currentHex.slice(1) === data || (currentHex.slice(1) === "ffffff" && data === "")) {
					console.log(`Pixel ${px}, ${py} is already %c${(data === "") ? "empty" : data}`, `color: #${data}`);
					noskip = false;
				} else {
					console.log(`Placing color %c${currentHex}%cat pixel ${px}, ${py}`, `color: ${currentHex}`);
					noskip = true;
				}
			});
			if (noskip) {
				await placePixel(px, py, currentHex).catch((error) => { console.log(error) }).then((data) => {
					currentTimer = data.timer.seconds || 10;
					if (data.success) {
						console.log(`Placed color %c${currentHex}%cat pixel ${px}, ${py}. ${currentTimer} seconds remaining`, `color: ${currentHex}`);
					} else {
						console.log(`Failed to place color %c${currentHex}%cat pixel ${px}, ${py}: retrying in ${currentTimer}s`, `color: ${currentHex}`);
					}
				});
				await sleep((currentTimer) * 1000);
				// await sleep(getRandomInt(50, 200) * 10);
			}
		}
		if (x === n - 1 && y === m - 1) {
			x = 0;
			y = 0;
			console.log("End of image, returning to start in 5 seconds");
			await sleep(10 * 500);
		} else if (x === n - 1) {
			x = 0;
			y++;
		} else {
			x++;
		}
		await sleep(10);
	}
}

main();
