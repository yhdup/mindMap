import G6 from "@antv/g6";
export function nodeAdd(){
    G6.registerBehavior('click-add-node', {
        // Set the events and the corresponding responsing function for this behavior
        getEvents() {
          // The event is canvas:click, the responsing function is onClick
          return {
            'canvas:click': 'onClick',
          };
        },
        // Click event
        onClick(ev) {
          const self = this;
          const graph = self.graph;
          // Add a new node
          graph.addItem('node', {
            x: ev.canvasX,
            y: ev.canvasY,
            id: `node-${addedCount}`, // Generate the unique id
          });
          addedCount++;
        },
      });
}