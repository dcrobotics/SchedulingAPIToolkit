# Function Reference
## THIS IS OUT OF DATE
`function addRequest(url, callbackfunc, params)`  
Adds a request to the stack. Takes a URL to request, a callback function to trigger when its done, a boolean to tell whether to parse or leave the response, and parameters to pass the callback function. Returns an idx value that represents the index of the request it added to the stack.

`function dispatch(idx)`  
Sends the request at the given idx.  
*Should we also delete the request when we dispatch it???*

`function dispatchAll`  
Sends every request in the stack
