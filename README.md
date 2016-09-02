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

#### ４．最初のコマを選択または解除する
```
//最初のコマを選択または解除で追加
var startColor = null;　 //最初に選択したタイルの色
var visitedTiles = []; //プレイヤが選択された後のタイルを格納する
```

```
cc.eventManager.addListener(touchListener, this);
```

```
var touchListener = cc.EventListener.create({
      event: cc.EventListener.MOUSE, //マウスを利用する
      onMouseDown: function(event) {
        //クリックされた座標位置から、選択された行と列のインデックスを取得する
        var pickedRow = Math.floor(event._y / tileSize);
        var pickedCol = Math.floor(event._x / tileSize);
        tileArray[pickedRow][pickedCol].setOpacity(128);//半透明にする
        tileArray[pickedRow][pickedCol].picked = true;
        startColor = tileArray[pickedRow][pickedCol].val;//現在のコマの色をstartColorに入れる
        //これ以降選択されるコマの座標がvisitedTilesにpushされる
        visitedTiles.push({
          row: pickedRow,
          col: pickedCol
        });
      },
      onMouseUp: function(event) {
        startColor = null;//プレイヤがマウスを話したとき、コマの選択をnull(リセットする）
        for (i = 0; i < visitedTiles.length; i++) {
          tileArray[visitedTiles[i].row][visitedTiles[i].col].setOpacity(255);
          tileArray[visitedTiles[i].row][visitedTiles[i].col].picked = false;
        }
      }
});

```
