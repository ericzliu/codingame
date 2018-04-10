export function isUndefinedOrNull(x) {
    return (x === undefined || x === null);
}

export function remove(array, element) {
    const i = array.indexOf(element);
    if (i > -1) {
        array.splice(i, 1);
    }
}
