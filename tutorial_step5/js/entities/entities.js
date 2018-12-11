/**
 * Player Entity
 */
game.PlayerEntity = me.Entity.extend( {
    /**
     * constructor
     */
    init:function (x, y, settings) {
        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);

        // max walking & jumping speed
        this.body.setMaxVelocity(3, 15);
        this.body.setFriction(0.4, 0);

        // set the display to follow our position on both axis
        me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH, 0.4);

        // ensure the player is updated even when outside of the viewport
        this.alwaysUpdate = true;

        // https://melonjs.github.io/melonJS/docs/me.video.html#renderer
        // https://melonjs.github.io/melonJS/docs/me.CanvasRenderer.html
        // https://melonjs.github.io/melonJS/docs/me.CanvasRenderer.Texture.html
        var texture =  new me.video.renderer.Texture(
            //{ framewidth: 47, frameheight: 48 },
            { framewidth: 50, frameheight: 50 },
            me.loader.getImage("walk-right-yellow2")
        );

        this.renderable = texture.createAnimationFromName([0,1,2,3,4,5,6,7,8,9]);

        // add the coin sprite as renderable for the entity
        //this.renderable = game.texture.createSpriteFromName("walk-right-yellow2.png");
        // this.renderable = texture.createSpriteFromName("walk-right-yellow2.png");

        // define a basic walking animation (using all frames)
        this.renderable.addAnimation("walk",  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        // define a standing animation (using the first frame)
        this.renderable.addAnimation("stand",  [0]);
        // set the standing animation as default
        this.renderable.setCurrentAnimation("stand");

        // set the renderable position to bottom center
        // this.anchorPoint.set(0.5, 0.5);
        this.anchorPoint.set(0,0);
        this.renderable.anchorPoint.set(0,0);

        this.mergedAnimationMode = false;
        this.proximityRangeActive = false;
        this.counterMode = false;
    },

    /**
     * update the entity
     */
    update : function (dt) {

        if (this.mergedAnimationMode) {
          return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
        }

     		if (me.input.isKeyPressed('left'))
     		{
     			// flip the sprite on horizontal axis
     			this.renderable.flipX(true);
     			// update the default force
     			this.body.force.x = -this.body.maxVel.x;
     			// change to the walking animation
                 if (!this.renderable.isCurrentAnimation("walk")) {
                     this.renderable.setCurrentAnimation("walk");
                 }
     		}
     		else if (me.input.isKeyPressed('right'))
     		{
     			// unflip the sprite
     			this.renderable.flipX(false);
     			// update the entity velocity
     			this.body.force.x = this.body.maxVel.x;
                 // change to the walking animation
                 if (!this.renderable.isCurrentAnimation("walk")) {
                     this.renderable.setCurrentAnimation("walk");
                 }
     		}
     		else
     		{
     			this.body.force.x = 0;
                 // change to the standing animation
                 this.renderable.setCurrentAnimation("stand");
     		}

     		if (me.input.isKeyPressed('jump'))
     		{
     			if (!this.body.jumping && !this.body.falling)
     			{
     				// set current vel to the maximum defined value
     				// gravity will then do the rest
     				this.body.force.y = -this.body.maxVel.y
     			}
     		}
         else
         {
             this.body.force.y = 0;
         }

         if (me.input.isKeyPressed("counter") && this.proximityRangeActive)
         {
           console.log("PlayerEntity: Update - counter pressed when proximityRangeActive!");
           this.counterMode = true;
         }

        // apply physics to the body (this moves the entity)
        this.body.update(dt);

         // handle collisions against other shapes
         me.collision.check(this);

         // return true if we moved or if the renderable was updated
         return (this._super(me.Entity, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
 	},


    /**
     * colision handler
     */
    onCollision : function (response, other) {
        switch (response.b.body.collisionType) {
            case me.collision.types.WORLD_SHAPE:
                // Simulate a platform object
                if (other.type === "platform") {
                    if (this.body.falling &&
                        !me.input.isKeyPressed('down') &&
                        // Shortest overlap would move the player upward
                        (response.overlapV.y > 0) &&
                        // The velocity is reasonably fast enough to have penetrated to the overlap depth
                        (~~this.body.vel.y >= ~~response.overlapV.y)
                    ) {
                        // Disable collision on the x axis
                        response.overlapV.x = 0;
                        // Repond to the platform (it is solid)
                        return true;
                    }
                    // Do not respond to the platform (pass through)
                    return false;
                }
                break;

            case me.collision.types.ENEMY_OBJECT:
                // check the overlap Vector
                // https://melonjs.github.io/melonJS/docs/me.collision.html#response
                if ((response.overlapV.y>0) && !this.body.jumping) {
                    // bounce (force jump)
                    this.body.falling = false;
                    this.body.vel.y = -this.body.maxVel.y * me.timer.tick;
                    // set the jumping flag
                    this.body.jumping = true;
                }
                else {
                    // turn on proximity alert where player can counter EnemyEntity
                    // by pressing counter button (spacebar)
                    if (!this.mergedAnimationMode) {
                        this.proximityRangeActive = true;

                        // let's flicker in case we touched an enemy
                        this.renderable.flicker(750, (function () {
                            console.log("PlayerEntity: disable flicker");
                            // can only counter - counterMode when within proximity range
                            this.proximityRangeActive = false;
                        }).bind(this));
                    }

                    // replace image of enemy and player sprites temporarily,
                    // and use tempEntity instead for merged animation
                    // check the overlap Vector
                    // https://melonjs.github.io/melonJS/docs/me.collision.html#response
                    if (!this.mergedAnimationMode && response.overlapV.x > 20) {
                      console.log("PlayerEntity: Collision: creating TempEntity");

                      // spawn tempEntity here
                      var spawnPos = this.pos;

                      // add student at spawn point
                      settings = {width: 100, height: 50};
                      if (this.counterMode) {
                          settings.currentAnimation = "shomen-ikkyo";
                      } else {
                          settings.currentAnimation = "shomen";
                      }


                      var tempChild = me.game.world.addChild(me.pool.pull("TempEntity",
                        // offset TempEntity from player to align merged animation
                        spawnPos.x - 22,
                        spawnPos.y,
                        settings));

                      // TODO: need callback to destroy enemy if countered
                      if (this.counterMode) {
                        tempChild.setCallback(function(playerEntity, enemyEntity) {
                          console.log("PlayerEntity: got the bad guy!");
                          me.game.world.removeChild(enemyEntity);

                          // offset player to align with position at end of mergedAnimation
                          playerEntity.pos.x += 40;
                        });
                      } else {
                        tempChild.setCallback(function(playerEntity, enemyEntity) {
                          console.log("PlayerEntity: ouch!");
                        });
                      }

                      // reset variables for next encounter
                      this.mergedAnimationMode = true;
                      this.proximityRangeActive = false; // we can no longer counter
                      this.counterMode = false;

                      // turn off movement of EnemyEntity
                      if (response.b.name == "Enemy1") {
                          response.b.setAlive(false);
                          tempChild.setPlayerEntity(response.a);
                          tempChild.setEnemyEntity(response.b);
                      } else if (response.a.name == "Enemy1") {
                          response.a.setAlive(false);
                          tempChild.setPlayerEntity(response.b);
                          tempChild.setEnemyEntity(response.a);

                          // collision from right atlasIndeces
                          tempChild.flipX(true);
                      }

                    }
                }
                return false;
                break;

            default:
                // Do not respond to other objects (e.g. coins)
                return false;
        }

        // Make the object solid
        return true;
    },

    /*
    draw sprite if not using mergedAnimationMode
    */
    draw: function(renderer, region) {
        // renderer.save();

        if (!this.mergedAnimationMode) {
            this._super(me.Entity, "draw", [renderer, region]);
        }

        // renderer.restore();
    },

});


/**
 * Coin Entity
 */
game.CoinEntity = me.CollectableEntity.extend( {
    init: function (x, y, settings) {
        // call the parent constructor
        this._super(me.CollectableEntity, 'init', [x, y , settings]);
    },

    /**
     * colision handler
     */
    onCollision : function (response, other) {
        //avoid further collision and delete it
        this.body.setCollisionMask(me.collision.types.NO_OBJECT);

        me.game.world.removeChild(this);

        return false;
    }
});

/**
 * Enemy Entity
 */
game.EnemyEntity = me.Sprite.extend(
{
    init: function (x, y, settings)
    {
        // save the area size as defined in Tiled
        var width = settings.width;

        // define this here instead of tiled
        // settings.image = "wheelie_right";
        settings.image = "walk-right-blue1";

        // adjust the size setting information to match the sprite size
        // so that the entity object is created with the right size
        settings.framewidth = settings.width = 50;
        settings.frameheight = settings.height = 50;

        // call the parent constructor
        this._super(me.Sprite, 'init', [x, y , settings]);

        // add a physic body
        this.body = new me.Body(this);
        // add a default collision shape
        this.body.addShape(new me.Rect(0, 0, this.width, this.height));
        // configure max speed and friction
        this.body.setMaxVelocity(1, 6);
        this.body.setFriction(0.4, 0);
        // enable physic collision (off by default for basic me.Renderable)
        this.isKinematic = false;

        // set start/end position based on the initial area size
        x = this.pos.x;
        this.startX = x;
        this.pos.x = this.endX = x + width - this.width;
        //this.pos.x  = x + width - this.width;

        // to remember which side we were walking
        this.walkLeft = false;

        this.collisionType = me.collision.types.ENEMY_OBJECT;

        this.name = "Enemy1";

        // make it "alive"
        this.alive = true;

        this.mergedAnimationMode = false;
    },

    // manage the enemy movement
    update : function (dt)
    {
        if (this.alive)
        {
            if (this.walkLeft && this.pos.x <= this.startX)
            {
                this.walkLeft = false;
                this.body.force.x = this.body.maxVel.x;
            }
            else if (!this.walkLeft && this.pos.x >= this.endX)
            {
                this.walkLeft = true;
                this.body.force.x = -this.body.maxVel.x;
            }

            this.flipX(this.walkLeft);
        }
        else
        {
            this.body.force.x = 0;
        }
        // check & update movement
        this.body.update(dt);

        // handle collisions against other shapes
        me.collision.check(this);

        // return true if we moved or if the renderable was updated
        return (this._super(me.Sprite, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
    },

    /**
     * collision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
        if (response.b.body.collisionType !== me.collision.types.WORLD_SHAPE) {
            // res.y >0 means touched by something on the bottom
            // which mean at top position for this one
            if (this.alive && (response.overlapV.y > 0) && response.a.body.falling) {
                //this.renderable.flicker(750);
            }
            return false;
        }
        // Make all other objects solid
        return true;
    },

    setAlive : function(value) {
        console.log("EnemyEntity: setAlive: ", value);
        this.alive = value;

        if (this.alive) {
          if (this.walkLeft) {
              this.body.force.x = -this.body.maxVel.x;
          } else {
              this.body.force.x = this.body.maxVel.x;
          }
          this.mergedAnimationMode = false;
        } else {
            this.mergedAnimationMode = true;
        }


    },

    /*
    draw sprite if not using mergedAnimationMode
    */
    draw: function(renderer, region) {
        // renderer.save();

        if (!this.mergedAnimationMode) {
            this._super(me.Sprite, "draw", [renderer, region]);
        }

        // renderer.restore();
    },
});

/*
  * TempEntity - for combined animations of PlayerEntity and EnemyEntity
*/
game.TempEntity = me.Sprite.extend(
{
    init: function (x, y, settings)
    {
        console.log("TempEntity: init: x:",x," y:",y);

        // save the area size as defined in Tiled
        var width = settings.width;

        // https://melonjs.github.io/melonJS/docs/me.CanvasRenderer.Texture.html
        // create a texture atlas from a JSON Object
        // var texture = new me.video.renderer.Texture(
        //     me.loader.getJSON("aikido-animations2"),
        //     me.loader.getImage("aikido-animations2")
        // );

        var texture = new me.video.renderer.Texture(
            me.loader.getJSON("aikido-animations3"),
            me.loader.getImage("aikido-animations3")
        );

        // if we were using a sprite instead of an Entity object
        settings.image = texture;

        // adjust the size setting information to match the sprite size
        // so that the entity object is created with the right size
        settings.framewidth = settings.width = 100; //50;
        settings.frameheight = settings.height = 50;


        // https://melonjs.github.io/melonJS/docs/me.Sprite.html#addAnimation
        // https://melonjs.github.io/melonJS/docs/me.CanvasRenderer.Texture.html
        // create a temp sprite with atlas, atlasIndices
        this.renderable = texture.createAnimationFromName([
            "shomen-displacement0000",
            "shomen-displacement0001",
            "shomen-displacement0002",
            "shomen-displacement0003",
            "shomen-displacement0004",
            "shomen-displacement0005",
            "shomen-displacement0006",
            "shomen-displacement0007",
            "shomen-ikkyo0000",
            "shomen-ikkyo0001",
            "shomen-ikkyo0002",
            "shomen-ikkyo0003",
            "shomen-ikkyo0004",
            "shomen-ikkyo0005",
            "shomen-ikkyo0006",
            "shomen-ikkyo0007",
            "shomen-ikkyo0008",
            "shomen-ikkyo0009",
            "shomen-ikkyo0010",
            "shomen-ikkyo0011",
            "shomen-ikkyo0012",
            "shomen-ikkyo0013",
        ]);

        // copy atlas and atlasIndeces into settings for our new sprite
        settings.atlas = this.renderable.textureAtlas;
        settings.atlasIndices = this.renderable.atlasIndices;

        // call the parent constructor
        // me.Renderable -> me.Sprite
        this._super(me.Sprite, 'init', [x, y , settings]);

        // change the sprite region - done automatically when using textureAtlas
        // this.setRegion(texture.getRegion("shomen-displacement0000"));

        // me.CanvasRenderer.Texture
        // string parameters for addAnimation are not allowed for standard spritesheet based Texture
        // need to use texture atlas!
        this.addAnimation ("shomen", [
          "shomen-displacement0000",
          "shomen-displacement0001",
          "shomen-displacement0002",
          "shomen-displacement0003",
          "shomen-displacement0004",
          "shomen-displacement0005",
          "shomen-displacement0006",
          "shomen-displacement0007",
        ]);

        this.addAnimation ("shomen-ikkyo", [
          "shomen-ikkyo0000",
          "shomen-ikkyo0001",
          "shomen-ikkyo0002",
          "shomen-ikkyo0003",
          "shomen-ikkyo0004",
          "shomen-ikkyo0005",
          "shomen-ikkyo0006",
          "shomen-ikkyo0007",
          "shomen-ikkyo0008",
          "shomen-ikkyo0009",
          "shomen-ikkyo0010",
          "shomen-ikkyo0011",
          "shomen-ikkyo0012",
          "shomen-ikkyo0013",
        ]);

        // for testing - continuous animation
        // this.setCurrentAnimation("shomen");

        this.playerEntity = null;
        this.enemyEntity = null;

        // only animate once
        // set animation, and remove the object when finished
        // restore playerEntity, enemyEntity when finished

        if (typeof settings.currentAnimation === "undefined") {
          settings.currentAnimation = "shomen-ikkyo";
        }

        this.setCurrentAnimation(settings.currentAnimation, (function () {
           me.game.world.removeChild(this);

            console.log("TempEntity: animation ended");

           // enable PlayerEntity, EnemyEntity which were disabled for the animations
           if (this.playerEntity != null) {
             this.playerEntity.mergedAnimationMode = false;
           } else {
             console.log("TempEntity: animation ended - playerEntity missing!");
           }

           if (this.enemyEntity != null) {
             this.enemyEntity.setAlive(true);
           } else {
             console.log("TempEntity: animation ended - enemyEntity missing!");
           }

           if (this.callback != null) {
             this.callback(this.playerEntity, this.enemyEntity);
           }

           return false; // do not reset to first frame
        }).bind(this));

        // add a physic body
        this.body = new me.Body(this);
        // add a default collision shape
        this.body.addShape(new me.Rect(0, 0, this.width, this.height));
        // configure max speed and friction
        this.body.setMaxVelocity(1, 6);
        this.body.setFriction(0.4, 0);

        // enable physic collision (off by default for basic me.Renderable)
        this.isKinematic = false;

        // set the renderable position to bottom center
        // this.anchorPoint.set(0.5, 0.5);
        this.anchorPoint.set(0,0);
        this.renderable.anchorPoint.set(0,0);

        // set start/end position based on the initial area size
        x = this.pos.x;
        this.startX = x;

        // to remember which side we were walking
        this.walkLeft = false;

        // make it "alive"
        this.alive = true;

        this.collisionType = me.collision.types.NO_OBJECT;

        // enable this, since the entity starts off the viewport
        this.alwaysUpdate = true;

        // initially no callback
        this.callback = null;
    },

    // for restoring playerEntity after animation
    setPlayerEntity: function (obj)
    {
        console.log("TempEntity: setPlayerEntity: ",obj.name);
        this.playerEntity = obj;
    },

    // for restoring enemyEntity after animation
    setEnemyEntity: function (obj)
    {
        console.log("TempEntity: setEnemyEntity: ",obj.name);
        this.enemyEntity = obj;
    },

    setCallback : function (fn) {
        if (typeof(fn) !== "function") {
            throw new me.ObservableVector2d.Error(
                "invalid callback"
            );
        }
        this.callback = fn;
        return this;
    },

  });
