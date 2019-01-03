
/* Game namespace */
var game = {

	// an object where to store game information
	data : {
		// score
		score : 0
	},

    // Run on page load.
    "onload" : function () {
        // Initialize the video.
        if (!me.video.init(640, 480, {wrapper : "screen", scale : "auto", scaleMethod : "flex-width"})) {
            alert("Your browser does not support HTML5 canvas.");
            return;
        }

        // Initialize the audio.
        me.audio.init("mp3,ogg");

		// set all ressources to be loaded
        me.loader.preload(game.resources, this.loaded.bind(this));
    },



    // Run on game resources loaded.
    "loaded" : function () {
        me.state.set(me.state.MENU, new game.TitleScreen());
        me.state.set(me.state.PLAY, new game.PlayScreen());
				me.state.set(me.state.GAMEOVER, new game.GameOverScreen());

				// add our player entity in the entity pool
				me.pool.register("mainPlayer", game.PlayerEntity);
				me.pool.register("CoinEntity", game.CoinEntity);
				me.pool.register("EnemyEntity", game.EnemyEntity);
				me.pool.register("TempEntity", game.TempEntity);

				me.pool.register("LevelEntity", game.LevelEntity);

				// enable the keyboard
				me.input.bindKey(me.input.KEY.LEFT,		"left");
				me.input.bindKey(me.input.KEY.RIGHT,	"right");
				// map X, Up Arrow for jump
				me.input.bindKey(me.input.KEY.X,		"jump", true);
				me.input.bindKey(me.input.KEY.UP,		"jump", true);
				// space for counter move
				me.input.bindKey(me.input.KEY.SPACE,	"counter", true);

		    // // Start the game.
		    // me.state.change(me.state.PLAY);

				// go to the title menu, then start play
				me.state.change(me.state.MENU);
    }
};
