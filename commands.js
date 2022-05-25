const COMMANDS = {
  who: {
    desc: 'Short description of who I am.',
    example: 'who',
    fn: who,
  },
  help: {
    desc: 'Shows a list of usable commands and how to use them.',
    example: 'help',
    fn: help,
  },
  clear: {
    desc: 'Clears the screen removing all the output from previous commands.',
    example: 'clear',
    fn: clear,
  },
  theme: {
    desc: 'Allows you to change the theme of the website.',
    options: ['dark', 'light', 'matrix'],
    example: 'theme light',
    fn: theme,
  },
  projects: {
    desc: 'Curated list of projects I have worked on.',
    example: 'projects',
    fn: projects,
  }
}

const PROJECTS = [
  {
    name: 'Algorithm Visualiser',
    desc: 'Application which allows you to create graphs and animate them with different graph algorithms. This was created as the final year university project.',
    url: 'https://amazonpriime.github.io/indproj',
    source: 'https://github.com/AmazonPriime/Algorithm-Animator',
    tech: ['JS', 'HTML', 'CSS', 'React', 'Jest']
  },
  {
    name: 'Web Utilies',
    desc: 'Utilities website to provide a variety of commonly googled for tools, like PDF merging and word counts.',
    url: 'https://amazonpriime.github.io/web-utilities/',
    source: 'https://github.com/AmazonPriime/Web-Utilities',
    tech: ['JS', 'HTML', 'CSS', 'Vue3']
  },
  {
    name: 'Cineworld Watchathon',
    desc: 'Application which makes it easier to view what is on at Cineworld making movie trips involving multiple movies easier to plan.',
    url: 'https://amazonpriime.github.io/cineworld/',
    source: 'https://github.com/AmazonPriime/Watchathon',
    tech: ['JS', 'HTML', 'CSS', 'React', 'Python', 'Flask']
  },
  {
    name: 'TradeUp',
    desc: 'Game which tasks you with trading up items starting from £1 until you have an item worth £100 or more! Uses real eBay listings.',
    url: 'https://amazonpriime.github.io/trade-up/',
    tech: ['JS', 'HTML', 'CSS']
  },
  {
    name: 'Xle',
    desc: 'Collection of Wordle-like games which can all be played in one place. Using iFrames you can play different games from one webpage.',
    url: 'https://amazonpriime.github.io/xle/',
    tech: ['JS', 'HTML', 'CSS']
  },
]

function usage(cmd) {
  const div = document.createElement("div");
  var usage = `usage: ${cmd}`;
  if (COMMANDS[cmd].options) {
    const options = COMMANDS[cmd].options.map((o) => `<i>${o}</i>`);
    usage += ` [${options.join('|')}]`;
  }
  const example = 'example: <i>' + COMMANDS[cmd].example + '</i>';
  div.innerHTML = usage;
  div.innerHTML += '<br/>';
  div.innerHTML += example;
  div.innerHTML += '<br/>';
  return div;
}

function who() {
  const div = document.createElement("div");
  div.innerHTML = `My name is Luke Holland and I am a Software Developer and a student! <br/><br/>
  I'm a 4th year student at the University of Glasgow studying Software Engineering. <br/>
  Not only am I a student but I work at the University as a developer at the Glasgow University Software Service (GUSS). <br/>
  Primarily I have worked on web development at GUSS working with React for frontent and Express for backend additionally <br/>
  as a full stack developer I've also worked with setting up CI/CD pipelines to automate the deployment of code. <br/>
  Once I graduate I will be joining Barclays on their Graduate program in August, where I look to start my professional <br/>
  career as a Software Developer/Engineer.<br/>`
  return div;
}

function help() {
  const div = document.createElement("div");
  const cmds = Object.keys(COMMANDS);
  for (var i = 0; i < cmds.length; i++) {
    div.innerHTML += `${cmds[i]}`
    const innerDiv = usage(cmds[i]);
    innerDiv.className = 'indent';
    innerDiv.innerHTML = `<i>${COMMANDS[cmds[i]].desc}</i><br/>` + innerDiv.innerHTML
    div.appendChild(innerDiv);
  }
  return div;
}

function clear() {
  document.getElementById('main').innerHTML = '';
}

function theme(name = []) {
  name = name.join(' ');
  if (name === '' || !(COMMANDS.theme.options.includes(name.toLowerCase()))) {
    return usage('theme');
  }
  localStorage.setItem('theme', name.toLowerCase());
  document.documentElement.setAttribute('data-theme', name.toLowerCase());
  if (name.toLowerCase() === 'matrix') {
    const div = document.createElement("div");
    div.innerHTML = 'Credit for the Matrix backdrop goes to <a href="https://codepen.io/wefiy">wefiy</a> on Codepen.<br/>';
    return div;
  }
}

function projects() {
  const div = document.createElement("div");
  for (let i = 0; i < PROJECTS.length; i++) {
    div.innerHTML += `<b>${PROJECTS[i].name}</b><br/>`;
    div.innerHTML += `${PROJECTS[i].desc}<br/>`;
    div.innerHTML += `[${PROJECTS[i].tech.join('|')}]<br/>`
    var links = []
    if (PROJECTS[i].url) {
      links.push(`<a href="${PROJECTS[i].url}" target="_blank">Website</a>`);
    }
    if (PROJECTS[i].source) {
      links.push(`<a href="${PROJECTS[i].source}" target="_blank">Source Code</a>`);
    }
    if (links) {
      div.innerHTML += links.join('|') + '<br/>'
    }
    if (i + 1 !== PROJECTS.length) {
      div.appendChild(document.createElement('br'));
    }
  }
  div.innerHTML += '<br/>See more of my projects at my <a href="https://github.com/AmazonPriime" target="_blank">Github</a>!<br/>'
  return div;
}
