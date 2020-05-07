
const skillBG = {
	el: document.querySelector('.js--skills-item-bg'),
	width: 0
};
const allSkills = document.querySelectorAll('.js--js--skills-item');
const time = 3000;

let count = 0;
let run = 0;

function runSkills(Skills, tick) {
	const skill = {
		act: Skills[count],
		deact: null
	};


	skill.act.classList.remove('Skills__Item--active');
	skill.act.classList.remove('Skills__Item--deactive');

	if (run !== 0 || run === 0 && count > 0) {
		skill.deact = count === 0 ? Skills[Skills.length - 1] : Skills[count - 1];
		skill.deact.classList.add('Skills__Item--deactive');
	}
	const width = skill.act.offsetWidth - skillBG.width < 0 ? 0
		: skill.act.offsetWidth - skillBG.width;

	skill.act.classList.add('Skills__Item--active');

	skillBG.el.style.paddingRight = `${width}px`;


	count = Skills.length === (count + 1) ? 0 : count + 1;
	run = Skills.length === (count + 1) ? run + 1 : run;

	setTimeout(() => { runSkills(Skills, tick); }, tick);
}

if (allSkills.length > 0) {
	skillBG.width = skillBG.el.offsetWidth;
	runSkills(allSkills, time);
}
