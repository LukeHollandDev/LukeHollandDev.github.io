const themes = ['dark','light'];

function setTheme(theme) {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  document.getElementById('theme').innerHTML = theme;
}

function changeTheme() {
  let theme = localStorage.getItem('theme');
  const index = themes.indexOf(theme);
  if (index + 1 < themes.length)
    theme = themes[index + 1];
  else
    theme = themes[0];
  setTheme(theme)
}

function detectTheme() {
  const themeStored = localStorage.getItem('theme');
  var theme = 'dark';

  if (themeStored) {
    const themeIndex = themes.indexOf(themeStored);
    if (themeIndex > -1) {
      theme = themeStored;
    }
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    theme = 'light'
  }

  setTheme(theme)
}

detectTheme()
