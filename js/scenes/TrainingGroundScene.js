/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

/**
 * Training ground scene — single-player and multiplayer co-op.
 * Owns all per-session state (droid pool, kills, camera shake, MP state).
 * Persistent training config (enabledDroidTypes, trainingTargetDroids, etc.)
 * lives on SceneManager so the UI controls in GameEngine.js keep working.
 *
 * @param {SceneManager2} sm
 * @param {boolean} multiplayer     true when started via startMultiplayerTrainingScene()
 * @param {boolean} bossVsZerlin   true for local adversarial Boss Battle mode
 */
class TrainingGroundScene {
  constructor(sm, multiplayer, bossVsZerlin) {
    this.sm = sm;
    this.game = sm.game;

    // ── Session-local state ──────────────────────────────────────────────
    this.levelSceneTimer = 0;
    this.initiallyPaused = false;
    this.startedFinalOverlay = false;
    this.startNewScene = false;
    this.stopLevelTime = 0;

    this.trainingKills = 0;
    this.trainingSpawnTimer = 0;
    this.trainingPrevHealth = sm.Zerlin.currentHealth;

    this.powerupRespawnQueue = [];
    this.cameraShakeTimer = 0;
    this.cameraShakeIntensity = 0;

    // Droid pool: pull from the level (already set() in startTrainingGroundScene)
    this.trainingDroidPool = sm.level.unspawnedDroids.filter(
      d => sm.enabledDroidTypes.has(d.constructor.name)
    );
    sm.level.unspawnedDroids = [];

    // Snow overlay for Hoth background
    this.sceneEntities = [];
    if (sm.trainingBgIndex === 2) {
      this.sceneEntities.push(new ParallaxSnowBackground(this.game, this.sm, 300));
      this.sceneEntities.push(new ParallaxSnowBackground(this.game, this.sm, 200));
      this.sceneEntities.push(new ParallaxSnowBackground(this.game, this.sm, 100));
    }

    // ── Boss Battle state ────────────────────────────────────────────────
    this.bossVsZerlin = !!bossVsZerlin;
    this.playableBoss = null;

    if (this.bossVsZerlin) {
      // No droids in adversarial mode — empty pool prevents spawning
      this.trainingDroidPool = [];
      sm.level.unspawnedDroids = [];

      // Spawn playable boss in upper-right area of the visible arena
      var bossSpawnX = this.game.surfaceWidth * 0.68;
      var bossSpawnY = 200;
      this.playableBoss = new PlayableBoss(this.game, bossSpawnX, bossSpawnY);
      this.playableBoss.infiniteHealth = sm.infiniteHealth;
      sm.boss = this.playableBoss;

      // Health bar in the top-right (same position as P2 Zerlin bars)
      var barLength = this.game.surfaceWidth * Constants.StatusBarConstants.STATUS_BAR_LENGTH;
      var bossBarX = this.game.surfaceWidth - barLength - 25;
      sm.addEntity(new BossPlayerHealthBar(this.game, sm, bossBarX, 25, this.playableBoss));
    }

    // ── Multiplayer state ────────────────────────────────────────────────
    this.multiplayerActive = multiplayer;
    sm.multiplayerActive = multiplayer;  // expose on SceneManager for Camera + CollisionManager
    this.Zerlin2 = null;
    this.pendingSnapshot = null;
    this.lastP1State = null;
    this.networkSnapshotTimer = 0;
    this._mpRestartPending = false;
    this._mpRestartReadyToExecute = false;
    this._mpRestartTimer = null;
    this._prevP1Space = false;
    this._prevP2Space = false;
    // Mode-switch flags (boss ↔ team toggle)
    this._pendingBossMode = false;
    this._pendingTeamMode = false;
    this._bossModeReadyToExecute = false;
    this._teamModeReadyToExecute = false;
    this._clientRequestModeSwitch = false;
    // Infinite health sync: client sets this, host reads it in sendInput
    this._clientRequestInfiniteHealthToggle = false;
    this._prevInfiniteHealthToggle = false; // edge-trigger: only fire on false→true

    if (multiplayer) {
      if (!this.bossVsZerlin) {
        // Co-op mode: create Zerlin2 as P2's character
        this.Zerlin2 = new Zerlin2(this.game, sm.camera, sm);
        sm.Zerlin2 = this.Zerlin2;
        this.Zerlin2.maxHealth = 15;
        this.Zerlin2.maxForce  = 15;
        this.Zerlin2.setHealth();

        // Apply infinite health toggle to P2 as well
        this.Zerlin2.infiniteHealth = sm.infiniteHealth;
        // P2 saber color defaults to the client's game.saberHue (updated via input after connect)
        this.Zerlin2.saberHue = this.game.saberHue || 240;

        // Spawn P2 on the floor immediately instead of falling from y=0
        this._snapToFloor(this.Zerlin2, sm.level.tiles);

        // P2 status bars — mirrored to top-right
        var barLength = this.game.surfaceWidth * Constants.StatusBarConstants.STATUS_BAR_LENGTH;
        var p2BarX = this.game.surfaceWidth - barLength - 25;
        sm.addEntity(new HealthStatusBarP2(this.game, sm, p2BarX, 25));
        sm.addEntity(new ForceStatusBarP2(this.game, sm, p2BarX, 50));
      }

      // Both co-op and boss-battle modes need state-received callback on client
      if (!this.game.network.isHost) {
        this.game.network.onStateReceived = (snap) => {
          this.pendingSnapshot = snap;
          this.lastP1State = snap.p1;
          if (sm.Zerlin && sm.Zerlin.lightsaber && !sm.Zerlin.lightsaber.ghost) {
            sm.Zerlin.lightsaber.ghost = true;
          }
        };
      }
    }
  }

  // ── Update ───────────────────────────────────────────────────────────────

  update() {
    this.levelSceneTimer += this.game.clockTick;
    this.sm.musicMenu.update();

    if (!this.sm.paused) {
      // ── Player update ──────────────────────────────────────────────────
      if (this.multiplayerActive && !this.game.network.isHost) {
        // Client: run P1 with neutral input so physics work, then override from snapshot
        var _sk = this.game.keys; var _sm = this.game.mouse;
        var _sc = this.game.click; var _src = this.game.rightClickDown;
        var fakeKeys = {};
        if (this.lastP1State) {
          var d = this.lastP1State.direction;
          if (d === 1)  fakeKeys['KeyD'] = true;
          if (d === -1) fakeKeys['KeyA'] = true;
        }
        this.game.keys = fakeKeys;
        this.game.mouse = { x: this.sm.Zerlin.x - this.sm.camera.x, y: this.sm.Zerlin.y };
        this.game.click = null;
        this.game.rightClickDown = false;
        this.sm.Zerlin.update();
        this.game.keys = _sk; this.game.mouse = _sm;
        this.game.click = _sc; this.game.rightClickDown = _src;

        if (this.lastP1State) {
          var s = this.lastP1State;
          if (s.facingRight) this.sm.Zerlin.faceRight(); else this.sm.Zerlin.faceLeft();
          this.sm.Zerlin.direction              = s.direction;
          this.sm.Zerlin.falling                = s.falling;
          this.sm.Zerlin.somersaulting          = s.somersaulting          || false;
          this.sm.Zerlin.somersaultingDirection = s.somersaultingDirection  || 0;
          this.sm.Zerlin.slashing               = s.slashing               || false;
          this.sm.Zerlin.slashingDirection      = s.slashingDirection       || 0;
          if (s.slashElapsedTime     !== undefined && this.sm.Zerlin.slashingAnimation)
            this.sm.Zerlin.slashingAnimation.elapsedTime     = s.slashElapsedTime;
          if (s.slashLeftElapsedTime !== undefined && this.sm.Zerlin.slashingLeftAnimation)
            this.sm.Zerlin.slashingLeftAnimation.elapsedTime = s.slashLeftElapsedTime;
          if (s.somersaultElapsedTime !== undefined && this.sm.Zerlin.somersaultingAnimation)
            this.sm.Zerlin.somersaultingAnimation.elapsedTime = s.somersaultElapsedTime;
          this.sm.Zerlin.forceJumping        = s.forceJumping     || false;
          this.sm.Zerlin.forceJumpFinalAnim  = s.forceJumpFinalAnim || false;
          this.sm.Zerlin.forceJumpCharging   = s.forceJumpCharging  || false;
          this.sm.Zerlin.forceJumpChargeTimer = s.forceJumpChargeTimer || 0;
          if (this.sm.Zerlin.forceJumpPreRightAnim && s.forceJumpPreAnimElapsed !== undefined) {
            this.sm.Zerlin.forceJumpPreRightAnim.elapsedTime  = s.forceJumpPreAnimElapsed;
            this.sm.Zerlin.forceJumpPreLeftAnim.elapsedTime   = s.forceJumpPreAnimElapsed;
          }
          if (this.sm.Zerlin.forceJumpFinalRightAnim && s.forceJumpFinalAnimElapsed !== undefined) {
            this.sm.Zerlin.forceJumpFinalRightAnim.elapsedTime = s.forceJumpFinalAnimElapsed;
            this.sm.Zerlin.forceJumpFinalLeftAnim.elapsedTime  = s.forceJumpFinalAnimElapsed;
          }
          this.sm.Zerlin.crouching              = s.crouching               || false;
          if (this.sm.Zerlin.lightsaber) {
            var ls = this.sm.Zerlin.lightsaber;
            ls.setArmSpriteByKey(s.armSpriteKey);
            ls.angle       = s.saberAngle;
            ls.bounceOffset = s.saberBounceOffset || 0;
            ls.hidden      = s.saberHidden || false;
            ls.updateCollisionLine();
            if (s.saberThrowing) {
              if (!ls.airbornSaber) {
                ls.throwing = true;
                ls.airbornSaber = new AirbornSaber(this.game, ls, 0, 0);
              }
              ls.airbornSaber.x = s.airbornX;
              ls.airbornSaber.y = s.airbornY;
            } else {
              if (ls.airbornSaber) ls.catch();
            }
            if (s.orbActive) {
              if (!ls.orb) ls.orb = new LightningOrb(ls);
              ls.orb.powerTimer = s.orbPowerTimer;
              ls.orb.x = ls.x + Math.cos(ls.angle) * ls.throwArmLength;
              ls.orb.y = ls.y + Math.sin(ls.angle) * ls.throwArmLength;
            } else {
              ls.orb = null;
            }
            if (!ls._p2LightningCreated) ls._p2LightningCreated = 0;
            var toCreate = (s.totalLightningFired || 0) - ls._p2LightningCreated;
            if (toCreate < 0) { ls._p2LightningCreated = s.totalLightningFired; toCreate = 0; }
            if (toCreate > 0 && s.lightningStartX) {
              var fakeTarget = {
                x: s.lightningStartX + Math.cos(s.lightningAngle) * 1000 - this.sm.camera.x,
                y: s.lightningStartY + Math.sin(s.lightningAngle) * 1000
              };
              for (var li = 0; li < toCreate; li++) {
                ls.lightning.push(new LightningBolt(this.game, s.lightningStartX, s.lightningStartY, fakeTarget, 1));
              }
              ls._p2LightningCreated = s.totalLightningFired;
            }
          }
        }
      } else {
        this.sm.Zerlin.update();
      }

      // Client: apply snapshot corrections after physics
      if (this.multiplayerActive && !this.game.network.isHost && this.pendingSnapshot) {
        var snap = this.pendingSnapshot;
        this.pendingSnapshot = null;

        if (snap.restartMultiplayer) {
          this.game.audio.endAllSoundFX();
          this.sm.startMultiplayerTrainingScene();
          return;
        }
        if (snap.startBossMode) {
          this.game.audio.endAllSoundFX();
          this.sm.startBossVsZerlinMultiplayerScene();
          return;
        }
        if (snap.startTeamMode) {
          this.game.audio.endAllSoundFX();
          this.sm.startMultiplayerTrainingScene();
          return;
        }

        // Sync infinite health toggle from host
        if (snap.infiniteHealth !== undefined && snap.infiniteHealth !== this.sm.infiniteHealth) {
          this.sm.infiniteHealth = snap.infiniteHealth;
          this.sm.Zerlin.infiniteHealth = snap.infiniteHealth;
          this.sm.Zerlin.setHealth(); // update maxHealth (999999 vs real max); currentHealth overwritten below by snapshot
          if (this.Zerlin2) {
            this.Zerlin2.infiniteHealth = snap.infiniteHealth;
            this.Zerlin2.setHealth();
          }
          if (this.playableBoss) this.playableBoss.infiniteHealth = snap.infiniteHealth;
          var ihBtn = document.getElementById('infiniteHealth');
          if (ihBtn) {
            var on = snap.infiniteHealth;
            ihBtn.value = on ? 'Infinite Health: ON' : 'Infinite Health: OFF';
            ihBtn.style.background = on ? '#cc3300' : '';
            ihBtn.style.color = on ? '#ffffff' : '';
          }
        }
        this._applyPlayerFromSnapshot(this.sm.Zerlin, snap.p1);
        if (this.Zerlin2 && snap.p2) {
          this._applyPlayerFromSnapshot(this.Zerlin2, snap.p2);
        }
        if (this.bossVsZerlin && this.playableBoss && snap.boss) {
          this._applyBossFromSnapshot(this.playableBoss, snap.boss);
        }
        this._applyEntitySnapshot(snap);
        if (snap.kills !== undefined) this.trainingKills = snap.kills;
      }

      if (this.multiplayerActive && this.Zerlin2) {
        this.Zerlin2.update();
        // Host: apply client's chosen saber color to Zerlin2
        var inp = this.game.network.lastReceivedInput;
        if (this.game.network.isHost && inp && inp.saberHue !== undefined) {
          this.Zerlin2.saberHue = inp.saberHue;
        }
      }
      this.sm.camera.update();
      this.sm.level.update();

      // ── Droid spawning (host-authoritative, disabled in Boss Battle mode) ─
      if (!this.bossVsZerlin && (!this.multiplayerActive || this.game.network.isHost)) {
        if (this.trainingDroidPool.length === 0 && this.sm.enabledDroidTypes.size > 0) {
          this.sm.level.set();
          this.trainingDroidPool = this.sm.level.unspawnedDroids.filter(
            d => this.sm.enabledDroidTypes.has(d.constructor.name)
          );
          this.sm.level.unspawnedDroids = [];
          this.sm.level.unspawnedPowerups = [];
        }
        this.trainingSpawnTimer -= this.game.clockTick;
        if (this.trainingSpawnTimer <= 0
            && this.sm.droids.length < this.sm.trainingTargetDroids
            && this.trainingDroidPool.length > 0) {
          this.trainingSpawnTimer = 0.5;
          var spawnedDroid = this.trainingDroidPool.pop();
          spawnedDroid.id = this.sm._nextEntityId++;
          this.sm.droids.push(spawnedDroid);
        }
      }

      // ── Entity update loops ────────────────────────────────────────────
      for (var i = this.sm.droids.length - 1; i >= 0; i--) {
        this.sm.droids[i].update();
        if (this.sm.droids[i].removeFromWorld) {
          this.trainingKills++;
          this.sm.droids.splice(i, 1);
        }
      }
      for (var i = this.sm.lasers.length - 1; i >= 0; i--) {
        this.sm.lasers[i].update();
        if (this.sm.lasers[i].removeFromWorld) {
          this.sm.lasers.splice(i, 1);
        }
      }
      for (var i = this.sm.powerups.length - 1; i >= 0; i--) {
        this.sm.powerups[i].update();
        if (this.sm.powerups[i].removeFromWorld) {
          var pu = this.sm.powerups[i];
          if (pu.wasPickedUp) {
            this.powerupRespawnQueue.push({
              type: pu.constructor.name,
              x: pu.x,
              y: pu.startY,
              respawnAt: this.levelSceneTimer + smc.POWERUP_RESPAWN_DELAY,
            });
          }
          this.sm.powerups.splice(i, 1);
        }
      }

      for (var i = this.powerupRespawnQueue.length - 1; i >= 0; i--) {
        if (this.levelSceneTimer >= this.powerupRespawnQueue[i].respawnAt) {
          var entry = this.powerupRespawnQueue[i];
          var respawned = this._createTrainingPowerup(entry.type, entry.x, entry.y);
          if (respawned) this.sm.powerups.push(respawned);
          this.powerupRespawnQueue.splice(i, 1);
        }
      }

      for (var i = this.sm.activePowerups.length - 1; i >= 0; i--) {
        this.sm.activePowerups[i].update(i);
        if (this.sm.activePowerups[i].removeFromWorld) {
          this.sm.activePowerups.splice(i, 1);
        }
      }
      for (var i = this.sm.otherEntities.length - 1; i >= 0; i--) {
        this.sm.otherEntities[i].update();
        if (this.sm.otherEntities[i].removeFromWorld) {
          this.sm.otherEntities.splice(i, 1);
        }
      }

      // ── Playable Boss update (Boss Battle mode only) ───────────────────
      if (this.bossVsZerlin && this.playableBoss) {
        this.playableBoss.update();
      }

      this.sm.collisionManager.handleCollisions();

      // ── Camera shake on hit ────────────────────────────────────────────
      var zc = Constants.ZerlinConstants;
      if (this.sm.Zerlin.currentHealth < this.trainingPrevHealth) {
        this.cameraShakeTimer = zc.HIT_SHAKE_DURATION;
        this.cameraShakeIntensity = zc.HIT_SHAKE_INTENSITY;
      }
      this.trainingPrevHealth = this.sm.Zerlin.currentHealth;
      if (this.cameraShakeTimer > 0) {
        this.cameraShakeTimer -= this.game.clockTick;
        if (this.cameraShakeTimer < 0) this.cameraShakeTimer = 0;
      }

      for (let i = this.sceneEntities.length - 1; i >= 0; i--) {
        this.sceneEntities[i].update();
        if (this.sceneEntities[i].removeFromWorld) {
          this.sceneEntities.splice(i, 1);
        }
      }

      // ── Networking ─────────────────────────────────────────────────────
      if (this.multiplayerActive) {
        if (this.game.network.isHost) {
          // Check for mode-switch request from client
          var hostInp = this.game.network.lastReceivedInput;
          if (hostInp && hostInp.requestModeSwitch) {
            if (this.bossVsZerlin) {
              this._pendingTeamMode = true;
            } else {
              this._pendingBossMode = true;
            }
          }
          var inpToggle = !!(hostInp && hostInp.requestInfiniteHealthToggle);
          if (inpToggle && !this._prevInfiniteHealthToggle) {
            this.sm.toggleInfiniteHealth();
            // Update P1's button UI (P2 triggered this; P1's button wasn't clicked directly)
            var ihBtn = document.getElementById('infiniteHealth');
            if (ihBtn) {
              var on = this.sm.infiniteHealth;
              ihBtn.value = on ? 'Infinite Health: ON' : 'Infinite Health: OFF';
              ihBtn.style.background = on ? '#cc3300' : '';
              ihBtn.style.color = on ? '#ffffff' : '';
            }
          }
          this._prevInfiniteHealthToggle = inpToggle;

          this.networkSnapshotTimer -= this.game.clockTick;
          if (this.networkSnapshotTimer <= 0) {
            this.networkSnapshotTimer = 1 / 20;
            this.game.network.sendGameState(this._buildPlayerSnapshot());
            if (this._mpRestartReadyToExecute) {
              this.game.audio.endAllSoundFX();
              this.sm.startMultiplayerTrainingScene();
              return;
            }
            if (this._bossModeReadyToExecute) {
              this.game.audio.endAllSoundFX();
              this.sm.startBossVsZerlinMultiplayerScene();
              return;
            }
            if (this._teamModeReadyToExecute) {
              this.game.audio.endAllSoundFX();
              this.sm.startMultiplayerTrainingScene();
              return;
            }
          }
        } else {
          this.game.network.sendInput({
            keys:           this.game.keys,
            mouseX:         this.game.mouse ? this.game.mouse.x : 0,
            mouseY:         this.game.mouse ? this.game.mouse.y : 0,
            click:          !!this.game.click,
            rightClickDown: this.game.rightClickDown || false,
            saberHue:       this.Zerlin2 ? this.Zerlin2.saberHue : this.game.saberHue,
            requestModeSwitch: this._clientRequestModeSwitch,
            requestInfiniteHealthToggle: this._clientRequestInfiniteHealthToggle,
          });
          this._clientRequestModeSwitch = false;
          this._clientRequestInfiniteHealthToggle = false;
        }
      }
    }

    if (!this.initiallyPaused && this.levelSceneTimer > smc.PAUSE_TIME_AFTER_START_LEVEL) {
      this.initiallyPaused = true;
      this.sm.canPause = true;
    }

    // ── Death / revive / restart logic ────────────────────────────────────
    if (this.multiplayerActive && this.Zerlin2) {
      this._updateMultiplayerDeath();  // co-op: Z1 + Z2
    } else if (this.bossVsZerlin) {
      this._updateBossVsZerlinDeath(); // boss battle (local or MP)
    } else {
      if (!this.startedFinalOverlay && !this.sm.Zerlin.alive) {
        this.sm.canPause = false;
        if (this.levelSceneTimer > this.sm.Zerlin.timeOfDeath + this.sm.Zerlin.deathAnimation.totalTime) {
          this.startedFinalOverlay = true;
          this.stopLevelTime = this.levelSceneTimer + 1.5;
          this.startNewScene = true;
        }
      }
      if ((this.levelSceneTimer > this.stopLevelTime && this.startNewScene)
       || (!this.sm.Zerlin.alive && this.game.keys['Enter'])) {
        this.game.audio.endAllSoundFX();
        this.sm.startTrainingGroundScene();
        this.startNewScene = false;
      }
    }
  }

  // ── Draw ─────────────────────────────────────────────────────────────────

  draw() {
    var shakeX = 0, shakeY = 0;
    if (this.cameraShakeTimer > 0) {
      var zc = Constants.ZerlinConstants;
      var ratio = this.cameraShakeTimer / zc.HIT_SHAKE_DURATION;
      var magnitude = this.cameraShakeIntensity * ratio;
      shakeX = (Math.random() * 2 - 1) * magnitude;
      shakeY = (Math.random() * 2 - 1) * magnitude;
      this.game.ctx.save();
      this.game.ctx.translate(shakeX, shakeY);
    }

    this.sm.camera.draw();
    this.sm.level.draw();
    var _shadowPlayers = [this.sm.Zerlin];
    if (this.multiplayerActive && this.Zerlin2) _shadowPlayers.push(this.Zerlin2);
    this.sm.level.drawEntityShadows(_shadowPlayers, this.sm.droids);
    this.sm.Zerlin.draw();
    if (this.multiplayerActive && this.Zerlin2) this.Zerlin2.draw();
    if (this.bossVsZerlin && this.playableBoss) this.playableBoss.draw();
    for (var i = 0; i < this.sm.droids.length; i++) {
      this.sm.droids[i].draw();
    }
    for (var i = 0; i < this.sm.lasers.length; i++) {
      this.sm.lasers[i].draw();
    }
    for (var i = 0; i < this.sm.powerups.length; i++) {
      this.sm.powerups[i].draw();
    }
    for (var i = 0; i < this.sm.activePowerups.length; i++) {
      this.sm.activePowerups[i].draw();
    }
    for (var i = 0; i < this.sm.otherEntities.length; i++) {
      this.sm.otherEntities[i].draw();
    }
    for (let i = 0; i < this.sceneEntities.length; i++) {
      this.sceneEntities[i].draw();
    }
    if (this.multiplayerActive && this.Zerlin2) {
      this._drawReviveIndicator(this.sm.Zerlin);
      this._drawReviveIndicator(this.Zerlin2);
    }
    if (this.sm.paused) {
      this.sm.pauseScreen.draw();
    }
    this.sm.musicMenu.draw();

    if (this.cameraShakeTimer > 0) {
      this.game.ctx.restore();
    }

    // Training HUD
    this.game.ctx.textAlign = "left";
    this.game.ctx.font = '22px ' + smc.GAME_FONT;
    this.game.ctx.fillStyle = "rgba(255, 220, 0, 0.9)";
    if (this.bossVsZerlin) {
      this.game.ctx.fillText(
        "BOSS BATTLE  |  P1: WASD + Saber  |  P2 (Boss): WASD + Mouse Aim  Click = Beam  Space = Bomb",
        25, 680);
    } else {
      this.game.ctx.fillText(
        "TRAINING GROUND  |  Kills: " + this.trainingKills +
        "  |  Active: " + this.sm.droids.length,
        25, 680);
    }
  }

  // ── Boss Battle death / respawn ───────────────────────────────────────────

  _updateBossVsZerlinDeath() {
    // In multiplayer, only the host drives respawns (client gets state from snapshot)
    if (this.multiplayerActive && this.game.network && !this.game.network.isHost) return;

    var Z1 = this.sm.Zerlin;
    // Zerlin: respawn after death animation completes + a short pause
    if (!Z1.alive && Z1.deathLanded &&
        this.levelSceneTimer > Z1.timeOfDeath + Z1.deathAnimation.totalTime + 1.0) {
      Z1.reset();
      Z1.setHealth();
    }
    // PlayableBoss respawns itself via its own deadTimer in _doUpdate()
  }

  // ── Multiplayer death / revive ────────────────────────────────────────────

  _updateMultiplayerDeath() {
    var Z1 = this.sm.Zerlin, Z2 = this.Zerlin2;
    var isHost = this.game.network && this.game.network.isHost;

    if (!Z1.alive && !Z2.alive) {
      var bothAnimDone = this.levelSceneTimer > Z1.timeOfDeath + Z1.deathAnimation.totalTime
                      && this.levelSceneTimer > Z2.timeOfDeath + Z2.deathAnimation.totalTime;
      if (isHost && bothAnimDone) {
        if (this._mpRestartTimer === null) {
          this._mpRestartTimer = this.levelSceneTimer + smc.MP_RESTART_DELAY;
        }
        if (this.levelSceneTimer >= this._mpRestartTimer) {
          this._mpRestartPending = true;
        }
      }
      return;
    }
    this._mpRestartTimer = null;

    if (!isHost) return;

    var inp = this.game.network.lastReceivedInput || {};
    var p1SpaceDown = this.game.keys['Space']               && !this._prevP1Space;
    var p2SpaceDown = inp.keys && inp.keys['Space']         && !this._prevP2Space;
    this._prevP1Space = !!this.game.keys['Space'];
    this._prevP2Space = !!(inp.keys && inp.keys['Space']);

    if (!Z1.alive && Z2.alive) {
      if (Math.abs(Z2.x - Z1.x) < smc.MP_REVIVE_DISTANCE && p2SpaceDown) {
        Z1.reviveProgress = (Z1.reviveProgress || 0) + 1;
        if (Z1.reviveProgress >= smc.MP_REVIVE_PRESSES_NEEDED) {
          Z1.revive(smc.MP_REVIVE_HEALTH);
        }
      }
    }

    if (!Z2.alive && Z1.alive) {
      if (Math.abs(Z1.x - Z2.x) < smc.MP_REVIVE_DISTANCE && p1SpaceDown) {
        Z2.reviveProgress = (Z2.reviveProgress || 0) + 1;
        if (Z2.reviveProgress >= smc.MP_REVIVE_PRESSES_NEEDED) {
          Z2.revive(smc.MP_REVIVE_HEALTH);
        }
      }
    }
  }

  _drawReviveIndicator(zerlin) {
    if (zerlin.alive) return;
    if (this.levelSceneTimer < zerlin.timeOfDeath + zerlin.deathAnimation.totalTime) return;

    var ctx = this.game.ctx;
    var screenX = zerlin.x - this.sm.camera.x;
    var screenY = zerlin.y - 80;
    var pulse   = 0.6 + 0.4 * Math.sin(this.levelSceneTimer * 5);
    var progress = zerlin.reviveProgress || 0;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = '18px ' + smc.GAME_FONT;

    ctx.globalAlpha = pulse;
    ctx.fillStyle = '#fff';
    ctx.fillText('SPACE to revive', screenX, screenY);

    if (progress > 0) {
      var barW = 90, barH = 10;
      var filled = (progress / smc.MP_REVIVE_PRESSES_NEEDED) * barW;
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = '#333';
      ctx.fillRect(screenX - barW / 2, screenY + 6, barW, barH);
      ctx.fillStyle = '#4af';
      ctx.fillRect(screenX - barW / 2, screenY + 6, filled, barH);
    }

    ctx.restore();
  }

  // ── Snapshot serialization / reconciliation ───────────────────────────────

  _buildPlayerSnapshot() {
    var snap = {
      p1:       this._serializePlayer(this.sm.Zerlin),
      kills:    this.trainingKills,
      droids:   this.sm.droids.map(d => this._serializeDroid(d)),
      lasers:   this.sm.lasers.map(l => this._serializeLaser(l)),
      powerups: this.sm.powerups.map(p => ({ type: p.constructor.name, x: p.x, startY: p.startY })),
    };
    if (this.Zerlin2) {
      snap.p2 = this._serializePlayer(this.Zerlin2);
    }
    if (this.bossVsZerlin && this.playableBoss) {
      snap.boss = this._serializeBoss(this.playableBoss);
    }
    snap.infiniteHealth = this.sm.infiniteHealth;
    if (this._mpRestartPending) {
      snap.restartMultiplayer = true;
      this._mpRestartReadyToExecute = true;
    }
    if (this._pendingBossMode) {
      snap.startBossMode = true;
      this._bossModeReadyToExecute = true;
      this._pendingBossMode = false;
    }
    if (this._pendingTeamMode) {
      snap.startTeamMode = true;
      this._teamModeReadyToExecute = true;
      this._pendingTeamMode = false;
    }
    return snap;
  }

  _serializePlayer(z) {
    return {
      x: z.x, y: z.y,
      deltaX: z.deltaX, deltaY: z.deltaY,
      health: z.currentHealth,
      force:  z.currentForce,
      facingRight: z.facingRight,
      alive:     z.alive,
      direction: z.direction,
      falling:   z.falling,
      somersaulting:          z.somersaulting,
      somersaultingDirection: z.somersaultingDirection,
      slashing:               z.slashing,
      slashingDirection:      z.slashingDirection,
      slashElapsedTime:       z.slashingAnimation     ? z.slashingAnimation.elapsedTime     : 0,
      slashLeftElapsedTime:   z.slashingLeftAnimation ? z.slashingLeftAnimation.elapsedTime : 0,
      somersaultElapsedTime:  z.somersaultingAnimation ? z.somersaultingAnimation.elapsedTime : 0,
      forceJumping:            z.forceJumping,
      forceJumpFinalAnim:      z.forceJumpFinalAnim      || false,
      forceJumpCharging:       z.forceJumpCharging       || false,
      forceJumpChargeTimer:    z.forceJumpChargeTimer     || 0,
      forceJumpPreAnimElapsed: z.forceJumpPreRightAnim   ? z.forceJumpPreRightAnim.elapsedTime   : 0,
      forceJumpFinalAnimElapsed: z.forceJumpFinalRightAnim ? z.forceJumpFinalRightAnim.elapsedTime : 0,
      crouching:              z.crouching,
      armSpriteKey:     z.lightsaber ? z.lightsaber.armSpriteKey : 'rightUp',
      saberAngle:       z.lightsaber ? z.lightsaber.angle       : 0,
      saberHidden:      z.lightsaber ? z.lightsaber.hidden      : false,
      saberThrowing:    z.lightsaber ? z.lightsaber.throwing    : false,
      saberBounceOffset: z.lightsaber ? z.lightsaber.bounceOffset : 0,
      airbornX:         (z.lightsaber && z.lightsaber.airbornSaber) ? z.lightsaber.airbornSaber.x : 0,
      airbornY:         (z.lightsaber && z.lightsaber.airbornSaber) ? z.lightsaber.airbornSaber.y : 0,
      orbActive:        z.lightsaber ? z.lightsaber.orb !== null : false,
      orbPowerTimer:    (z.lightsaber && z.lightsaber.orb) ? z.lightsaber.orb.powerTimer : 0,
      totalLightningFired: z.lightsaber ? (z.lightsaber.totalLightningFired || 0) : 0,
      lightningStartX:  z.lightsaber ? (z.lightsaber.lastLightningStartX || 0) : 0,
      lightningStartY:  z.lightsaber ? (z.lightsaber.lastLightningStartY || 0) : 0,
      lightningAngle:   z.lightsaber ? (z.lightsaber.lastLightningAngle  || 0) : 0,
      reviveProgress:   z.reviveProgress || 0,
      saberHue:         z.saberHue !== undefined ? z.saberHue : 240,
    };
  }

  _serializeDroid(d) {
    return {
      id:   d.id,
      type: d.constructor.name,
      x: d.x, y: d.y,
      deltaX: d.deltaX, deltaY: d.deltaY,
      bcx: d.boundCircle.x, bcy: d.boundCircle.y,
    };
  }

  _serializeLaser(l) {
    return {
      id:   l.id,
      x: l.x, y: l.y,
      tailX: l.tailX, tailY: l.tailY,
      deltaX: l.deltaX, deltaY: l.deltaY,
      isDeflected: l.isDeflected,
      poisoned:    l.poisoned,
      color: l.color, deflectedColor: l.deflectedColor,
      width: l.width, length: l.length,
    };
  }

  /**
   * Client-side: reconcile local ghost entities against the authoritative
   * host snapshot. New entities are created, existing ones get corrections,
   * and entities absent from the snapshot are removed.
   */
  _applyEntitySnapshot(snap) {
    // ── DROIDS ──────────────────────────────────────────────────────────
    var snapDroids = snap.droids || [];
    var snapDroidMap = new Map(snapDroids.map(d => [d.id, d]));

    for (var i = this.sm.droids.length - 1; i >= 0; i--) {
      var ld = this.sm.droids[i];
      if (!snapDroidMap.has(ld.id)) {
        var cx = ld.x + (ld.animation ? ld.animation.scale * ld.animation.frameWidth  / 2 : 0);
        var cy = ld.y + (ld.animation ? ld.animation.scale * ld.animation.frameHeight / 2 : 0);
        this.sm.otherEntities.push(new DroidExplosion(this.game, cx, cy));
        this.sm.droids.splice(i, 1);
      }
    }

    var localDroidMap = new Map(this.sm.droids.map(d => [d.id, d]));

    for (var sd of snapDroids) {
      var existingDroid = localDroidMap.get(sd.id);
      if (existingDroid) {
        existingDroid.x = sd.x; existingDroid.y = sd.y;
        existingDroid.deltaX = sd.deltaX; existingDroid.deltaY = sd.deltaY;
        existingDroid.boundCircle.x = sd.bcx; existingDroid.boundCircle.y = sd.bcy;
      } else {
        var ghostDroid = this._getGhostDroidFromPool(sd.type);
        if (ghostDroid) {
          ghostDroid.id = sd.id;
          ghostDroid.ghost = true;
          ghostDroid.sceneManager = this.sm;
          ghostDroid.x = sd.x; ghostDroid.y = sd.y;
          ghostDroid.deltaX = sd.deltaX; ghostDroid.deltaY = sd.deltaY;
          ghostDroid.boundCircle.x = sd.bcx; ghostDroid.boundCircle.y = sd.bcy;
          this.sm.droids.push(ghostDroid);
        }
      }
    }

    // ── LASERS ──────────────────────────────────────────────────────────
    var snapLasers = snap.lasers || [];
    var snapLaserMap = new Map(snapLasers.map(l => [l.id, l]));

    for (var i = this.sm.lasers.length - 1; i >= 0; i--) {
      if (!snapLaserMap.has(this.sm.lasers[i].id)) {
        this.sm.lasers.splice(i, 1);
      }
    }

    var localLaserMap = new Map(this.sm.lasers.map(l => [l.id, l]));

    for (var sl of snapLasers) {
      var existingLaser = localLaserMap.get(sl.id);
      if (existingLaser) {
        existingLaser.x = sl.x; existingLaser.y = sl.y;
        existingLaser.tailX = sl.tailX; existingLaser.tailY = sl.tailY;
        existingLaser.deltaX = sl.deltaX; existingLaser.deltaY = sl.deltaY;
        existingLaser.isDeflected = sl.isDeflected;
        existingLaser.poisoned = sl.poisoned;
      } else {
        var ghostLaser = DroidLaser.angleConstructor(
          this.game,
          sl.x, sl.y, 1,
          Math.atan2(sl.deltaY, sl.deltaX),
          sl.length, sl.width, sl.color, sl.deflectedColor
        );
        ghostLaser.id = sl.id;
        ghostLaser.ghost = true;
        ghostLaser.x = sl.x; ghostLaser.y = sl.y;
        ghostLaser.tailX = sl.tailX; ghostLaser.tailY = sl.tailY;
        ghostLaser.deltaX = sl.deltaX; ghostLaser.deltaY = sl.deltaY;
        ghostLaser.isDeflected = sl.isDeflected;
        ghostLaser.poisoned = sl.poisoned;
        this.sm.lasers.push(ghostLaser);
      }
    }

    // ── POWERUPS ────────────────────────────────────────────────────────
    var snapPowerups = snap.powerups;
    if (snapPowerups) {
      for (var i = this.sm.powerups.length - 1; i >= 0; i--) {
        var lp = this.sm.powerups[i];
        var inSnap = snapPowerups.some(sp => sp.type === lp.constructor.name && Math.abs(sp.x - lp.x) < 5);
        if (!inSnap) {
          this.sm.powerups.splice(i, 1);
        }
      }
      for (var sp of snapPowerups) {
        var existsLocally = this.sm.powerups.some(lp => lp.constructor.name === sp.type && Math.abs(lp.x - sp.x) < 5);
        if (!existsLocally) {
          var newPu = this._createTrainingPowerup(sp.type, sp.x, sp.startY);
          if (newPu) this.sm.powerups.push(newPu);
        }
      }
    }
  }

  _applyPlayerFromSnapshot(zerlin, state) {
    if (!state) return;
    zerlin.x      = state.x;
    zerlin.y      = state.y;
    zerlin.deltaX = state.deltaX;
    zerlin.deltaY = state.deltaY;
    zerlin.currentHealth = state.health;
    zerlin.currentForce  = state.force;
    zerlin.direction = state.direction;
    zerlin.falling   = state.falling;
    if (zerlin.lightsaber) {
      zerlin.lightsaber.angle = state.saberAngle;
      zerlin.lightsaber.updateCollisionLine();
    }
    if (state.reviveProgress !== undefined) zerlin.reviveProgress = state.reviveProgress;
    if (state.saberHue !== undefined) zerlin.saberHue = state.saberHue;
    if (state.alive && !zerlin.alive) zerlin.revive(state.health);
    // Always use faceRight/faceLeft (never updateBoundingBox) so bounding box
    // bottom is always y (not y-6), keeping lastBottom consistent for platform detection.
    state.facingRight ? zerlin.faceRight() : zerlin.faceLeft();
  }

  _serializeBoss(boss) {
    return {
      x: boss.x, y: boss.y,
      deltaX: boss.deltaX, deltaY: boss.deltaY,
      health: boss.currentHealth,
      alive: boss.alive,
      falling: boss.falling,
      facingRight: boss.facingRight,
      shooting: boss.shooting,
      beamAngle: boss.beamCannon.beamAngle,
      bombs: boss.bombs.map(b => ({ x: b.x, y: b.y, deltaX: b.deltaX, deltaY: b.deltaY, bcx: b.boundingCircle.x, bcy: b.boundingCircle.y })),
    };
  }

  _applyBossFromSnapshot(boss, state) {
    if (!state) return;
    boss.x = state.x;
    boss.y = state.y;
    boss.deltaX = state.deltaX;
    boss.deltaY = state.deltaY;
    boss.currentHealth = state.health;
    boss.beamCannon.beamAngle = state.beamAngle;
    // Always refresh bounding box consistently
    state.facingRight ? boss.faceRight() : boss.faceLeft();

    if (!state.alive && boss.alive) {
      boss.die();
    } else if (state.alive && !boss.alive) {
      boss.respawn();
    }
    // Always sync falling directly — die()/respawn() set it correctly on first trigger,
    // but direct sync prevents any frame where the animation lags behind the host.
    if (state.falling !== undefined) boss.falling = state.falling;

    // Sync beam state
    if (state.shooting && !boss.shooting) {
      boss.shoot();
    } else if (!state.shooting && boss.shooting) {
      if (boss.beamCannon.on) boss.beamCannon.turnOff();
      boss.shooting = false;
    }

    // Sync bombs by index — trigger explosion locally when host removes a bomb
    while (boss.bombs.length > state.bombs.length) {
      var deadBomb = boss.bombs.pop();
      deadBomb.explode();
    }
    for (var i = 0; i < state.bombs.length; i++) {
      if (boss.bombs[i]) {
        boss.bombs[i].x      = state.bombs[i].x;
        boss.bombs[i].y      = state.bombs[i].y;
        boss.bombs[i].deltaX = state.bombs[i].deltaX;
        boss.bombs[i].deltaY = state.bombs[i].deltaY;
        boss.bombs[i].boundingCircle.x = state.bombs[i].bcx;
        boss.bombs[i].boundingCircle.y = state.bombs[i].bcy;
      } else {
        var nb = new Bomb(this.game, state.bombs[i].x, state.bombs[i].y,
                          state.bombs[i].deltaX, state.bombs[i].deltaY);
        nb.boundingCircle.x = state.bombs[i].bcx;
        nb.boundingCircle.y = state.bombs[i].bcy;
        boss.bombs.push(nb);
      }
    }
  }

  /**
   * Retrieve a pre-built droid of the requested type from the client's pool.
   * Replenishes automatically if depleted.
   */
  _getGhostDroidFromPool(type) {
    if (this.trainingDroidPool.findIndex(d => d.constructor.name === type) === -1) {
      this.sm.level.set();
      var fresh = this.sm.level.unspawnedDroids;
      this.sm.level.unspawnedDroids = [];
      this.trainingDroidPool = this.trainingDroidPool.concat(fresh);
    }
    var idx = this.trainingDroidPool.findIndex(d => d.constructor.name === type);
    if (idx === -1) return null;
    return this.trainingDroidPool.splice(idx, 1)[0];
  }

  /**
   * Snap a Zerlin to the top of the nearest floor tile at their x position.
   * Used to place P2 on the ground instead of falling from y=0.
   */
  _snapToFloor(zerlin, tiles) {
    var zc = Constants.ZerlinConstants;
    for (var i = 0; i < tiles.length; i++) {
      var t = tiles[i];
      if (t.rowIndex !== undefined && t.rowIndex === t.totalRows - 1 &&
          t.boundingBox.left <= zerlin.x && t.boundingBox.right >= zerlin.x) {
        zerlin.y = t.boundingBox.top + zc.Z_FEET_ABOVE_FRAME * zc.Z_SCALE;
        zerlin.updateBoundingBox();
        zerlin.falling = false;
        zerlin.tile = t;
        zerlin.lastBottom = zerlin.boundingbox.bottom;
        return;
      }
    }
  }

  /**
   * Factory for recreating a powerup token at an arbitrary position.
   * Used by the respawn queue and powerup snapshot reconciliation.
   */
  _createTrainingPowerup(type, x, y) {
    var am = this.game.assetManager;
    switch (type) {
      case 'HealthPowerUp':
        return new HealthPowerUp(this.game, am.getAsset('img/ui/powerup_health.png'), x, y);
      case 'ForcePowerUp':
        return new ForcePowerUp(this.game, am.getAsset('img/ui/powerup_force.png'), x, y);
      case 'InvincibilityPowerUp':
        return new InvincibilityPowerUp(this.game, am.getAsset('img/ui/powerup_invincibility.png'), x, y);
      case 'HomingLaserPowerUp':
        return new HomingLaserPowerUp(this.game, x, y);
      case 'SplitLaserPowerUp':
        return new SplitLaserPowerUp(this.game, x, y);
      case 'TinyModePowerUp':
        return new TinyModePowerUp(this.game, x, y);
    }
    return null;
  }
}
