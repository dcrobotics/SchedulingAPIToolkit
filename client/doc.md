# Function Reference

# ALL THIS IS WRONG!

`function xget(url, callback)`  
Get's and returns the text at a given URL and triggers a callback when done

`function frender(url)`  
Renders the JSON result of the URL call to HTML, pending how we decide to do that potentially uses some kind of predefined rendering pattern object or something of the sort

`class requester(url, callbackFunc, parse, inputParams)`  
An object that will send a request an fire off a specified callback function with specified arguments when the loading completes. The callback functions arguments will be preserved from the time of calling. The callback function specified must take two arguments: the first being the JS object parsed from the url, the second must be an array of arguments. Make sure to use this array consistently between creating this object and implementing your callback, the use of an array allows total flexibility with arguments and ensures consistency with implementation on our side. The third argument in the constructor is a boolean parse, which decides whether to send the callback function parsed objects or raw response text (default true).