# Documentation!

## frameworkfunctions

 - `function insertInfo(info,template,parent,filter)`  
    Inserts the information specified with the template given into the page as a child of the parent id.  
    Calls `render()`

 - `function render(data, params)`  
    Needs a params object that contains params.t = template and params.p = parent


## controller  
Contains an object that's just a reference of information and where to find it.  
 - `getURL(info)`  
    Returns a url for the specified piece of information, if we have it.
