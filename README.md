## 09_Match3Game

#### １．格子状にオーブを配置する

#### ２．ランダムにオーブを配置する

#### ３．先を見越して　配置するメソッドを実装する
グローバル変数
```
var fieldSize = 6;
var tileTypes = ["orange", "cyan", "greeen", "yellow", "purple"];
var tileSize = 50;
var orbLayer;
var tileArray = [];
var cache;

```

for文で格子状に配置する　・・・　addTile関数を繰り返し呼び出し　
```
createLevel: function() {
  for (i = 0; i < fieldSize; i++) {
    tileArray[i] = [];
    for (j = 0; j < fieldSize; j++) {
      this.addTile(i, j);
    }
  }
```
```
addTile: function(row, col) {
  var randomTile = Math.floor(Math.random() * tileTypes.length);
  var sprite = cc.Sprite.create(cache.getSpriteFrame(tileTypes[randomTile]));
  orbLayer.addChild(sprite, 0);
  sprite.val = randomTile;
  orbLayer.addChild(sprite,0);
  sprite.setPosition(tileSize/2 + tileSize * col,tileSize/2 + tileSize * row);
  tileArray[row][col]=sprite;
}
```
