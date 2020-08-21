<!--  -->
<template>
  <div class="mindZoom">
    <div id="mindZoom">
      <p id="node1" class="node"></p>
      <p id="node2" class="node"></p>
    </div>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {
      jsPlumb: null
    };
  },
  created() {
    this.jsPlumb = this.$jsPlumb;
  },
  mounted() {
      this.dragNodes()
  },
  computed: {},
  watch: {},
  methods: {
    dragNodes() {
        let that = this
      that.jsPlumb.ready(function() {
        that.jsPlumb.connect({
          source: "node1",
          target: "node2",
          endpoint: "Rectangle"
        });

        that.jsPlumb.draggable("node1");
       that.jsPlumb.draggable("node2");
      });
    }
  }
};
</script>
<style lang='scss' scoped>
#mindZoom {
  width: 50vw;
  height: 50vh;
  background-color: rgba(223, 223, 223, 0.5);
  .node {
      position: absolute;
    width: 100px;
    height: 60px;
    border: 1px solid #000;
   
  }
}
</style>