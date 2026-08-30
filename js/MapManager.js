/**
 * Trình Quản Lý Bản Đồ 3D (Map Manager)
 */
class MapManager {
  constructor(scene) {
    this.scene = scene;
    this.currentMapId = 'cyber';
    this.mapObjects = [];
  }

  // Dọn dẹp bản đồ cũ khỏi Scene
  clear() {
    this.mapObjects.forEach(obj => this.scene.remove(obj));
    this.mapObjects = [];
  }

  // Khởi tạo bản đồ mới theo ID
  loadMap(mapId) {
    this.clear();
    this.currentMapId = mapId;
    
    switch (mapId) {
      case 'cyber':
        CyberNeonMap.build(this.scene, this.mapObjects);
        break;
      case 'desert':
        DesertOutpostMap.build(this.scene, this.mapObjects);
        break;
      case 'space':
        DeepSpaceMap.build(this.scene, this.mapObjects);
        break;
      case 'warehouse':
        WarehouseMap.build(this.scene, this.mapObjects);
        break;
    }
  }
}
