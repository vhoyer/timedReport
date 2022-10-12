import $ from 'jquery';

function setupClipboard(text: string) {
  $('body').append(`<div id="clipboard-container" style="
  position: fixed;
  left: 0px;
  top: 0px;
  width: 0px;
  height: 0px;
  z-index: 100;
  opacity: 0;"><textarea id="clipboard" style="
  width: 1px;
  height: 1px;
  padding: 0px;">${text}</textarea></div>`);
}

function setoffClipboard() {
  $('#clipboard-container').remove();
}

export function copy(text: string) {
  setupClipboard(text);

  // Get Input Element
  const textarea = document.getElementById('clipboard') as HTMLTextAreaElement|null;
  textarea?.select();

  // Copy Content
  document.execCommand('copy');

  setoffClipboard();
}
