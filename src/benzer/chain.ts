export default class Chain<T> {
	value: T;
	previous?: Chain<T> = undefined;

	constructor(value: T) {
		this.value = value;
	}

	add(value: T): Chain<T> {
		const chain = new Chain(value);
		chain.previous = this;
		return chain;
	}

	toString(): string {
		if (!this.previous) return this.value as unknown as string;
		return this.previous.toString() + this.value;
	}
}

