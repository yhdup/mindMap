<!--  -->
<template>
  <div>
    <div id="root">
      <div id="left">
        <div class="node" id="node1">
          流程1
          <span class="deleteNode">X</span>
        </div>
        <div class="node node2css" id="node2">
          流程2
          <span class="deleteNode">X</span>
        </div>
        <div class="node node3css" id="node3">
          流程3
          <span class="deleteNode">X</span>
        </div>
        <div class="node node4css" id="node4">
          流程4
          <span class="deleteNode">X</span>
        </div>
      </div>
      <div id="right">
        <h2>下方区域绘制流程图</h2>
        <button @click="saveMind">保存</button>
        <button @click="deleteMindData">清空localstorage</button>
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
      nodeDes: "", //节点内的文字
      nodeCss: "", // 节点样式
      nodeId: "",
      // 起点锚点配置
      targetConfig: {
        isSource: false, //是否可以拖动（作为连线起点）
        isTarget: true, //是否可以放置（连线终点）
        maxConnections: -1
      },
      // 终点锚点配置
      strartConfig: {
        isSource: true, //是否可以拖动（作为连线起点）
        isTarget: false, //是否可以放置（连线终点）
        maxConnections: -1
      },
      // 节点记录
      /**
       * 思路20202826
       * nodeId，type 在节点增加的时候就可以赋值
       * 会有一个类似‘保存’的按钮
       * 点击按钮记录targetId，nodelevel
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
        //   targetId: [{}], //该节点的指向节点的ID和类型
        //   type: "", //节点类型（基础节点中的哪一类）
        //   nodeLevel: "" //节点的级别（0 ：起点节点，1：有一个父节点，2：有两个父节点）
        //    posLeft:''定位--left
        //    posTop:""定位--top
        //  }
      ],
      storageData: {}
    };
  },
  created() {},
  mounted() {
    //  初始化jsplumb
    this.jsPlumb = this.$jsPlumb.getInstance({
      Container: "root", //选择器id
      Endpoint: ["Dot", { radius: 10, fill: "#acd" }],
      PaintStyle: { stroke: "#000000", strokeWidth: 2 }, // 绘画样式，默认8px线宽  #456
      HoverPaintStyle: { stroke: "#1E90FF" }, // 默认悬停样式  默认为null
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
        "Flowchart",
        {
          // stub: [80, 120],
          // gap: 10,
          // cornerRadius: 80,
          alwaysRespectStubs: true
        }
      ] //要使用的默认连接器的类型：折线，流程等
      // DrapOptions: { cursor: "crosshair", zIndex: 2000 }
    });

    // 回显

    if (localStorage.getItem("pageNodeData")) {
      let getNodeArr = JSON.parse(localStorage.getItem("pageNodeData"))
        .mindData;
      console.log(getNodeArr);
      let that = this;
      let dom = "";
      let innerSpan = "";
      // 通过type给动态创建的节点绑定样式和文字描述
      getNodeArr.forEach(function(item) {
        switch (item.type) {
          case "node1": {
            that.nodeDes = "节点1";
            that.nodeCss = "";
            break;
          }
          case "node2": {
            that.nodeDes = "节点2";
            that.nodeCss = "node2css";
            break;
          }
          case "node3": {
            that.nodeDes = "节点3";
            that.nodeCss = "node3css";
            break;
          }
          case "node4": {
            that.nodeDes = "节点4";
            that.nodeCss = "node4css";
            break;
          }
        }
        // 动态创建DOM
        dom = document.createElement("div");
        innerSpan = `${that.nodeDes}<span class="deleteNode">X</span>`;
        dom.innerHTML = innerSpan;
        dom.style.position = "absolute";
        dom.style.left = item.posLeft;
        dom.style.top = item.posTop;
        dom.id = item.nodeId;
        // DOM插入
        document.getElementById("main").appendChild(dom);
        // DOM绑定类名
        dom.setAttribute("class", that.nodeCss);
        dom.classList.add("node");
        // DOM添加锚点
        that.addConnect(item.nodeId);
        that.jsPlumb.draggable(item.nodeId, {      
          scope: "yhd",
          containment: true,
          drag: function() {}
        });
        // DOM添加初始连线
        if (item.targetId.length) {
          item.targetId.forEach(function(utem) {
            console.log(item.nodeId, utem.targetTo, "utem.targetTo");
            that.jsPlumb.connect({
              source: item.nodeId,
              target: utem.targetTo
            });
          });
        }
      });
    }

    //   this.$nextTick(function() {
    //     this.jsPlumb.connect({
    //       scope: "yhd",
    //       source: "cloneNode1",
    //       target: "cloneNode2 "
    //     });
    //   });
    // console.log(this.jsPlumb);
    // 设置元素存放区域
    this.drapNodes();
    // 去掉连线
    this.reduceLine();
    // 设置左侧基础节点拖动
    this.basicDrags();

// 不让同一个节点自我相连  
// 可用作后期的指定节点不能相互连接

  this.jsPlumb.bind('connection',function(info,originalEvent){
    // console.log(12313)
    // console.log(info)
    var that = this
    if(info.sourceId === info.targetId){
      console.log('连接了同一个节点');
      this.deleteConnection(info.connection)
      }
  })

  },
  computed: {},
  watch: {},
  methods: {
    // 基础节点拖动
    basicDrags() {
      let that = this;
      let nodeArr = Array.from(document.getElementsByClassName("node"));
      nodeArr.forEach(function(item) {
        that.jsPlumb.draggable(item.id, {
          clone: true,
          scope: "yhd",
          containment: true,
          drag: function() {}
        });
      });
    },
    // 设置元素存放
    allDrop(e) {
      // console.log(object)
      e.preventDefault();
    },
    drop(e) {
      e.preventDefault();
    },
    drapNodes() {
      let that = this;
      let areaId = document.getElementById("main");
      that.jsPlumb.droppable("main", {
        scope: "yhd",
        containment: true,
        drop: function(event, ui) {
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
            // console.log(sourceNodeId);
            switch (sourceNodeId) {
              case "node1": {
                tempCom.type = "node1";
                break;
              }
              case "node2": {
                tempCom.type = "node2";
                break;
              }
              case "node3": {
                tempCom.type = "node3";
                break;
              }
              case "node4": {
                tempCom.type = "node4";
                break;
              }
            }
            // 给克隆元素绑定唯一ID 让其后续可拖拽
            console.log(event.drop.el, " event.drop.el");
      
            tempCom.id = Math.random().toString(36).substr(2,4) +  Date.now().toString(36).substr(4,5);;
            // tempCom.setAttribute("className", "nodeOfClone");
            event.drop.el.appendChild(tempCom);
            that.jsPlumb.draggable(tempCom.id, {
              scope: "yhd",
              containment: true
            });
            that.addConnect(tempCom.id);
            // 节点数据记录
            // 记录已有数据，初始化格式
            that.pageNodeData.push({
              nodeId: tempCom.id,
              type: tempCom.type,
              targetId: [],
              nodeLevel: "",
              posLeft: "",
              posTop: ""
            });
            // console.log(that.pageNodeData, "that.pageNodeData");
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
          anchors: ["Right"],
          uuid: ele
        },
        that.strartConfig
      );
      that.jsPlumb.addEndpoint(
        ele,
        {
          anchors: ["Left"],
          uuid: ele
        },
        that.targetConfig
      );
      that.jsPlumb.addEndpoint(
        ele,
        {
          anchors: ["Top"],
          uuid: ele
        },
        that.targetConfig
      );
      that.jsPlumb.addEndpoint(
        ele,
        {
          anchors: ["Bottom"],
          uuid: ele
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
          // console.log("鼠标移入");
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
          // console.log("鼠标移出");
          // ele.children[0].style.display = "none";
        };
      }
    },
    // 点击 X 删除一个节点
    // 通过事件捕获
    // 删除节点后需要删除pageNodeData中的相应节点
    reduceNode(e) {
      var that = this;
      e.stopPropagation();
      e.preventDefault();
      // console.log(e.target);
      if (e.target.className === "deleteNode") {
        console.log(e.target.parentNode.id);

        if (confirm("确定删除此节点吗？")) {
          that.jsPlumb.remove(e.target.parentNode.id);
          // 删除节点的同时删除pageNodeData中的该节点
          that.pageNodeData.forEach(function(item) {
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
    reduceLine() {
      var that = this;
      this.jsPlumb.bind("click", (conn, originalEvent) => {
        // console.log(originalEvent);
        // console.log(conn.sourceId, conn.targetId);
        if (confirm("确定删除此线吗？")) {
          // console.log(that.jsPlumb);
          console.log(conn)
          that.jsPlumb.deleteConnection(conn);
        }
      });
    },
    // 保存按钮
    saveMind() {
      for (let i = 0; i < this.pageNodeData.length; i++) {
        this.pageNodeData[i].targetId = [];
      }
      // console.log(this.jsPlumb.getAllConnections(), ">>>>>>");
      // 保存所有连线的起点终点
      let lineArr = [];
      this.jsPlumb.getAllConnections().forEach(function(item) {
        lineArr.push({
          targetId: item.targetId,
          sourceId: item.sourceId
        });
      });
      // 将连线起点终点保存给对应节点
      this.pageNodeData.forEach(function(item) {
        lineArr.forEach(function(utem) {
          if (item.nodeId === utem.sourceId) {
            item.targetId.push({ targetTo: utem.targetId });
          }
        });
      });

      // 获取每个节点的定位信息
      let nodeArr = Array.from(document.getElementById("main").children);
      // console.log(nodeArr);
      this.pageNodeData.forEach(function(item) {
        nodeArr.forEach(function(utem) {
          if (item.nodeId === utem.id) {
            item.posLeft = utem.style.left;
            item.posTop = utem.style.top;
            // item.targetId.push({ targetTo: utem.targetId });
          }
        });
      });

      // 每个导图应该都会有单独的ID 也应该存进localstorage中
      let storageData = {
        mindData: this.pageNodeData
      };

      console.log(storageData);
      localStorage.setItem("pageNodeData", JSON.stringify(storageData));
      console.log(this.pageNodeData);
    },
    deleteMindData() {
      localStorage.removeItem("pageNodeData");
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

#left {
  width: 243px;
  height: 50vh;
  padding: 32px;
  border: 2px solid darkgray;
  box-sizing: border-box;
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