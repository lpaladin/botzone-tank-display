namespace Util {

	export namespace colors {
		export function extract(color: number): [number, number, number] {
			return [(color & 0xff0000) >> 16, (color & 0x00ff00) >> 8, color & 0x0000ff];
		}

		export function add(color: number, degree2: number, color2 = Colors.WHITE, degree1 = 1) {
			let c2 = extract(color2);
			return extract(color)
				.map((comp, i) => Math.min(Math.round(comp * degree1 + degree2 * c2[i]), 255))
				.reduce((sum, val, i) => (sum << 8) | val);
		}

		export function scale(color: number, scale: number) {
			return [(color & 0xff0000) >> 16, (color & 0x00ff00) >> 8, color & 0x0000ff]
				.map(comp => Math.min(Math.round(comp * scale), 255))
				.reduce((sum, val, i) => (sum << 8) | val);
		}
	}

	export function sign(x: number) {
		return x > 0 ? 1 : x < 0 ? -1 : 0;
	}

	export function rand(upper: number) {
		return Math.floor(Math.random() * upper);
	}

	export const dx = [ 0, 1, 0, -1 ];
	export const dy = [ -1, 0, 1, 0 ];

	export function biDirectionConstantSet(obj: object, ...props: [string, (() => void) | any][]) {
		let initial: any[] = [];
		return TweenMax.to({}, 0.001, {
			immediateRender: false,
			onComplete: () =>
				props.forEach(([propName, to], i) => {
					initial[i] = obj[propName];
					if (to instanceof Function)
						obj[propName] = to();
					else
						obj[propName] = to;
				}),
			onReverseComplete: () =>
				props.forEach(([propName, to], i) => {
					obj[propName] = initial[i];
				})
		});
	}
}