// Recaptcha Appears after input interaction function
const newsletterFormBody = document.querySelector('footer form.newsletter-form .newsletter-form-body');
const reCaptcha = newsletterFormBody.querySelector('div.captcha-container');
const inputs = newsletterFormBody.querySelectorAll('.newsletter-form-field-element');
if (newsletterFormBody && reCaptcha && inputs[0]) {
	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener('focus', () => {
			reCaptcha.style.height = '144px';
			newsletterFormBody.style.marginBottom = '144px';
		});
	}
}
