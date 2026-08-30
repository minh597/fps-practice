class MapManager {
  constructor(scene) {
    this.scene = scene;
    this.mapObjects = [];
  }

  clear() {
    this.mapObjects.forEach(obj => this.scene.remove(obj));
    this.mapObjects = [];
  }

  loadMap(mapId) {
    this.clear();
    switch (mapId) {
      case 'cyber': CyberNeonMap.build(this.scene, this.mapObjects); break;
      case 'desert': DesertOutpostMap.build(this.scene, this.mapObjects); break;
      case 'space': DeepSpaceMap.build(this.scene, this.mapObjects); break;
      case 'warehouse': WarehouseMap.build(this.scene, this.mapObjects); break;
    }
  }
}
