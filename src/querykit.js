export function getAsyncIterator(iterable) {

    // direct iterators

    if (typeof iterable.next === 'function') {
        return iterable;
    }

    // async iterators

    if (Symbol.asyncIterator in iterable) {
        return iterable[Symbol.asyncIterator]();
    }

    // classic iterators

    if (Symbol.iterator in iterable) {
        return iterable[Symbol.iterator]();
    }

}

export async function toArray() {

    const iterator = getAsyncIterator(this);

    const result = [];

    let next;

    while ((next = await iterator.next()).done !== true) {

        const item = next.value;

        result.push(item);

    }

    return result;

}

export async function each(itemHandler) {

    const iterator = getAsyncIterator(this);

    let next, i = 0;

    while ((next = await iterator.next()).done !== true) {

        const item = next.value;

        await itemHandler(item, i++);

    }

}

export async function* map(valueSelector) {

    const iterator = getAsyncIterator(this);

    let next, i = 0;

    while ((next = await iterator.next()).done !== true) {

        const item = next.value;

        const value = await valueSelector(item, i++);

        yield value;

    }

}

export async function* many(itemsSelector = items => items, valueSelector = item => item) {

    const outerIterator = getAsyncIterator(this);

    let next, i = 0;

    while ((next = await outerIterator.next()).done !== true) {

        const outer = next.value;

        const innerItems = await itemsSelector(outer, i++);

        const innerIterator = getAsyncIterator(innerItems);

        while ((next = await innerIterator.next()).done !== true) {

            const inner = next.value;

            const value = await valueSelector(inner, outer);

            yield value;

        }

    }

}

export async function reduce(reducer, initialValue) {

    const hasInitialValue = initialValue !== undefined;

    let result = hasInitialValue ? await initialValue : undefined;

    const iterator = getAsyncIterator(this);

    let next, i = 0;

    while ((next = await iterator.next()).done !== true) {

        const item = next.value;

        // if we're on the first item and we don't have an initial value then use the first iteration to establish the first result
        if (i === 0 && hasInitialValue !== true) {
            result = item;
        } else {
            result = await reducer(result, item, i);
        }

        i++;

    }

    return result;

}

export function concat(...otherSequences) {

    const sequence = this;
    const sequences = [sequence, ...otherSequences];

    return sequences::many();

}
