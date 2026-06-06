
window._loadModelViewer = function(){
  if(window._mvLoaded) return;
  window._mvLoaded = true;
  const s = document.createElement("script");
  s.type = "module";
  s.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/4.2.0/model-viewer.min.js";
  document.head.appendChild(s);
};
