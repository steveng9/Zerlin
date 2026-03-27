/*
Zerlin
TCSS 491 - Computational Worlds
Joshua Atherton, Michael Josten, Steven Golob
*/

var PHI = 1.618;

Constants = {

  KeyConstants: {
    MOVE_RIGHT: 'KeyD',
    MOVE_LEFT: 'KeyA',
    CROUCH: 'KeyX',
    JUMP: 'KeyW',
    JUMP_FORCE: 'ShiftLeft',
    SLASH: 'Space',
    ROLL: 'KeyS',
    PAUSE: 'Enter'
  },

  SparkConstants: {
    WIDTH: 3,
    MAX_TIME_ALIVE: .3,
    MAX_VELOCITY: 700
  },

  DroidBasicConstants: {
    BASIC_DROID_SHOOT_INTERVAL: 1, //default 2
    BASIC_DROID_X_MOVEMENT_SPEED: 225,
    BASIC_DROID_Y_MOVEMENT_SPEED: 100,
    BASIC_DROID_X_ACCELERATION: 400,
    BASIC_DROID_Y_ACCELERATION: 100,
    BASIC_DROID_ORBITAL_X_OFFSET: 200,
    BASIC_DROID_ORBITAL_Y_OFFSET: -200,
    BASIC_DROID_SCALE: 0.65,

    /* bounding circle scale */
    BASIC_DROID_BOUND_CIRCLE_SCALE: 1.10,

    //Laser constants
    BASIC_DROID_LASER_SPEED: 400,
    BASIC_DROID_LASER_LENGTH: 10,
    BASIC_DROID_LASER_WIDTH: 10,

    /* This is actually spray droid? leggy droid constants */
    LEGGY_DROID_SHOOT_INTERVAL: 2,
    LEGGY_DROID_LASER_SPEED: 350,
    LEGGY_DROID_LASER_LENGTH: 25,
    LEGGY_DROID_LASER_WIDTH: 12,


    SPRAY_LASER_COUNT: 5,
    SPRAY_LASER_WIDTH_RADIANS: Math.PI / 6,

    /* beam droid constants */
    BEAM_DROID_SHOOT_INTERVAL: 4,
    BEAM_DROID_SHOOT_DURATION: 2,
    BEAM_DROID_LASER_WIDTH: 16,
    BEAM_HP_PER_SECOND: 3,
    BEAM_ANGLE_ACCELERATION_RADIANS: Math.PI / 3,

    /* slowburst laser constants */
    SLOWBURST_DROID_SHOOT_INTERVAL: .3,
    SLOWBURST_DROID_LASER_SPEED: 350,
    SLOWBURST_DROID_BURSTS: 4,
    // (how many shots are SKIPPED) + BURST_DROID_BURSTS in overall interval
    SLOWBURST_DROID_SHOOTS_PER_CYCLE: 10,

    /* fast burst laser constants */
    FASTBURST_DROID_SHOOT_INTERVAL: .1,
    FASTBURST_DROID_LASER_SPEED: 550,
    FASTBURST_DROID_BURSTS: 3,
    // (how many shots are SKIPPED) + BURST_DROID_BURSTS in overall interval
    FASTBURST_DROID_SHOOTS_PER_CYCLE: 20,

    /* Sniper droid laser constants */
    SNIPER_DROID_LASER_SPEED: 850,
    SNIPER_DROID_SHOOT_INTERVAL: 7,
    SNIPER_DROID_LASER_LENGTH: 50,
    SNIPER_DROID_LASER_WIDTH: 15,

    /* multi-shot laser constants */
    MULTISHOT_DROID_SHOOT_INTERVAL: 2,
    MULTISHOT_WIDTH: 20
  },

  ZerlinConstants: {
    //PHI : 1.618,

    /* Zerlin health and force stats*/
    Z_MAX_HEALTH: 10, //was 20
    Z_MAX_FORCE: 10,
    Z_FORCE_REGEN_PER_SECOND: 1/15,
    Z_FORCE_JUMP_FORCE_COST: 3,
    Z_SOMERSAULT_FORCE_COST: 3,
    Z_SABER_THROW_FORCE_COST: 4,
    Z_LIGHTNING_FORCE_COST: 5,
    /* Zerlin damage */
    Z_SLASH_DAMAGE: 25,
    Z_BOSS_BEAM_DAMAGE: 0.5,

    Z_SCALE: 0.50, //was .55

    DRAW_COLLISION_BOUNDRIES: false,

    Z_SPAWN_X: 0, //modify this to spawn zerlin later in the level. // get to end of lvls 11000
    //about 100 for 1 tile/column.

    Z_WIDTH: 114,
    Z_HEIGHT: 306,
    Z_ARM_SOCKET_X: 33,
    Z_ARM_SOCKET_Y: 146,
    Z_CROUCH_ARM_SOCKET_Y: 186,
    Z_HORIZANTAL_POSITION: 2 - PHI,
    Z_FEET_ABOVE_FRAME: 10,

    Z_WALKING_FRAME_SPEED: .12,
    Z_WALKING_FRAMES: 6,
    Z_STANDING_FRAME_SPEED: .55,
    Z_STANDING_FRAMES: 2,

    Z_FALLING_UP_FRAMES: 1,
    Z_FALLING_DOWN_FRAMES: 2,
    Z_FALLING_FRAME_SPEED: .16,

    Z_SOMERSAULT_WIDTH: 462,
    Z_SOMERSAULT_HEIGHT: 306,
    Z_SOMERSAULT_FRAME_SPEED: .1,
    Z_SOMERSAULT_FRAMES: 10,

    Z_SLASH_WIDTH: 558,
    Z_SLASH_HEIGHT: 390,
    Z_SLASH_FRAME_SPEED: .03,
    Z_SLASH_FRAMES: 20,
    Z_ARM_SOCKET_X_SLASH_FRAME: 69,
    Z_ARM_SOCKET_Y_SLASH_FRAME: 230,
    Z_SLASH_RADIUS: 280,
    Z_SLASH_CENTER_X: 202,
    Z_SLASH_CENTER_Y: 110,
    Z_SLASH_INNER_RADIUS: 180,
    Z_SLASH_INNER_CENTER_X: 86,
    Z_SLASH_INNER_CENTER_Y: 20,
    Z_SLASH_START_FRAME: 9,
    Z_SLASH_END_FRAME: 11,

    Z_DEATH_WIDTH: 414,
    Z_DEATH_FRAMES: 30,


    Z_WALKING_SPEED: 200,
    Z_SOMERSAULT_SPEED: 400,
    FORCE_JUMP_DELTA_Y: -950,
    JUMP_DELTA_Y: -600,
    GRAVITATIONAL_ACCELERATION: 1000,

    SABER_GLOW_RADIUS: 13,
    LS_UP_IMAGE_WIDTH: 126,
    LS_UP_IMAGE_HEIGHT: 228,
    LS_DOWN_IMAGE_WIDTH: 126,
    LS_DOWN_IMAGE_HEIGHT: 222,

    LS_UP_COLLAR_X: 114, // 114 for outer edge of blade, 111 for center of blade,
    LS_UP_COLLAR_Y: 186,
    LS_DOWN_COLLAR_X: 114,
    LS_DOWN_COLLAR_Y: 35,
    LS_UP_TIP_X: 114,
    LS_UP_TIP_Y: 5,
    LS_DOWN_TIP_X: 114,
    LS_DOWN_TIP_Y: 216,

    LS_RIGHT_X_AXIS: 10,
    LS_LEFT_X_AXIS: 10,
    LS_UP_Y_AXIS: 159,
    LS_DOWN_Y_AXIS: 63,

    LS_THROW_IMAGE_WIDTH: 144,
    LS_THROW_IMAGE_HEIGHT: 48,
    LS_THROW_RIGHT_X_AXIS: 9,
    LS_THROW_RIGHT_Y_AXIS: 13,
    THROW_ARM_IMAGE_FINGER_X: 132,
    THROW_ARM_IMAGE_FINGER_Y: 9,

    LS_AIRBORN_WIDTH: 234,
    LS_AIRBORN_HEIGHT: 234,
    LS_AIRBORN_FRAME_DURATION: .07,
    LS_AIRBORN_FRAMES: 4,
    SABER_THROW_INITIAL_SPEED: 1000,
    SABER_THROW_ACCELERATION: 800,
    AIRBORN_SABER_DAMAGE: 10
  },

  DroidUtilConstants: {
    EXPLOSION_SCALE: 2,
    EXPLOSION_FRAME_SPEED: 0.05,
    DRAW_BOUNDING_CIRCLE: false
  },

  DroidSmartConstants: {

  },

  GameEngineConstants: {
    //PHI : 1.618
  },

  SceneManagerConstants: {
    OPENING_SEQUENCE_1_TIME: 14,
    OPENING_OVERLAY_TIME: 5,
    OPENING_SCENE_CAMERA_PAN_TIME: 7,
    OPENING_SCENE_FIRST_FADE_OUT_TIME: 10,
    TOKEN_VALUE: 3,

    OPENING_MESSAGE:
      `There is a tremor in the Force on the Dagobah System.
Legions of mining droids have been unleashed
on the peaceful planet. It's rich core
of kyber is frail, and the droids are rapidly
destroying Dagobah's biosphere.

A lone Jedi dispatched in the outer rim has
felt it. A lone warrior against unknown evil...`,

    LEVEL_ONE_TEXT: "Here begins a new journey...",

    LEVEL_TWO_MESSAGE:
      `After clearing out many of the droids across the highlands of Dagobah, 
the Jedi Coucil has placed a movement in the Galactic Senate of the Republic to protect the
planet from nefarious mining enterprises. Although, such a diplomatic solution
is often lost in the endless beuarocracy.

Zerlin has set course for Coruscant in order to resolve the matter 
with aggressive negotiations, but upon arrival, has encountered more 
resistance than he had expected...`,

    LEVEL_THREE_MESSAGE:
      `Coruscant has successfully been secured.

The Jedi Council has uncovered the source of the droids. They are 
being sent by a Mandalorian named Chettark, a bounty hunter who resides on 
the Planet Hoth. He is in league with the Trade Federation, and 
has been preparing an invasion army to use on defenseless planets with 
kyber deposits.

The Council has assigned Zerlin to find him, and stop him at all costs.`,

    CREDITS_1:
      `Zerlin has eliminated the threat to Dagobah and 
has restored balance to the force. 

The Trade Federation's henchman has been destroyed, 
and peace can now prosper in the Galaxy.

The End`,

    CREDITS_2:
      `Game and Art by

Steven Golob
Joshua Atherton
Michael Josten`,

    OPENING_MESSAGE_TIME: 13,
    OPENING_TITLE_TIME: 8,
    OPENING_SEQUENCE_4_TIME: 10,
    LEVEL_TRANSITION_TIME: 6,
    LEVEL_TRANSITION_OVERLAY_TIME: 3,
    LEVEL_COMPLETE_OVERLAY_TIME: 10,
    NUM_LEVELS: 3,
    PAUSE_TIME_AFTER_START_LEVEL: 1.2,
    CREDITS_MESSAGE_1_TIME: 9,

    GAME_FONT: 'VT323'
  },

  CollisionManagerConstants: {
    EDGE_OF_MAP_BUFFER: 50
  },

  SoundEnginerConstants: {

  },

  DroidBossConstants: {
    DROID_BOSS_MAX_HEATH: 150,
    POISON_LASER_DURATION: 5,
    POISION_LASER_DAMAGE_PER_TICK: .75,
    POISON_LASER_LENGTH: 38,
    POISON_LASER_WIDTH: 18,
    POISON_LASER_SPEED: 650,
    DROID_BOSS_SHOOT_INTERVAL: .5,
    HIT_WITH_SABER_DAMAGE: 10,
    HIT_WITH_LASER_DAMAGE: 2,

    DROID_BOSS_ORBITAL_X_OFFSET: 200,
    DROID_BOSS_ORBITAL_Y_OFFSET: -200,
    DROID_BOSS_X_MOVEMENT_SPEED: 100,
    DROID_BOSS_X_ACCELERATION: 200,
    DROID_BOSS_Y_MOVEMENT_SPEED: 50,
    DROID_BOSS_Y_ACCELERATION: 50,
  },

  BossConstants: {
    B_MAX_HEALTH: 200, // was 150
    BEAM_HP_PER_SECOND: 2, //was .5

    B_SCALE: .6,
    B_DRAW_COLLISION_BOUNDRIES: false,
    B_WIDTH: 120,
    B_HEIGHT: 240,
    B_ARM_SOCKET_X: 51,
    B_ARM_SOCKET_Y: 111,
    B_FLYING_FRAME_SPEED: .07,
    B_FLYING_FRAMES: 4,
    B_FALLING_FRAMES: 1,
    B_FALLING_FRAME_SPEED: 1,
    B_SHOOT_INTERVAL: 3,
    B_SHOOT_DURATION: 2,
    B_HOVERING_HEIGHT: 500,
    B_ACCELERATION: 300,
    B_FALLING_REACTION_TIME: .85,
    B_RECOVERY_PERIOD: 2,
    B_BEAM_EXPLOSION_THRESHHOLD: 1,
    BC_WIDTH: 198,
    BC_HEIGHT: 108,
    BC_X_AXIS: 38,
    BC_RIGHT_Y_AXIS: 17,
    BC_LEFT_Y_AXIS: 91,
    BC_MUZZLE_X: 185,
    BC_MUZZLE_RIGHT_Y: 81,
    BC_MUZZLE_LEFT_Y: 27,
    BEAM_DROID_LASER_WIDTH: 26,
    BEAM_HP_PER_SECOND: .3,
    BEAM_ANGLE_ACCELERATION_RADIANS: Math.PI * 2,
    MICRO_BEAM_COUNT: 5,
    MUZZLE_WIDTH: 13,
    MAX_BEAM_LENGTH: 5000,

    BOMB_FRAMES: 25,
    BOMB_FRAME_DURATION: .1,
    BOMB_SCALE: .35,
    BOMB_DROP_INTERVAL: .5,
    BOMB_DAMAGE: 5,

    BEAM_MODE_DURATION: 15,
    BOMB_MODE_DURATION: 5
  },

  StatusBarConstants: {
    STATUS_BAR_LENGTH: 0.25, // width of the canvas to use when drawing
    STATUS_BAR_WIDTH: 20,
    STATUS_BAR_DISPLAY_TEXT: false,

    //when the current is less than or equal to the maxSize * CriticalAmount
    //then start alerting the user by using some graphics.
    STATUS_BAR_CRITICAL_AMOUNT: 0.2, //when the current is at 1/5 the maxSize
    STATUS_BAR_CRITICAL_FLASH_INTERVAL: 0.5,
    HEALTH_BAR_HAS_CRITICAL_STATE: true,
    FORCE_BAR_HAS_CRITICAL_STATE: false,

    BOSS_BAR_LENGTH: 0.5,
    BOSS_BAR_HAS_CRITICAL_STATE: false,

    POWERUP_START_X: 375,
    POWERUP_Y: 10,
    POWERUP_BAR_Y: 50,
    POWERUP_PAD_X: 80,
    POWERUP_LINE_LENGTH: 30,
    POWERUP_LENGTH: 40,
  },

  CameraConstants: {
    ZERLIN_POSITION_ON_SCREEN: .382, // = (1 - 1/PHI)
    BUFFER: 20
  },

  LevelConstants: {
    DRAW_BOXES: false,
    TILE_ACCELERATION: 200,
    TILE_INITIAL_VELOCITY: 200,
    MAX_GOD_LIGHT_OPACITY: .45,
    GOD_LIGHT_INTERVAL: 16,
    HIGHWAY_SPEED: 1000,

    /*
    Assets:
    //powerups are capital

    -  =  tile
    =  =  moving tile
    ~  =  falling tile
    d  =  basic droid
    s  =  scatter shot droid
    b  =  slow burst droid
    f  =  fast burst droid
    m  =  multi-shot droid
    n  =  sniper droid

    H  =  health powerup
    F  =  force powerup
    I  =  invincibility powerup
    S  =  split-shot powerup
    T  =  tiny mode powerup
    W  =  Homing laser powerup

    *  =  leggy droid boss
    X  =  Boss
    */
   BOSS_TEST_LAYOUT: [
    '                 ',
    '                 ',
    '                 ',
    '            X    ',
    '                 ',
    '    -----        ',
    '                 ',
    '-----------------'
  ],

    MIKE_LEVEL_THREE: [

      '            m                   mn        T      d  I                           m   f                    b          b f d d  f m   b                        I       ',
      '             f       m         n          nf      ds     dbfsmn                df  fs    ddddf  f       dn        d              dd f                               ',
      '             ms     d  b             ------       f          dbf               s   m           m m     d        d                             H                     ',
      '             mb      d f                d s                                                     s b   f       d                                                     ',
      '                                         dm                                                      d                                          C                 d     ',
      '                                ~~~        d                                                                                          ---------                d    ',
      '                                                    -                       H                                                       ~                       =       ', //from ground can force jump to here.
      '                                                                                                                                  ~                             d   ',
      '                                                                                                                           S    ~                               d   ', //halfway of camera height.
      '                                                                            -                                                 ~                                     ',
      '                          ~~~                                                                                             = =                                       ',
      '                                                                -----                                                  ~                                     X      ',
      '                                                                      C                         ----------           ~                                              ',
      '                                            ~~ ~ ~~ ~~~ ~~~ ~~~      ----                                          ~                                  --      --    ',
      '      W                            S                                                                             ~                                                 H', //from ground level, can reg. jump to here.
      '             ==  ==            --                                         - --~~----------------    H   F      ~                                                    ',
      '                                                                                           W                ~~                                                      ',
      '------------        ---- -----    --- -- ---                                     --- --- -- ---   ---------                                    ---------------------',
      ''],
      //   ^      ^- just on screen on start camera location.
      //   |-> Zerlin spawn point.

    LEVEL_ONE_TILE_LAYOUT: [
      '                                 ',
      '                                 ',
      '                                 ',
      '                                 ',
      '                                 ',
      '       b                          ',
      ' s            b    --   d     -s  ',
      '     n       -      B    --       s',
      ' d F    m   I   -     d            -',
      '  H   H  B F    --  n                ',
      '  =    F    F     ===        X      ',
      'f   F --   I      --          d     ',
      ' H  -- I    H    -  s    ===   -       ',
      '-------------------------------------'
    ],
    //I think becuase of the powerup scale, they need to be 2 row higher than where you want it.
    //can modify Z_SPAWN_X to make zerlin spawn later in the level.
    MIKE_LEVEL_ONE: [
      '                          b      s                 d       d                   f d                     S    d      d          ',
      '                    d                d              d      dds                   d                          f     f  d        ',
      '                           d         d            d  b      db                    d                        b        d s       ',
      '                     d                s             s                             s                                 I s       ',
      '                                      d                                                     ------------            b d   d   ',
      '              d                                                                                                      b        ',
      '                                                                                        =      f        d            fd       ', //from ground can force jump to here.
      '                                                                                                s      d    ---               ',
      '                                                                                               d s                            ', //halfway of camera height.
      '                                                                                    H F                     ==                ',
      '                                                                                                                              ',
      '                                            --------                                                                          ',
      '                  -----                                                   ---       ---    W                     --           ',
      '                                       ----                                                                                   ',
      '           ------                             I         H -----       ---     ----                          ---       --      ', //from ground level, can reg. jump to here.
      '                               S -----             ----                                        ---                            ',
      '                                                                    C                                                         ',
      '------------           -- -- ----            --------   --     --- ---             -----------     ---------------------------'],
    //   ^      ^- just on screen on start camera location.
    //   |-> Zerlin spawn point.
    //can jump 1 column
    //can roll 2 columns
    CITY_LEVEL: [
          '                                                                                                                               ',
          '                s              d                                 b                                                             ',
          '                                                                                   n                                           ',
          '                d                                              m                                              m                ',
          '                                             f                                                                                 ',
          '                                                                                                     I                         ',
          '                              s                                                                                                ',
          '                                     ~  ~~~                                                                                    ', //from ground can force jump to here.
          '                                                                                      m             ~~                         ',
          '                                                                                              --~~                             ', //halfway of camera height.
          '                                     b s                                           ~~~~---~~          n                        ',
          '                      f  H                                      f         ~~~W               d                                 ',
          '                                                                                        n                              *       ',
          '                                   I            ==        C        ~~~~~                       T                               ',
          '                         ~~~           d   = ==       ~~~~--~~--           ~--~ === =   ----                                   ',
          '  ~                                                                                             ==                             ', //from ground level, can reg. jump to here.
          '         ~~~~~~~                 ~~~--~---        ~~~  H     F                            S                    ----~--         ',
          '                 ------- == ===                                 -------~~~~-                                                   ',
          '~~~-----                                                                               ----------~--~------~---~      ~--------',
          ''],

    MOVING_TILE_TESTER_LAYOUT: [
      '                 ',
      '                 ',
      '                 ',
      '          --     ',
      '    ==  -      - ',
      '---              ',
      '  ===========    ',
      '-----------------'
    ]

  },

  PowerUpConstants: {
    HEALTH_SCALE: 3,
    RECOVER_HEALTH_AMOUNT: 30,

    RECOVER_FORCE_AMOUNT: 20,
    FORCE_SCALE: 3,
    DRAW_OUTLINES: false,
    FLOATING_MAGNITUDE: 12,

    INVINCIBILITY_SCALE: 2.5,
    INVINCIBILITY_TIME: 10,

    COIN_IMAGE_SCALE: .5,
    LASER_IMAGE_SCALE: .5,

    SPLIT_SHOT_TIME: 10,
    SPLIT_LASER_AMOUNT: 4,
    SPLIT_LASER_ARC_WIDTH: Math.PI / 9,

    TINY_MODE_TIME: 17,
    SHRINKING_TIME: 1.5,
    TINY_SCALE: .175,

    HOMING_LASER_TIME: 10,
    HOMING_LASER_STATUS_BAR_SCALE: .2,
  },

  LightningConstants: {
    ARC_CAPTURE_RANGE: Math.PI / 6,
    SEGMENT_GENERATION_TIME: .005,
    WIDTH: 4,
    MAX_SEGMENT_LENGTH: 50,
    FADE_TIME: 1.5,
    MAX_SEGMENT_ARC_RANGE: Math.PI * .8,
    BOSS_DAMAGE: 10,
    ORB_INITIAL_RADIUS: 8,
    ORB_GROW_RATE: 5,
    ORB_PULSATION_MAGNITUDE: 2
  },

  CheckPointConstants: {
    WIDTH: 50,
    HEIGHT: 120
  }

};
