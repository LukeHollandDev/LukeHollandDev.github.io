const history = [];
let historyCursor = 0;

function surroundBreaks(element) {
  element.prepend(document.createElement("br"));
  element.append(document.createElement("br"));
  return element;
}

function getInputElement() {
  const div = document.createElement("div");
  div.className = "terminal-line";
  div.innerHTML = "$";
  const input = document.createElement("span");
  input.id = "input";
  input.className = "input"
  input.setAttribute('contenteditable', true);
  input.setAttribute('autofocus', true);
  input.setAttribute('role', 'textbox');
  div.appendChild(input);
  return div;
}

function invalidCommand(cmd) {
  const div = document.createElement("div");
  div.innerHTML = `Command '<b>${cmd}</b>' not found`
  div.innerHTML += `, use command '<b>help</b>' to see available commands.`;
  return div;
}

function submitCommand(e) {
  if (e.key === "Enter") {
    e.preventDefault();
    var curInput = document.getElementById('input');
    if (curInput) {
      curInput.id = "old-input";
      curInput.setAttribute('contenteditable', false);
      curInput.setAttribute('autofocus', false);
      const args = curInput.textContent.toLowerCase().split(' ');
      if (Object.keys(COMMANDS).includes(args[0])) {
        const output = COMMANDS[args[0]].fn(args.slice(1));
        if (output) {
          document.getElementById('main').appendChild(surroundBreaks(output));
        }
      } else {
        document.getElementById('main').appendChild(invalidCommand(args[0]));
      }
      document.getElementById('main').appendChild(getInputElement());
      document.getElementById('input').focus();
      history.push(curInput.textContent);
      historyCursor = history.length - 1;
    }
  }

  if (e.key === "ArrowUp") {
    e.preventDefault();
    document.getElementById('input').textContent = history[historyCursor];
    historyCursor -= 1;
    if (historyCursor < 0) {
      historyCursor = 0;
    }
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    document.getElementById('input').textContent = history[historyCursor];
    historyCursor += 1;
    if (historyCursor >= history.length) {
      historyCursor = history.length - 1;
    }
  }
}

document.addEventListener('keydown', submitCommand);
document.addEventListener('click', () => {
  document.getElementById('input').focus();
})
