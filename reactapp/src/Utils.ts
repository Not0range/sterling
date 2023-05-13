export function p(query: string, key: string): string {
    const strs = query.substring(1).split('&');
    for (const s of strs) {
        const temp = s.split('=');
        if (temp[0] == key) return temp[1];
    }
    return '';
}

export function replace<T>(array: T[], index: number, item?: T): T[] {
    if (item) array.splice(index, 1, item);
    else array.splice(index, 1);
    return array;
}