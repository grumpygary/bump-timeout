const { bumpTimeout, timeout, listActiveBumpTimeouts } = require("../src/bump-timeout");
  
describe("Bump Timeout tests", () => {
    // let books, movies, quotes, bookId, movieId, quoteId;
    test("Single bumpTimeout", async () => {
        let value;
        value = await bumpTimeout('one',() => 'one')
        expect(value).toBe('one');
        expect(await bumpTimeout('two',() => `${value}-two`)).toBe('one-two');
    });
  
    test("Multiple, in sequence with same key, last only!", async () => {
        let expected = "third";
        let _resolve;
        const handler = async (val) => {
            return _resolve(val);
        }
        const result = async (val) => {
            return new Promise((resolve) => { _resolve = resolve; });
        }
        bumpTimeout("test",() => handler("first"),1000);
        bumpTimeout("test",() => handler("second"),500);
        bumpTimeout("test",() => handler("third"),10);

        expect(await result()).toBe(expected);
    });
 
    test("Multiple, in sequence with same key, fn cleared", async () => {
        let timers, value = null;
        const handler = async (val) => { value = val; }
        bumpTimeout("test",() => handler("first"),1000);
        bumpTimeout("test",() => handler("second"),500);
        bumpTimeout("test",() => handler("third"),100);
        timers = listActiveBumpTimeouts();
        expect(timers.length).toBe(1);
        // now clear the timer
        bumpTimeout("test");
        timers = listActiveBumpTimeouts();
        expect(timers.length).toBe(0);
        expect(value).toBe(null);
    });
 
    test("Multiple async timeout (normal style)", async () => {
        let values = [], expected = "third";
        let _resolve;
        const handler = (val) => {
            values.push(val || "?");
            console.log(values.join(","))
        }
        let msSoFar = Date.now();
        await timeout(1000);
        await timeout(500);
        await timeout(10);
        let elapsed = Date.now() - msSoFar;

        expect(elapsed > 1510).toBe(true);
    });
});