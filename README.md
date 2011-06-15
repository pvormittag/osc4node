osc4node
========
----------------------

__osc4node__ is the one of OpenSoundControl protocol implementation for *Node.js*.  
This library is developed based on [node-osc](http://github.com/termie/node-osc), with more flexible and useful features.

Module Dependencies
-------------------

-    [socket.io](https://github.com/LearnBoost/Socket.IO)  
-    [express](https://github.com/visionmedia/express) (for the example app)

Installation
------------

```
$ npm install osc4node
```

Usage
-----
### Basically:

```javascript
// import module
var osc = require('osc4node');

// create osc server and client
var server = new osc.Server(11000, 'localhost')
  , client = new osc.Client('localhost', 12000);

// create osc message
var message = new osc.Message('/foo/bar', 'hello world');

// send
server.send(message, client);
```

You may find more usage in **./example/app.js**

### Message syntax

Simply pass the *address* and an argument.
Any String or Number(int/float) are allowed.

```javascript 
new osc.Message('/foo/bar', 'hello'); // string
new osc.Message('/foo/bar', 12345); // int
new osc.Message('/foo/bar', 123.45); // float

```

We can pass some arguments using array or multiple value at one time.

```javascript
// Array
new osc.Message('/foo/bar', [1, 2, 3, 4, 5]);

// Multiple arguments
new osc.Message('/foo/bar', 'hello', 123, 4.5);
```

Osc message also has __add()__ method.

```javascript
var message = new osc.Message('/foo/bar');
message.add('hello');
message.add('bonjour');
```

### Bundle syntax

Bundle is also available.
It can be used almost same as Message.

```javascript
var msg1 = new osc.Message('/foo/bar', 1)
  , msg2 = new osc.Message('/baz/qux', 2);

// create Bundle
var bundle = new osc.Bundle();
bundle.add(msg1);
bundle.add(msg2);

server.send(bundle, client);
```

or


```javascript
var msg1 = new osc.Message('/foo/bar', 1)
  , msg2 = new osc.Message('/baz/qux', 2);

var bundle = new osc.Bundle(msg1, msg2);

server.send(bundle, client);
```

Passing multiple argumetns or an Array will support soon.

License
-------

(The MIT License)

Copyright (c) 2011 Hideyuki Saito <info@hideyukisaito.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.