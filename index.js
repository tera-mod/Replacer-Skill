module.exports = function ReplacerSkill(mod) {
	const GAME = mod.game
	let SKILLS = reloadModule('./skills.js')
	let Enabled = true
	
	let job = -1
	
	mod.command.add("rs", () => {
		Enabled = !Enabled
		mod.command.message("Enabled " + Enabled)
	})
	
	mod.command.add("reload", () => {
		SKILLS = reloadModule('./skills.js')
	})
	
	GAME.on('enter_game', () => {
		job = (GAME.me.templateId - 10101) % 100
	})
	
	GAME.on('leave_game', () => {
		job = -1
	})
	
	mod.hook('C_START_SKILL', 7, { order: -100 }, event => {
		if (!Enabled) return
		var replaceSkill = SKILLS.find(obj => obj.job==job && obj.group==Math.floor(event.skill.id/10000))
		if (!replaceSkill || !replaceSkill.enabled) return
		
		if (replaceSkill.instance) {
			event.skill.id = replaceSkill.replace
			StartInstanceSkill(event)
			return false
		} else {
			event.skill.id = replaceSkill.replace
			return true
		}
	})
	
	function StartInstanceSkill(event) {
		mod.send('C_START_INSTANCE_SKILL', 7, {
			skill:     event.skill,
			loc:       event.loc,
			w:         event.w,
			continue:  event.continue,
			targets:   [{arrowId: 0, gameId: event.target, hitCylinderId: 0}],
			endpoints: [event.dest]
		})
	}
	
	function reloadModule(fileName) {
		delete require.cache[require.resolve(fileName)]
		console.log('Replacer-Skill: Reloading ' + fileName)
		return require(fileName)
	}
	
}
