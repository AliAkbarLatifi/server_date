/*
  server_date - v0.0.1
The MIT License (MIT)

Copyright (c) 2015 Sajad Bahar

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
SOFTWARE.
*/
Date = function (Date) {
    'use strict';

    MyDate.prototype = Date.prototype;
    MyDate.now = Date.now;
    MyDate.UTC = Date.UTC;

    // Get URL of script so we can call it again during
    // synchronization.
    var scripts = document.getElementsByTagName('script'),
    URL = scripts[scripts.length - 1].src,
    synchronizing = false,
    SERVER_DATE;

    var bind = Function.bind;
    var unbind = bind.bind(bind);

    function instantiate(constructor, args) {
        return new (unbind(constructor, null).apply(null, args));
    }

    function MyDate() {
        var args = arguments.length;

        if (args === 0) {
            if (SERVER_DATE !== undefined) {
                var myTZO = -210,
                    d = new Date(SERVER_DATE);
                return new Date(d.getTime() + (60000 * (d.getTimezoneOffset() - myTZO)));
            }
        }
        return instantiate(Date, arguments);
    }

    // Synchronize the ServerDate object with the server's clock.
    function synchronize() {

        // Request a time sample from the server.
        function requestTime() {
            var request = new XMLHttpRequest();

            // Ask the server for another copy of ServerDate.js but specify a unique number on the URL querystring
            // so that we don't get the browser cached Javascript file
            // Use HEAD request instead of GET because we don't need file content
            request.open('HEAD', URL + '?noCache=' + Date.now());

            /*
            // At the earliest possible moment of the response, record the time at
            // which we received it.
            request.onreadystatechange = function() {
                // If we got the headers and everything's OK
                if ((this.readyState === this.HEADERS_RECEIVED) &&
                        (this.status === 200)) {
                }
            };*/

            // Process the server's response.
            request.onload = function() {
                // If OK
                if (this.status === 200) {
                    try {
                        // Process the server's Date from the response header
                        setServerDateTime(this.getResponseHeader('Date'));
                    } catch (exception) {
                        // Show Console log
                    }
                }
            };

            // Send the request.
            request.send();
        }

        if (!synchronizing) {
            synchronizing = true;

            // Request time.
            requestTime();
        }
    }

    function setServerDateTime(dateTime) {
		  SERVER_DATE = dateTime;
    }

    // Start our first synchronization.
    synchronize();

    return MyDate;

}(Date);
