import { Thenable } from './interfaces';


export const defer = <T>() => new Deferred<T>();

export class Deferred<T> {
    promise: Promise<T>
    resolve: (value?: T | Thenable<T>) => Promise<T>
    reject: (error: T) => Promise<T>
    then: <U>(onFulfilled?: (value: T) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>) => Promise<U>;
    catch: <U>(onRejected?: (error: any) => U | Thenable<U>) => Promise<U>;

    constructor() {
        this.promise = new Promise((resolve: (value?: T | Thenable<T>) => void, reject: (error?: any) => void) => {
            this.resolve = resolve as any;
            this.reject  = reject as any;
        })

        this.then  = this.promise.then.bind(this.promise);
        this.catch = this.promise.catch.bind(this.promise)
    }
}
/*
Copy/pasted from https://github.com/assisrafael/async-promises

The MIT License (MIT)

Copyright (c) 2015 Igor Rafael

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE
 */

export function eachSeries(arr, iterator) {
    let index: number = 0;

    function next() {
        if ( index >= arr.length ) {
            return Promise.resolve();
        }

        const item = arr[ index ++ ];

        let promise;
        try {
            promise = Promise.resolve(iterator(item))
        } catch ( e ) {
            return Promise.reject(e);
        }

        return promise.then(next);
    }

    return next();
}

export function each(arr, iterator) {
    const promises = [];

    arr.forEach(function (item) {
        promises.push(iterator(item));
    });

    return Promise.all(promises);
}

function parallelArrayTasks(tasks) {
    return Promise.all(tasks.map(function (task) {
        return typeof task === 'function' ? task() : task;
    }));
}

function parallelObjectTasks(tasks) {
    const results = {};

    return each(Object.keys(tasks), function (key) {
        let promise = tasks[ key ];

        if ( typeof promise === 'function' ) {
            promise = promise();
        }

        return Promise.resolve(promise).then(function (result) {
            results[ key ] = result;
        });
    }).then(function () {
        return results;
    });
}

export function parallel(tasks) {
    if ( Array.isArray(tasks) ) {
        return parallelArrayTasks(tasks);
    } else if ( typeof tasks === 'object' ) {
        return parallelObjectTasks(tasks);
    }

    return Promise.reject(new Error('First argument to parallel must be an array or an object'));
}

export function range(start, end, step) {
    let index    = - 1,
        length   = Math.max(Math.ceil((end - start) / (step || 1)), 0);
    const result = Array(length);

    while ( length -- ) {
        result[ ++ index ] = start;
        start += step;
    }

    return result;
}

function seriesArrayTasks(tasks) {
    const results = [];

    return eachSeries(tasks, function (task) {
        return Promise.resolve(task()).then(function (result) {
            results.push(result);
        });
    }).then(function () {
        return results;
    });
}

function seriesObjectTasks(tasks) {
    const results = {};

    return eachSeries(Object.keys(tasks), function (taskName) {
        return Promise.resolve(tasks[ taskName ]()).then(function (result) {
            results[ taskName ] = result;
        });
    }).then(function () {
        return results;
    });
}

export function series(tasks) {
    if ( Array.isArray(tasks) ) {
        return seriesArrayTasks(tasks);
    } else if ( typeof tasks === 'object' ) {
        return seriesObjectTasks(tasks);
    }

    return Promise.reject(new Error('Invalid parameter type'));
}

export function timesSeries(n, iteratee) {
    const tasks = range(0, n, 1);

    const results = [];

    return series(tasks.map((task) => () => Promise.resolve().then(() => iteratee(task))));
}

export function times(n, iteratee) {
    const tasks = range(0, n, 1);

    return Promise.all(tasks.map((task) => {
        return Promise.resolve().then(() => iteratee(task));
    }));
}

export function waterfall<T>(tasks): Promise<T> {
    if ( ! Array.isArray(tasks) ) {
        return Promise.reject(new Error('First argument to waterfall must be an array of functions'));
    }

    function nextItem(value?) {
        let task = tasks.shift();

        if ( ! task ) {
            return Promise.resolve(value);
        }

        return Promise.resolve(value).then(function (values) {
            if ( Array.isArray(values) ) {
                return task.apply(null, values);
            }

            return task(values);
        }).then(nextItem);
    }

    return nextItem();
}


export const resolve = Promise.resolve.bind(Promise)
export const reject  = Promise.reject.bind(Promise)
