# bump-timeout

> Coorordinate multiple timeout calls using keys.

## Installing

### NPM

```sh
npm install "bump-timeout"
```

### GitHub

```sh
   npm install "https://github.com/grumpygary/bump-timeout"
```

## Use Case

You have a common async function that you want to call at various times.
However, since it takes time while other parts of the code are running
that may be more important, it's often desirable to have a way to
let the program settle before actually making the call.

bumpTimeout does this by storing the function with the key,
removing them once the function is run or cancelled.
Any calls to bumpTimeout() with the same key will update both the
function and the target time.  Calling bumpTimeout(key) with no function
will clear the timeout.

While this introduces a race condition, that was already the case.
The bumpTimeout function simply makes it easier to manage.

The simple case is during app load.  Calling bumpTimeout("loaded",fn,300)
would basically wait until 300ms from the last call before proceeding.
This can dramatically speed up the app by reducing the number of calls
to the same function.

## Syntax

```bumpTimeout(fnCommonName,fn,msTimeout)```

name          | type     | default         | description
--------------|----------|-----------------|-------------------------------------------------
fnCommonName  | string   |                 | common key for the timeout.  required
function      | function | <none>          | will be called when timeout expires. Iif missing, the common timeout is cleared.
millseconds   | number   | 0               | timeout expiration in milliseconds
```

## Usage (example)

```js
import { 
    bumpTimeout, timeout, listActiveBumpTimeouts
} from "bump-timeout";

    const handler = async (val) => {
        console.log(`Value is "${val}"`)
    }

    bumpTimeout("test",() => handler("first"),1000);
    bumpTimeout("test",() => handler("second"),500);
    bumpTimeout("test",() => handler("third"),10);

    // only one line of output
    //  Result is "third"

```
