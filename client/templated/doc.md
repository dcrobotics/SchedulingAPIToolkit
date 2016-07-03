# Documentation!

## frameworkfunctions
The primary manager for our framework. Handles dispatching calls for information and calling renderers for the info when returned. Will not work without nunjucks, browserrequester, and controller.
### functions
 - `function insertInfo(info,template,parent,filter)`  
    Inserts the information specified with the template given into the page as a child of the parent id.  
    Calls `render()`

 - `function render(data, params)`  
    Needs a params object that contains params.t = template and params.p = parent


## controller  
Contains an object that's just a reference of information and where to find it.  

### functions
 - `getURL(info)`  
    Returns a url for the specified piece of information, if we have it.
