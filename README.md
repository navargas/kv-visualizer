*A tool for visualizing distribution of keys across a
[Distributed KVS](https://github.com/palvaro/CMPS128-Winter17/blob/master/homework3_spec.md)
system.*

<img width="817" alt="screen shot 2017-02-21 at 4 03 35 pm"
src="https://cloud.githubusercontent.com/assets/8397737/23200356/c0ac09c0-f888-11e6-8677-010c6a52aca3.png">

Each box represents a node in the view, and the numbers show number of keys owned by that node.
The blue bars shows the ratio of local keys / total keys (Ideally all blue bars should be even).

Instructions:

The `VIEW` environment variable should contain a comma separated list of all nodes in the cluster.
```bash
docker run --rm -p 3030:3030 -e "VIEW=10.0.0.20:8080,10.0.0.21:8080" --net=mynet -d navargas/kv-viz
```
Then navigate to http://localhost:3030 in a browser
