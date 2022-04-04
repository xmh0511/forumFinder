import axios from "axios";

async function findCurrent(url, key, result, proxy) {
	return new Promise(async (rs, rj) => {
		let response = await axios.get(
			`${url}`, {
				proxy,
				headers: {
					// "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36"
				}
			});
		let html = response.data;
		//console.log(html)
		let index = 0;
		let fragment = []
		while (index !== -1) {
			index = html.indexOf(key, index);
			// console.log(index);
			if (index !== -1) {
				console.log("existence");
				let r = html.lastIndexOf("href", index);
				let start = r + 6;
				//console.log(start,html.substring(start));
				let r1 = html.indexOf('"', start);
				//console.log(r1)
				let href = html.substr(start, r1 - start);
				// console.log("href: ", href);
				let textA = html.lastIndexOf("<a", index);
				let textStart = html.indexOf(">", textA + 2);
				let textEnd = html.indexOf("</", textStart + 1);
				let text = html.substring(textStart + 1, textEnd);
				let data = {
					href: `${href}`,
					subtitle: text
				}
				result.push(data);
				fragment.push(data);
				index = index + key.length;
			}
		}
		rs(fragment);
	})
}
async function Sleep(delay) {
	return new Promise((rs) => {
		if (delay > 0) {
			setTimeout(() => {
				rs(true);
			}, delay)
		} else {
			rs(true);
		}
	})
}
export async function startFind(urlTmp, extent, key, proxy, delay, callback) {
	return new Promise(async (rs, rj) => {
		let list = [];
		console.log(extent)
		let current = 0;
		for (let i = extent[0]; i <= extent[1]; i++) {
			current++;
			const url = urlTmp.replace(/{page}/, "" + i);
			//console.log(url)
			let r = await findCurrent(url, key, list, proxy);
			callback(extent[1] - extent[0] + 1, current,r);
			if (i < extent[1]) {
				let w = await Sleep(delay);
			}
		}
		//console.log(list);
		rs(list);
	})
}
