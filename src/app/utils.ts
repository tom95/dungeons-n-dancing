
export function genId(prefix: string) {
	return (prefix ? prefix + ':' : '') +
		Math.random().toFixed(20).substring(2);
}

