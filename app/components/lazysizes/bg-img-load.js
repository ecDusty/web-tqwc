document.addEventListener('lazybeforeunveil', (e) => {
	const bg = e.target.getAttribute('data-bg');
	if (bg) {
		e.target.style.backgroundImage = `url(${bg})`;
	}
});
