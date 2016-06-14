# SchedulingInfoLayer

We're going to try java and javascript for this

An abstraction between whatever wordpress plugin happens to handle course registration and scheduling at any given time and our internal systems

## Roadmap

 - Course, camp, and student objects are exactly what they sound like. Their constructor handles making the API calls. They probably implement a common interface
    - These objects take filter parameters in their constructors
 - Presenter objects will handle taking whatever course or students etc. object and render them to HTML or JSON or whatever
 - I don't know if we need anything else
 - Would a json interpreter object that wraps org.json be useful? Each info class (camp etc.) would need its own.

