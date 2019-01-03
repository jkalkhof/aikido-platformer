game.PlayScreen = me.ScreenObject.extend({
	/**
	 *  action to perform on state change
	 */
	onResetEvent: function() {

		// load a level
		//me.levelDirector.loadLevel("area01");
		me.levelDirector.loadLevel("aikidomap1");

		// reset the score
		game.data.score = 0;

		// add our HUD to the game world
		this.HUD = new game.HUD.Container();
		me.game.world.addChild(this.HUD);

		// volume.clamp is not a function! bug in melonjs 6.1
		//me.audio.play("Shinrin-Yoku", true, null, 0.5);
		me.audio.play("Shinrin-Yoku", true);

	},


	/**
	 *  action to perform when leaving this screen (state change)
	 */
	onDestroyEvent: function() {
		// remove the HUD from the game world
		me.game.world.removeChild(this.HUD);
	}
});
