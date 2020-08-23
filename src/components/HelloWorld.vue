<!--  -->
<template>
  <div>
    <div id="root">
      <div id="left">
        <div class="node" id="node1">
          流程1
          <!-- <span class="nodeAdd">+</span>
          <span class="nodeReduce">X</span>-->
        </div>
        <div class="node node2css" id="node2">流程2</div>
        <div class="node node3css" id="node3">流程3</div>
        <div class="node node4css" id="node4">流程4</div>
      </div>
      <div id="right">
        <h2>下方区域绘制流程图</h2>
        <div class="content" scope="yhd" style="position: relative" id="main" @click="reduceNode"></div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  components: {},
  data() {
    return {
      jsPlumb: null,
      uniqueId: 0, //给克隆节点绑定唯一ID
      targetConfig: {
        isSource: false, //是否可以拖动（作为连线起点）
        isTarget: true //是否可以放置（连线终点）
      },
      strartConfig: {
        isSource: true, //是否可以拖动（作为连线起点）
        isTarget: false //是否可以放置（连线终点）
      }
    };
  },
  created() {},
  mounted() {
    //  初始化jsplumb
    this.jsPlumb = this.$jsPlumb.getInstance({
      Container: "root", //选择器id
      // EndpointStyle: { radius: 8, fill: "#acd" }, //端点样式
      Endpoint: ["Dot", { radius: 10, fill: "#acd" }],
      // Endpoint: ["Image", { src: "../assets/logo.png"}],
      // Endpoint: ["Image", { src: "../assets/aaa.png",cssClass:'imgs'}],
      // Endpoint:'Blank',
      PaintStyle: { stroke: "#000000", strokeWidth: 2 }, // 绘画样式，默认8px线宽  #456
      HoverPaintStyle: { stroke: "#1E90FF" }, // 默认悬停样式  默认为null
      // EndpointHoverStyle: { fill: "#F00", radius: 6 }, // 端点悬停样式
      // isSource: true, //是否可以拖动（作为连线起点）
      // isTarget: true, //是否可做为终点
      maxConnections: -1,
      ConnectionOverlays: [
        [
          "Arrow",
          {
            location: 1,
            paintStyle: {
              stroke: "#00688B",
              fill: "#00688B"
            }
          }
        ]
      ],
      Connector: [
        "Bezier",
        {
          stub: [80, 120],
          gap: 10,
          cornerRadius: 80,
          alwaysRespectStubs: true
        }
      ] //要使用的默认连接器的类型：折线，流程等
      // DrapOptions: { cursor: "crosshair", zIndex: 2000 }
    });
    // 设置元素存放区域
    this.drapNodes();
    this.nodeHover(node1, "basicNodes");
    this.nodeMouseLeave(node1, "basicNodes");
    // // 增加基本node中的第一种
    // this.addNode(node1.children[0], node1);
    // 去掉连线
    this.reduceLine();
    // 设置左侧基础节点拖动
    this.basicDrags();
  },
  computed: {},
  watch: {},
  methods: {
    // 基础节点拖动
    basicDrags() {
      let that = this;
      let nodeArr = Array.from(document.getElementsByClassName("node"));
      // console.log(nodeArr);
      nodeArr.forEach(function(item) {
        // console.log(item.id);
        that.jsPlumb.draggable(item.id, {
          // helper: "clone",
          clone: true,
          scope: "yhd",
          containment: true,
          drag: function() {
            // console.log(123123);
          }
        });
      });
    },
    // 克隆节点拖动
    // dragNodes(ele) {
    //   let that = this;
    //   that.jsPlumb.draggable(ele, {
    //       scope: "yhd",
    //     drag: function() {
    //       // console.log(123123);
    //     }
    //   });
    // },
    // 设置元素存放
    allDrop(e) {
      // console.log(object)
      e.preventDefault();
    },

    drop(e) {
      e.preventDefault();
      console.log(e, "------------");
    },

    drapNodes() {
      let that = this;
      let areaId = document.getElementById("main");
      that.jsPlumb.droppable("main", {
        scope: "yhd",
        containment: true,
        drop: function(event, ui) {
          console.log(event, ui, "+++++");
          event.drop.el.style = "position:relative";
          let tempCom = event.e.target.cloneNode(true);
          console.log(tempCom, 888888888);
          if (tempCom.id !== "null") {
            return;
          }
          // console.log(
          //   parseInt(tempCom.style.top),
          //   event.drop.el.getBoundingClientRect()
          // );
          tempCom.style.left =
            parseInt(tempCom.style.left) -
            event.drop.el.getBoundingClientRect().left +
            "px";
          tempCom.style.top =
            parseInt(tempCom.style.top) -
            event.drop.el.getBoundingClientRect().top +
            "px";
          // console.log(tempCom.style.left);
          if (
            parseInt(tempCom.style.left) < 0 ||
            parseInt(tempCom.style.top) < 0
          ) {
          } else {
            that.uniqueId++;
            tempCom.id = "cloneNode" + that.uniqueId;
            console.log(tempCom);
            event.drop.el.append(tempCom);
            // if (tempCom.id) {
            that.jsPlumb.draggable(tempCom.id, {
              // helper: "clone"
              scope: "yhd",
              containment: true
            });
            //   return;
            // }
            that.addConnect(tempCom.id);
            console.log(tempCom, "123");
            // that.addConnect(tempCom);

            // that.jsPlumb.draggable(tempCom.id, {
            //   // helper: "clone"
            //   scope: "yhd",
            //   containment: true,
            //   drag: function() {
            //     // console.log(123123);
            //   }
            // });
          }
        }
      });
    },
    // 设置元素增加连接点 上下左右四个
    addConnect(ele) {
      //基本连接线样式
      var connectorPaintStyle = {
        lineWidth: 4,
        strokeStyle: "#61B7CF",
        joinstyle: "round",
        outlineColor: "white",
        outlineWidth: 2
      };
      let that = this;
      that.jsPlumb.addEndpoint(
        ele,
        {
          anchors: ["Right"]
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
        },
        that.strartConfig
      );
    },
    // 设置连接线
    connectLine(ele) {
      let that = this;
      that.jsPlumb.makeSource(ele, {
        anchor: ["Bottom"],
        allowLoopback: false,
        maxConnections: 1
      });
      that.jsPlumb.makeTarget(ele, {
        anchor: ["Top"],
        allowLoopback: false,
        maxConnections: 1
      });
    },
    // 鼠标移入
    nodeHover(ele, type) {
      let that = this;
      // 鼠标移入右侧克隆节点
      if (type === "cloneNodes") {
        // some code
      }
      // 鼠标移入左侧基准节点
      else if (type === "basicNodes") {
        // console.log(ele.children[0]);
        ele.onmouseover = function() {
          console.log("鼠标移入");
          // ele.children[0].style.display = "inline-block";
        };
      }
    },
    // 鼠标移出
    nodeMouseLeave(ele, type) {
      let that = this;
      // 鼠标移出右边克隆节点
      if (type === "cloneNode") {
        // some code
      }
      // 鼠标移出左边的几个基准节点
      else if (type === "basicNodes") {
        ele.onmouseleave = function() {
          console.log("鼠标移出");
          // ele.children[0].style.display = "none";
        };
      }
    },
    // 点击 + 增加一个节点
    // addNode(ele, node) {
    // let that = this;
    // ele.onclick = function() {
    //   that.uniqueId++;
    //   let cloneNode = node.cloneNode(true);
    //   cloneNode.setAttribute("class", "nodeOfClone");
    //   cloneNode.setAttribute("id", `nodeOfClone ${that.uniqueId}`);
    //  console.log(cloneNode,'cloneNode')
    //  document.getElementById("main").appendChild(cloneNode);
    //   console.log(that.jsPlumb);
    //   Array.from(document.getElementsByClassName("nodeOfClone")).forEach(
    //     item => {
    //       console.log(item.id);
    //       that.dragNodes(item.id);
    //       // that.connectLine(item)
    //       that.addConnect(item.id);
    //     }
    //   );
    // };
    // },
    // 点击 X 删除一个节点
    // 通过事件捕获做的
    reduceNode(e) {
      var that = this;
      e.stopPropagation();
      e.preventDefault();
      if (e.target.className === "nodeReduce") {
        that.jsPlumb.remove(e.target.parentNode.id);
      }
    },
    // 单击根据提示连线删除连线
    reduceLine() {
      var that = this;
      this.jsPlumb.bind("click", function(conn, originalEvent) {
        console.log(123);
        if (confirm("确定删除此线吗？")) {
          console.log(that.jsPlumb);
          that.jsPlumb.deleteConnection(conn);
        }
      });
    }
  }
};
</script>
<style lang='scss' scoped>
body {
  text-align: center;
}
#root {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: space-between;
}

#left {
  width: 243px;
  height: 50vh;
  padding: 32px;
  border: 2px solid darkgray;
  box-sizing: border-box;
  // display: flex;
  // flex-flow: column;
  // justify-content: space-between;
}

.node {
  box-shadow: 2px 2px 19px #aaa;
  border-radius: 6px;
  opacity: 0.8;
  filter: alpha(opacity=80);
  border: 1px solid #346789;
  width: 150px;
  text-align: center;
  z-index: 20;
  background-color: #eeeeef;
  color: black;
  padding: 10px;
  font-size: 9pt;
  cursor: pointer;
  height: 50px;
  /*line-height: 50px;*/
  background: lightskyblue;
  position: absolute;
}

.node:hover {
  box-shadow: 2px 2px 19px #444;
  opacity: 0.8;
  filter: alpha(opacity=80);
}
.node2css {
  background: orange;
  top: 150px;
}
.node3css {
  background: indianred;
  top: 250px;
}
.node4css {
  background: greenyellow;
  top: 350px;
}

#right {
  width: calc(100% - 260px);
  height: 100vh;
  border: 2px solid olivedrab;
  box-sizing: border-box;
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
  height: calc(100% - 75px);
  border: 1px solid red;
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

// 克隆节点中的删除按钮样式
// .nodeOfClone .nodeReduce {
//   float: right;
//   display: inline-block;
//   font-size: 15px;
//   transform: translate(50%, -50%);
// }

// .nodeOfClone .nodeAdd {
//   display: none;
// }
// .imgs {
//   width: 20px;
//   height: 40px;
// }
.nodeOfClone {
  width: 200px;
  height: 20px;
  background-color: #ccc;
}
</style>