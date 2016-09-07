## 09_Match3Game
たくさんのコマを水平、垂直、または斜めにつなげていき、消去するゲーム。

#### １．格子状にコマを配置する

#### ２．ランダムにコマを配置する

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
グローバル変数
```
//最初のコマを選択または解除で追加
var startColor = null;　 //最初に選択したタイルの色
var visitedTiles = []; //プレイヤが選択された後のタイルを格納する
```
イベントマネージャ
```
cc.eventManager.addListener(touchListener, this);
```
リスナー実装
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
#### ５．連鎖チェーンを作る
ゲームのルールはシンプル。
たくさんのコマを水平、垂直、または斜めにつなげていき、消去するゲーム。
バックトラックもできる。

- 選択許容範囲内にある
- 現在のコマがまだ選択されておらず、picked属性がfalseである
- 現在のコマは最後の選択されあたコマに隣接している
- 現在のコマは、まず選んだコマと同じ色である

##### 選択許容範囲内にあるの判定について
ポイント　指とタイルの距離判定にはピタゴラスの定理をつかう　tolerance 400 : 20 * 20  
これにより、なぞり方が多少不正確でも、思ったとおりにコマを選択できる
```
if (distX * distX + distY * distY < tolerance) {
```

#### ６．バックトラッキング
一度選択したルートをキャンセルし、変更したい場合、後戻りして、途中で選択を変更し、別ルートを取ることをバックトラッキングという。  
今回は、プレイヤーが最後に選択移動したコマの一つ前にコマにマウスで戻ることをバックトラッキングとする。  
そのとき、一つ前に戻るわけだから、最後に選択移動したコマの情報（最後のコマのvisitedTiles配列とpicked属性、および透明度）が削除される。それぞれ、picked属性はデフォルト値であるfalse,透明度も255に戻される。  

バックトラックを行うことができるかは、チェックが必要。  
- 条件１　選択許容範囲内にある
- 条件２　現在のコマは、すでに選択状態にあり、picked属性はtrueとなっている
- 現在のコマは、visidedTiled配列の最後から2版目要素である

上記の条件等々を`onMouseMove`　にコーディングすると、
```
onMouseMove: function(event){
       if(startColor!=null){
           //省略
           //ピタゴラスの定理で　選択許容範囲内かどうかを判定
           //条件１　選択許容範囲内にある
           if(distX * distX + distY * distY < tolerance){
             //現在のコマがまだ選択されておらず、picked属性がfalseである
               if(!tileArray[currentRow][currentCol].picked){
　　　　　　　　　　　//省略 連鎖チェーンを作る処理
               }
               //条件２　現在のコマは、すでに選択状態にあり、picked属性はtrueとなっている
               else{
                 //条件３　現在のコマは、visidedTiled配列の最後から2版目要素である
                   if(visitedTiles.length>=2 && currentRow == visitedTiles[visitedTiles.length - 2].row && currentCol == visitedTiles[visitedTiles.length - 2].col){

                     //透明度も255に戻される。  
                       tileArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].setOpacity(255);

                       //picked属性はデフォルト値であるfalse,
                       tileArray[visitedTiles[visitedTiles.length - 1].row][visitedTiles[visitedTiles.length - 1].col].picked=false;

                       //最後に選択移動したコマの情報を連鎖チェーンから削除
                       visitedTiles.pop();
                   }
               }
       }
   },
```

### コマを消す
コマを連続選択できたら、マウスを離したときにそれらを消去します。
条件
- 連鎖しているコマの数は３つ以上
処理
 配置するコマを管理している配列 tileArray から　 連鎖するコマの座標を管理するvisitedTiles に登録されている連鎖するコマ（の行と列）を削除する
 ```
 onMouseUp: function(event) {
   startColor = null; //プレイヤがマウスを話したとき、コマの選択をnull(リセットする）
   for (i = 0; i < visitedTiles.length; i++) {
    //連鎖しているコマの数が３未満なら、消さずに初期状態にもどす
     if (visitedTiles.length < 3) {
       tileArray[visitedTiles[i].row][visitedTiles[i].col].setOpacity(255);
       tileArray[visitedTiles[i].row][visitedTiles[i].col].picked = false;
     } else {
      // 連鎖しているコマの数は３つ以上
       globezLayer.removeChild(tileArray[visitedTiles[i].row][visitedTiles[i].col]);
       //消去する
       tileArray[visitedTiles[i].row][visitedTiles[i].col] = null;
     }
   }
   //連鎖を管理する配列を初期化
   visitedTiles = [];
 },
```
