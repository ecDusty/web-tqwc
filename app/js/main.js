/* globals */
/**
 * Imported features
 */

// Lazyload (npm install lazysizes)
import 'lazysizes';
import '../components/lazysizes/bg-img-load';

// Swiper (npm install swiper)
// import 'swiper/js/swiper';

/**
 * Build Components
 */
import '../components/home-page/skills';

// Main Scripts
setTimeout(() => {
	document.querySelector('body').classList.add('js--page-loaded');
}, 1000);
