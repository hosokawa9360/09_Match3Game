var gameScene = cc.Scene.extend({
  onEnter: function() {
    this._super();
    gameLayer = new game();
    gameLayer.init();
    this.addChild(gameLayer);
  }
});

var game = cc.Layer.extend({
  init: function() {
    this._super();
    //グラデーション背景
    var backgroundLayer = cc.LayerGradient.create(cc.color(0, 0, 0, 255), cc.color(0x46, 0x82, 0xB4, 255));
    this.addChild(backgroundLayer);　　　 //でバック用のラベルを表示
    debugText = cc.LabelTTF.create("debug", "Arial", "32", cc.TEXT_ALIGNMENT_CENTER);
    this.addChild(debugText);
    size = cc.winSize;
    debugText.setPosition(size.width / 2, size.height - 20);
    debugText.setString("match 3 game");

    //スプライトシート読み込み
    var cache = cc.spriteFrameCache;
    cache.addSpriteFrames(res.orbs_plist, res.orbs_png);
    var tileTypes = ["orange", "cyan", "greeen", "yellow", "purple"];
    for (i = 0; i < 5; i++) {
      for (j = 0; j < 6; j++) {
        //ランダム
        var randomTile = Math.floor(Math.random() * tileTypes.length);
        var sprite = cc.Sprite.create(cache.getSpriteFrame(tileTypes[randomTile]));
        sprite.setPosition(115 + 49 * j, 50 + 49 * i);
        this.addChild(sprite, 0);
      }
    }

    　

    /*
    var cache2 = cc.spriteFrameCache;
     cache2.addSpriteFrames(res.orb_plist,res.orbs_png);
     var orbSprite = cc.Sprite.create(cache2.getSpriteFrame("green"));
      orbSprite.setPosition(100,100);
    　this.addChild(orbSprite);*/
  },

});
