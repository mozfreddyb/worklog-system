onmessage = function(event) {
  importScripts('highlight.pack.js');
  var request = event.data;
  var result = self.hljs.highlightAuto(request.code);
  postMessage({ hl: result.value, id: request.id});
}
