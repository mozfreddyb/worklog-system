importScripts('highlight.pack.js');
onmessage = function(event) {
  var request = event.data;
  var result = self.hljs.highlightAuto(request.code);
  postMessage({ hl: result.value, id: request.id});
}
