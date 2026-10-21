/* Loads the single shared footer include on every page. */
(() => {
  const mount = document.querySelector('[data-shared-footer]');
  if (!mount) return;

  const pageDepth = location.pathname.includes('/pages/') ? '../' : '';
  const links = {
    home: `${pageDepth}index.html`,
    year: `${pageDepth}pages/year.html`,
    semester: `${pageDepth}pages/semester.html`,
    major: `${pageDepth}pages/major.html`,
    cs: `${pageDepth}pages/cs.html`
  };

  fetch(`${pageDepth}components/footer.html`)
    .then((response) => {
      if (!response.ok) throw new Error('Footer include could not be loaded.');
      return response.text();
    })
    .then((html) => {
      mount.innerHTML = html.replace(/\{\{(home|year|semester|major|cs)\}\}/g, (_, key) => links[key]);
      if (mount.hasAttribute('data-landing-footer')) {
        const copyright = mount.querySelector('.footer-bottom');
        if (copyright) copyright.textContent = '© 2026 Kunotes, made by Subhadeep Paul';
      }
    })
    .catch(() => {
      mount.innerHTML = `<footer class="site-footer"><div class="footer-inner wrap"><div class="footer-main"><div class="footer-brand"><a class="footer-wordmark" href="${links.home}">Kunotes<span>.</span></a><p>Made by Subhadeep Paul</p><p>A growing digital study space</p></div><nav class="footer-navigation" aria-label="Footer navigation"><a href="${links.home}">Home</a><a href="${links.year}">1st Year</a><a href="${links.semester}">1st Semester</a><a href="${links.major}">Major</a><a href="${links.cs}">CS</a></nav><div class="footer-support"><p class="support-question">Finding Kunotes helpful?</p><p>Support the project by following me on Instagram.</p><a href="https://instagram.com/subhadeeppaulv" target="_blank" rel="noopener noreferrer">@subhadeeppaulv <span aria-hidden="true">↗</span></a></div></div><div class="footer-bottom"><span>© 2026 Kunotes</span><span>A growing digital study space</span></div></div></footer>`;
    });
})();
