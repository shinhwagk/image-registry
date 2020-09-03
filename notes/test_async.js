const async = require('async')

var q = async.queue(function (task, callback) {
    setTimeout(() => { console.log('hello ' + task.name); callback(null, task); }, task.time)

}, 10);


q.push({ name: 'foo', time: 10000 }, function (err) {
    console.log('10000 success');
});


q.push([{ name: 'foo', time: 3000 }, { name: 'foo', time: 3000 }], function (err, t) {
    console.log('foo 3000 success', t.name);
    console.log(t.name, '  3000 success');
    console.log('foo 3000 success', t.name);
})

q.push([{ name: 'foo1', time: 3000 }, { name: 'foo2', time: 3000 }, { name: 'foo3', time: 3000 }], function (err, t) {
    console.log(t.name)
    console.log(t.name, '  3000 success');
    console.log(t.name)
})

