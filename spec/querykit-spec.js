import { it } from './utils.js';
import { toArray, each, map, many, reduce, concat } from '../src/querykit.js';

const defer = fn => new Promise(resolve => setTimeout(resolve(fn()), 0));

describe('Asynq', () => {

	it('Should be able to convert a sequence to an array', async () => {

		const input = [1, 2, 3];

		const output = await input::toArray();

		expect(output).toEqual(input);

	})

    it('Should be able to loop over synchronous array', async () => {

        const input = [1, 2, 3];

        const eachSpy = jasmine.createSpy();

        const output = await input::each(eachSpy);

        expect(eachSpy).toHaveBeenCalledWith(1, 0);
        expect(eachSpy).toHaveBeenCalledWith(2, 1);
        expect(eachSpy).toHaveBeenCalledWith(3, 2);

    })

    it('Should be able to loop over synchronous sequence', async () => {

        const input = (function*() {
            yield 1;
            yield 2;
            yield 3;
        })();

        const eachSpy = jasmine.createSpy();

        const output = await input::each(eachSpy);

        expect(eachSpy).toHaveBeenCalledWith(1, 0);
        expect(eachSpy).toHaveBeenCalledWith(2, 1);
        expect(eachSpy).toHaveBeenCalledWith(3, 2);

    })

    it('Should be able to loop over asynchronous sequence', async () => {

        const input = (async function*() {
            yield await defer(() => 1);
            yield await defer(() => 2);
            yield await defer(() => 3);
        })();

        const eachSpy = jasmine.createSpy();

        const output = await input::each(eachSpy);

        expect(eachSpy).toHaveBeenCalledWith(1, 0);
        expect(eachSpy).toHaveBeenCalledWith(2, 1);
        expect(eachSpy).toHaveBeenCalledWith(3, 2);

    })

    it('Should be able to map synchronous value selectors', async () => {

        const input = [1, 2, 3];

        const output = await input
            ::map(x => x * 2)
            ::toArray();

        const expected = [2, 4, 6];

        expect(output).toEqual(expected);

    })

    it('Should be able to map asynchronous value selectors', async () => {

        const input = [1, 2, 3];

        const output = await input
            ::map(async x => await defer(() => x * 2))
            ::toArray();

        const expected = [2, 4, 6];

        expect(output).toEqual(expected);

    })

    it('Should be able to map synchronous value selectors that return promises', async () => {

        const input = [1, 2, 3];

        const output = await input
            ::map(x => defer(() => x * 2))
            ::toArray();

        const expected = [2, 4, 6];

        expect(output).toEqual(expected);

    })

    it('Should be able to select many synchronous value selectors', async () => {

        const input = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ];

        const output = await input
            ::many()
            ::toArray();

        const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        expect(output).toEqual(expected);

    })

    it('Should be able to select many asynchronous value selectors', async () => {

        const input = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ];

        const output = await input
            ::many(async row => defer(() => row))
            ::toArray();

        const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        expect(output).toEqual(expected);

    })

    it('Should be able to select many synchronous value selectors that return promises', async () => {

        const input = [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ];

        const output = await input
            ::many(row => defer(() => row))
            ::toArray();

        const expected = [1, 2, 3, 4, 5, 6, 7, 8, 9];

        expect(output).toEqual(expected);

    })

    it('Should be able to reduce synchronous value selectors', async () => {

        const input = [1, 2, 3];

        const output = await input::reduce((sum, x) => sum + x);

        const expected = 6;

        expect(output).toEqual(expected);

    })

    it('Should be able to reduce asynchronous value selectors', async () => {

        const input = [1, 2, 3];

        const output = await input::reduce(async (sum, x) => await defer(() => sum * x));

        const expected = 6;

        expect(output).toEqual(expected);

    })

    it('Should be able to reduce synchronous value selectors that return promises', async () => {

        const input = [1, 2, 3];

        const output = await input::reduce((sum, x) => defer(() => sum * x));

        const expected = 6;

        expect(output).toEqual(expected);

    })

    it('Should be able to concat synchronous arrays', async () => {

        const inputA = [1, 2, 3];
        const inputB = [4, 5, 6];

        const output = await inputA
            ::concat(inputB)
            ::toArray();

        const expected = [1, 2, 3, 4, 5, 6];

        expect(output).toEqual(expected);


    })

    it('Should be able to concat synchronous sequences', async () => {

        const inputA = (function*() {
            yield 1;
            yield 2;
            yield 3;
        })();

        const inputB = (function*() {
            yield 4;
            yield 5;
            yield 6;
        })();

        const output = await inputA
            ::concat(inputB)
            ::toArray();

        const expected = [1, 2, 3, 4, 5, 6];

        expect(output).toEqual(expected);

    })

    it('Should be able to concat asynchronous sequences', async () => {

        const inputA = (async function*() {
            yield await defer(() => 1);
            yield await defer(() => 2);
            yield await defer(() => 3);
        })();

        const inputB = (async function*() {
            yield await defer(() => 4);
            yield await defer(() => 5);
            yield await defer(() => 6);
        })();

        const output = await inputA
            ::concat(inputB)
            ::toArray();

        const expected = [1, 2, 3, 4, 5, 6];

        expect(output).toEqual(expected);

    })

    it('Should be able to group synchronous value selectors', async () => {

        const input = [1, 2, 3];

        const output = await input
            ::group(x => x % 2 === 0)
            ::toArray();

        const expected = [
            [false, [1, 3]],
            [true, [2]]
        ];

        expect(output).toEqual(expected);

    })

    it('Should be able to group asynchronous value selectors', async () => {

        const input = [1, 2, 3];

        const output = await input
            ::group(async x => await defer(() => x % 2 === 0))
            ::toArray();

        const expected = [
            [false, [1, 3]],
            [true, [2]]
        ];

        expect(output).toEqual(expected);

    })

    it('Should be able to group synchronous value selectors that return promises', async () => {

        const input = [1, 2, 3];

        const output = await input
            ::group(x => defer(() => x % 2 === 0))
            ::toArray();

        const expected = [
            [false, [1, 3]],
            [true, [2]]
        ];

        expect(output).toEqual(expected);

    })

})
