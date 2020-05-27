const ladyWrap = document.querySelector('.js-drill-lady');
const scrollIndicator = document.querySelector('.Index-page-scroll-indicator');

if (ladyWrap && scrollIndicator) {
	scrollIndicator.innerHtml = '';
	scrollIndicator.appendChild(ladyWrap);
}
