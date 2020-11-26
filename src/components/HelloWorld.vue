<!--  -->
<template>
  <div>
    <div id="root">
      <div id="right">
        <div class="des">
          <h2>下方区域绘制流程图</h2>
          <p>说明: </p>
          <button @click="saveMind">保存</button>
          <button @click="deleteMindData">清空localstorage</button>
        </div>
        <div
          class="content"
          scope="yhd"
          style="position: relative"
          id="main"
          @click="reduceNode"
        >
          <div id="nodeMenu">
            <!-- 通过按钮控制部分 -->
            <div class="operateMenu">
              <!-- 数据集本集 -->
              <div
                class="node node5css"
                id="node5"
                title="数据集"
              ></div>
              <!-- 算法库控制按钮 -->
              <span
                class="algorithmButton"
                @mouseover="showAlgorithm"
                @mouseleave='hideAlgorithm'
              ></span>
            </div>
            <!-- 主体菜单部分 -->
            <!-- 算法库 -->
            <div
              class="algorithmLibrary"
              title="算法库"
              v-show="algorithmFlag"
              @mouseover="showAlgorithm"
              @mouseleave='hideAlgorithm'
            >
              <span class="collectionTitle">算法库</span>
              <div
                class="statisticalAnalysis"
                title="统计分析"
              >
                <span class="statisticalAnalysisTitle">统计分析</span>
                <div class="nodeCollection">
                  <div
                    class="node"
                    id="node1"
                    title="ols回归"
                  ></div>
                  <div
                    class="node node2css"
                    id="node2"
                    title="逐步回归"
                  ></div>
                  <div
                    class="node node3css"
                    id="node3"
                    title="逻辑回归"
                  ></div>
                  <div
                    class="node node4css"
                    id="node4"
                    title="线性回归"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  components: {},
  data () {
    return {
      // dataFlag: false, //数据集菜单显示判断，
      algorithmFlag: false, //算法库菜单显示判断，
      jsPlumb: null,
      nodeDes: "", //节点内的文字
      nodeCss: "", // 节点样式
      nodeId: "",
      // dynamicAnchors: [
      //  "Top", "Bottom" ,'Left',"Right"
      // ],
      // 起点锚点配置
      targetConfig: {
        isSource: false, //是否可以拖动（作为连线起点）
        isTarget: true, //是否可以放置（连线终点）
        maxConnections: -1,

      },
      // 终点锚点配置
      strartConfig: {
        isSource: true, //是否可以拖动（作为连线起点）
        isTarget: false, //是否可以放置（连线终点）
        maxConnections: -1,

      },
      // 节点记录
      /**
       * 思路20202826
       * nodeId，type 在节点增加的时候就可以赋值
       * 会有一个类似‘保存’的按钮
       * 点击按钮记录targetInfo，nodelevel
       *
       * 节点获取在拖动进来的时候，连线的获取在点击保存的时候
       *
       * 删除连线后不用对pageNodeData做任何操作
       * 因为点击保存时会重新获取线
       *
       * 删除节点后需要立即删除pageNodeData中的对应节点
       * 因为点击保存不会重新获取节点
       *
       * 保存是手动的 如果点击保存后再次操作，则保存的不是最新的
       * 新渲染的也是渲染点击保存那一刻的图
       */
      pageNodeData: [
        // {
        //   nodeId: "", //节点ID
        //   targetInfo: [{}], //该节点的指向节点的ID和类型
        //   type: "", //节点类型（基础节点中的哪一类）
        //   nodeLevel: "" //节点的级别（0 ：起点节点，1：有一个父节点，2：有两个父节点）
        //    posLeft:''定位--left
        //    posTop:""定位--top
        //  }
      ],
      storageData: {}
    };
  },
  created () { },
  mounted () {
    //  初始化jsplumb
    this.initMind();
    // 回显
    this.reShowMind();
    // 设置元素存放区域
    this.drapNodes();
    // 去掉连线
    this.reduceLine();
    // 设置左侧基础节点拖动
    this.basicDrags();
    // 不让同一个节点自我相连
    this.banLineNode();
  },
  computed: {},
  watch: {},
  methods: {
    // 初始化jsplumb
    initMind () {
      this.jsPlumb = this.$jsPlumb.getInstance({
        Container: "root", //选择器id
        //  Endpoint: ["Dot", { radius: 5, fill: "#ffffff" }],
        // anchor:[ "Perimeter", { shape:"Circle",anchorCount:20 } ],
        // Endpoint: [
        //   "Image ",
        //   { radius: 10, fill: "#ffffff", url: "../assets//arrow.png" }
        // ],
        Endpoint: "Dot",
        // anchor:[ "Perimeter", { shape:"Circle",anchorCount:150 } ],
        EndpointStyle: { radius: 4, fill: "#384452" },
        PaintStyle: {
          stroke: "#ffffff",
          strokeWidth: 1
        },
        HoverPaintStyle: { stroke: "#217FDF" }, // 连线默认悬停样式  默认为null
        maxConnections: -1,
        ConnectionOverlays: [
          [
            "Arrow",
            {
              location: 1,
              width: 11,
              length: 11,
              paintStyle: {
                // stroke: "#ffffff",
                fill: "#ffffff"
              }
            }
          ]
        ],
        Connector: [
          "Flowchart",
          {
            stub: [10, 10], //连接线最低长度
            gap: 10, //连接线与锚点的距离
            cornerRadius: 20, //连接线转角弧度
            alwaysRespectStubs: true
          }
        ] //要使用的默认连接器的类型：折线，流程等
        // DrapOptions: { cursor: "crosshair", zIndex: 2000 }
      });
    },
    // 回显函数
    reShowMind () {
      if (localStorage.getItem("pageNodeData")) {
        let getNodeArr = JSON.parse(localStorage.getItem("pageNodeData"))
          .mindData;
        console.log(getNodeArr);
        this.pageNodeData = getNodeArr;
        let that = this;
        let dom = "";
        let innerSpan = "";
        // 通过type给动态创建的节点绑定样式和文字描述
        getNodeArr.forEach(function (item) {
          switch (item.type) {
            case "node1": {
              that.nodeDes = "ols回归";
              that.nodeCss = "";
              break;
            }
            case "node2": {
              that.nodeDes = "逐步回归";
              that.nodeCss = "node2css";
              break;
            }
            case "node3": {
              that.nodeDes = "逻辑回归";
              that.nodeCss = "node3css";
              break;
            }
            case "node4": {
              that.nodeDes = "线性回归";
              that.nodeCss = "node4css";
              break;
            }
            case "node5": {
              that.nodeDes = "数据集";
              that.nodeCss = "node5css";
              break;
            }
          }
          // 动态创建DOM
          dom = document.createElement("div");
          // innerSpan = `${that.nodeDes}<span class="deleteNode">X</span>`;
          dom.innerText = that.nodeDes;
          dom.style.position = "absolute";
          dom.style.left = item.posLeft;
          dom.style.top = item.posTop;
          dom.id = item.nodeId;
          dom.style.width = 96 + "px";
          dom.style.height = 32 + "px";
          dom.style.backgroundPosition = "10px";
          dom.style.lineHeight = 26 + "px";
          dom.style.textAlign = "right";
          dom.style.fontSize = 14 + "px";
          dom.style.paddingRight = 10 + "px";
          dom.style.boxSizing = "border-box";
          // DOM插入
          document.getElementById("main").appendChild(dom);
          // DOM绑定类名
          dom.setAttribute("class", that.nodeCss);
          dom.classList.add("node");
          // DOM添加锚点
          that.addAnchor(item.nodeId);
          that.jsPlumb.draggable(item.nodeId, {
            scope: "yhd",
            containment: true,
            drag: function () { }
          });
        });
        // 添加连线  连线要在节点创建之后
        getNodeArr.forEach(item => {
          if (item.targetInfo.length) {
            item.targetInfo.forEach(utem => {
              // console.log(utem);
              // console.log(item.nodeId, utem.targetTo, "utem.targetTo");
              this.connectLine(item.nodeId, utem.targetTo, [
                utem.sourceAnchor,
                utem.targetAnchor
              ]);
            });
          }
        });
      }
    },
    // 设置节点连接规则
    banLineNode () {
      this.jsPlumb.bind("connection", function (info, originalEvent) {
        // console.log(12313)
        // console.log(info)
        var that = this;
        if (info.sourceId === info.targetId) {
          console.log("连接了同一个节点");
          this.deleteConnection(info.connection);
        }
      });
    },
    // 基础节点拖动克隆
    basicDrags () {
      let that = this;
      let nodeArr = Array.from(document.getElementsByClassName("node"));

      nodeArr.forEach(function (item) {
        that.jsPlumb.draggable(item.id, {
          clone: true,
          scope: "yhd",
          containment: true,
          drag: function () { }
        });
      });
    },
    // 设置元素存放 相关
    allDrop (e) {
      e.preventDefault();
    },
    drop (e) {
      e.preventDefault();
    },
    drapNodes () {
      let that = this;
      let areaId = document.getElementById("main");
      that.jsPlumb.droppable("main", {
        scope: "yhd",
        containment: true,
        drop: function (event, ui) {
          // console.log(event, ui, "+++++");
          event.drop.el.style.position = "relative";
          let tempCom = event.e.target.cloneNode(true);
          if (tempCom.id !== "null" && tempCom.id !== "") {
            return;
          }
          tempCom.style.left =
            parseInt(tempCom.style.left) -
            event.drop.el.getBoundingClientRect().left +
            "px";
          tempCom.style.top =
            parseInt(tempCom.style.top) -
            event.drop.el.getBoundingClientRect().top +
            "px";
          tempCom.style.width = 96 + "px";
          tempCom.style.height = 32 + "px";
          tempCom.style.backgroundPosition = "10px";
          tempCom.style.lineHeight = 26 + "px";
          tempCom.style.textAlign = "right";
          tempCom.style.fontSize = 14 + "px";
          tempCom.style.paddingRight = 10 + "px";
          tempCom.style.boxSizing = "border-box";
          //  console.log(tempCom.style.left);
          if (
            // 当元素未完全拖动进来
            parseInt(tempCom.style.left) < 0 ||
            parseInt(tempCom.style.top) < 0
          ) {
            // some code
          } else {
            // 给克隆元素绑定type
            /**
             *
             * 根据基础node的id来判断type
             * 克隆节点的源节点ID是event.drag.el.id
             *
             */
            let sourceNodeId = event.drag.el.id;
            switch (sourceNodeId) {
              case "node1": {
                that.nodeDes = "ols回归";
                tempCom.type = "node1";

                break;
              }
              case "node2": {
                tempCom.type = "node2";
                that.nodeDes = "逐步回归";
                break;
              }
              case "node3": {
                tempCom.type = "node3";
                that.nodeDes = "逻辑回归";
                break;
              }
              case "node4": {
                tempCom.type = "node4";
                that.nodeDes = "线性回归";
                break;
              }
              case "node5": {
                tempCom.type = "node5";
                that.nodeDes = "数据集";
              }
            }
            tempCom.innerText = that.nodeDes;
            // 给克隆元素绑定唯一ID 让其后续可拖拽
            tempCom.id =
              Math.random()
                .toString(36)
                .substr(2, 4) +
              Date.now()
                .toString(36)
                .substr(4, 5);
            // tempCom.setAttribute("className", "nodeOfClone");
            event.drop.el.appendChild(tempCom);
            that.jsPlumb.draggable(tempCom.id, {
              scope: "yhd",
              containment: true
            });
            that.addAnchor(tempCom.id);
            // 节点数据记录
            // 记录已有数据，初始化格式
            that.pageNodeData.push({
              nodeId: tempCom.id,
              type: tempCom.type,
              targetInfo: [],
              nodeLevel: "",
              posLeft: "",
              posTop: ""
            });
          }
        }
      });
    },
    // 设置元素增加锚点 上下左右四个
    addAnchor (ele) {
      //基本连接线样式
      var connectorPaintStyle = {
        // lineWidth: 4,
        // strokeStyle: "#61B7CF",
        // joinstyle: "round",
        // outlineColor: "white",
        // outlineWidth: 2
      };
      let that = this;
      that.jsPlumb.addEndpoint(
        ele,
        {
          anchors: ["Right"]
          // anchor: ["Perimeter", { shape: "Square", anchorCount: 150 }]
          // endpoint: "Dot",
          //  anchor:[ "Perimeter", { shape:"Square" } ]
        },
        that.strartConfig
      );
      that.jsPlumb.addEndpoint(
        ele,
        {
          anchors: ["Left"]
        },
        that.targetConfig
      );
      that.jsPlumb.addEndpoint(
        ele,
        {
          anchors: ["Top"]
        },
        that.targetConfig
      );
      that.jsPlumb.addEndpoint(
        ele,
        {
          anchors: ["Bottom"]
          // anchor: ["Perimeter", { shape: "Square", anchorCount: 150 }]
        },
        that.strartConfig
      );
    },
    // // 设置连接线
    connectLine (sourceId, targetId, anchorPoints) {
      this.jsPlumb.connect({
        source: sourceId,
        target: targetId,
        anchor: anchorPoints
      });
    },
    // 鼠标移入
    nodeHover (ele, type) {
      let that = this;
      // 鼠标移入右侧克隆节点
      if (type === "cloneNodes") {
        // some code
      }
      // 鼠标移入左侧基准节点
      else if (type === "basicNodes") {
        // console.log(ele.children[0]);
        ele.onmouseover = function () {
          // console.log("鼠标移入");
          // ele.children[0].style.display = "inline-block";
        };
      }
    },
    // 鼠标移出
    nodeMouseLeave (ele, type) {
      let that = this;
      // 鼠标移出右边克隆节点
      if (type === "cloneNode") {
        // some code
      }
      // 鼠标移出左边的几个基准节点
      else if (type === "basicNodes") {
        ele.onmouseleave = function () {
          // console.log("鼠标移出");
          // ele.children[0].style.display = "none";
        };
      }
    },
    // 点击 X 删除一个节点
    // 通过事件捕获
    // 删除节点后需要删除pageNodeData中的相应节点
    reduceNode (e) {
      var that = this;
      e.stopPropagation();
      e.preventDefault();
      // console.log(e.target);
      if (e.target.className === "deleteNode") {
        // console.log(e.target.parentNode.id);
        if (confirm("确定删除此节点吗？")) {
          that.jsPlumb.remove(e.target.parentNode.id);
          // 删除节点的同时删除pageNodeData中的该节点
          that.pageNodeData.forEach(function (item) {
            if (item.nodeId === e.target.parentNode.id) {
              // console.log(item);
              // console.log(that.pageNodeData.indexOf(item))
              that.pageNodeData.splice(that.pageNodeData.indexOf(item), 1);
              // this.pageNodeData
            }
          });
        }
      }
    },
    // 单击根据提示连线删除连线
    reduceLine () {
      var that = this;
      this.jsPlumb.bind("click", (conn, originalEvent) => {
        if (confirm("确定删除此线吗？")) {
          // console.log(conn)
          that.jsPlumb.deleteConnection(conn);
        }
      });
    },
    // 点击保存按钮
    saveMind () {
      for (let i = 0; i < this.pageNodeData.length; i++) {
        this.pageNodeData[i].targetInfo = [];
      }
      console.log(this.jsPlumb.getAllConnections(), ">>>>>>");

      // 保存所有连线的起点终点
      let lineArr = [];
      this.jsPlumb.getAllConnections().forEach(function (item) {
        console.log(item.endpoints[1].anchor, "这是终点");
        console.log(item.endpoints[0].anchor, "这是起点");
        lineArr.push({
          targetId: item.targetId,
          sourceId: item.sourceId,
          // targetAnchor: item.endpoints[1].anchor.anchors
          //   ? item.endpoints[1].anchor.anchors[0].type
          //   : item.endpoints[1].anchor.type,
          // // item.endpoints[1].anchor.anchors[0].type,
          // sourceAnchor: item.endpoints[0].anchor.anchors
          //   ? item.endpoints[0].anchor.anchors[0].type
          //   : item.endpoints[0].anchor.type
          targetAnchor: item.endpoints[1].anchor.anchors[0].type,
          // item.endpoints[1].anchor.anchors[0].type,
          sourceAnchor:
            item.endpoints[0].anchor.anchors.length > 1
              ? item.endpoints[0].anchor.anchors[1].type
              : item.endpoints[0].anchor.anchors[0].type
        });
      });
      console.log(lineArr);
      // 将连线起点终点保存给对应节点
      this.pageNodeData.forEach(function (item) {
        lineArr.forEach(function (utem) {
          if (item.nodeId === utem.sourceId) {
            item.targetInfo.push({
              targetTo: utem.targetId,
              sourceAnchor: utem.sourceAnchor,
              targetAnchor: utem.targetAnchor
            });
          }
        });
      });
      // 获取每个节点的定位信息
      let nodeArr = Array.from(document.getElementById("main").children);
      // console.log(nodeArr);
      this.pageNodeData.forEach(function (item) {
        nodeArr.forEach(function (utem) {
          if (item.nodeId === utem.id) {
            item.posLeft = utem.style.left;
            item.posTop = utem.style.top;
          }
        });
      });

      // 每个导图应该都会有单独的ID 也应该存进localstorage中
      let storageData = {
        mindData: this.pageNodeData
      };

      // console.log(storageData);
      localStorage.setItem("pageNodeData", JSON.stringify(storageData));
      console.log(this.pageNodeData);
    },
    // 清除localstorage
    deleteMindData () {
      localStorage.removeItem("pageNodeData");
    },
    // 点击打开算法库菜单
    showAlgorithm () {
      console.log(112233);
      this.algorithmFlag = true
    },
    hideAlgorithm () {
      this.algorithmFlag = false

    }
  }
};
</script>
<style lang='scss' >
body {
  text-align: center;
}
#root {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: space-between;
}

#nodeMenu {
  position: absolute;
  left: 0;
  top: 0;
  .operateMenu {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }
  .algorithmButton {
    display: inline-block;
    background: url("../assets/algorithmIcon.svg") no-repeat;
    background-size: 16px 16px;
    width: 26px;
    height: 26px;
    background-position: center;
    color: #fff;
    background-color: #384452;
    margin-top: 8px;
  }
  //公共样式，基础节点集合
  .nodeCollection {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
  }
  // 公共样式 主title
  .collectionTitle {
    display: block;
    width: 100%;
    height: 32px;
    background-color: #27303a;
    font-size: 14px;
    text-align: center;
    line-height: 32px;
    color: #fff;
    background-color: #384452;
  }
  // 公共样式 算法库子集title
  .childTitle {
    display: block;
    width: 100%;
    height: 32px;
    background-color: #27303a;
    font-size: 14px;
    text-align: center;
    line-height: 32px;
  }
  // 算法库
  .algorithmLibrary {
    height: 50vh;
    // border: 2px solid darkgray;
    box-sizing: border-box;
    background-color: #27303a;
    width: 170px;
    color: #fff;
    // 算法库title
    .algorithmLibraryTitle {
      display: block;
      width: 100%;
      height: 32px;
      background-color: #27303a;
      font-size: 14px;
      text-align: center;
      line-height: 32px;
    }
    .statisticalAnalysis {
      padding: 8px;
      text-align: left;
      .statisticalAnalysisTitle {
        text-align: left;
        color: #fff;
        font-size: 14px;
        margin-bottom: 7px;
        display: block;
      }
      color: #fff;
    }
  }
  // 数据集
  .dataSet {
    width: 170px;
  }
}

.node {
  text-align: center;
  z-index: 20;
  background-color: #eeeeef;
  color: black;
  padding: 3px;
  cursor: pointer;
  background: url("../assets/olsRegression.svg") no-repeat;
  background-size: 16px 16px;
  width: 20px;
  height: 20px;
  background-position: center;
  color: #fff;
  // position: absolute;
  background-color: #384452;
  // margin-top: 5px;
  // margin-left: 8px;
}
.node:hover {
  // box-shadow: 2px 2px 19px #444;
  // opacity: 0.8;
  // filter: alpha(opacity=80);
}
.node2css {
  // background: orange;
  top: 150px;
  background: url("../assets/stepwiseRegression.svg") no-repeat;
  background-size: 16px 16px;
  background-color: #384452;
  background-position: center;
}
.node3css {
  background: url("../assets/logisticRegression.svg") no-repeat;
  background-size: 16px 16px;
  background-color: #384452;
  background-position: center;
  top: 250px;
}
.node4css {
  background: url("../assets/linerRegression.svg") no-repeat;
  background-size: 16px 16px;
  background-color: #384452;
  background-position: center;
  top: 350px;
}
.node5css {
  background: url("../assets/icon／数据.svg") no-repeat;
  background-size: 16px 16px;
  background-color: #384452;
  background-position: center;
  top: 350px;
}

#right {
  width: 100%;
  height: 100vh;
  border: 2px solid olivedrab;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  .des {
    height: 10%;
    padding: 8px;
    
    h2 {
      margin: 0;
      padding: 0;
    }
    p {
      margin: 8px;
      padding: 0;
      
    }
  }
}

.content {
  border-top: 1px solid darkgrey;
}

#myDropDown {
  width: 80px;
  height: 30px;
  border: 2px solid blue;
}
#main {
  width: 100%;
  height: 90%;
  border: 1px solid red;
  background-color: #1b2128;
  position: relative;
}

// 克隆节点01
.nodeOfClone {
  display: inline-block;
  box-shadow: 2px 2px 19px #aaa;
  border-radius: 6px;
  opacity: 0.8;
  filter: alpha(opacity=80);
  border: 1px solid #346789;
  width: 150px;
  text-align: center;
  z-index: 19;
  background-color: #eeeeef;
  color: black;
  padding: 10px;
  font-size: 9pt;
  cursor: pointer;
  height: 50px;
  /*line-height: 50px;*/
  background: lightskyblue;
  position: absolute;
  left: 300px;
  top: 0;
}

// 基准节点中的按钮样式
.node .nodeAdd {
  float: right;
  display: inline-block;
  font-size: 25px;
  transform: translate(50%, -50%);
  display: none;
}
.node .nodeReduce {
  display: none;
}
.nodeOfClone {
  width: 200px;
  height: 20px;
  background-color: #ccc;
}
#node1 .deleteNode {
  display: none;
}
#node2 .deleteNode {
  display: none;
}
#node3 .deleteNode {
  display: none;
}
#node4 .deleteNode {
  display: none;
}
.deleteNode {
  font-size: 18px;
  display: inline-block;
  float: right;
  transform: translate(50%, -50%);
}
</style>