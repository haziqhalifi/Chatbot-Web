/**
 * Map Controller Utility
 * Executes map commands received from the AI assistant
 * Works with ArcGIS MapView that's already initialized
 */

export class MapController {
  constructor(mapViewData) {
    // mapViewData should be the ArcGIS view object, not a wrapper
    this.view = mapViewData;
    this.map = mapViewData?.map;
    this.graphicsLayer = null;
    this.store = {
      results: new Map(),
      buffers: new Map(),
    };

    console.log('MapController initialized with view:', this.view);
  }

  /**
   * Execute a list of map commands
   * @param {Array} commands - Array of command objects with function and arguments
   * @returns {Promise<Array>} Results of command executions
   */
  async executeCommands(commands) {
    if (!commands || !Array.isArray(commands)) {
      return [];
    }

    // Log the raw commands received from OpenAI
    console.group('🗺️ OpenAI Map Commands Execution');
    console.log('📥 Raw commands received from OpenAI:');
    console.log(JSON.stringify(commands, null, 2));
    console.log(`📊 Total commands to execute: ${commands.length}`);
    console.groupEnd();

    const results = [];
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      console.group(`🔧 Executing Command ${i + 1}/${commands.length}: ${command.function}`);
      console.log('📋 Command Details:');
      console.log(JSON.stringify(command, null, 2));

      try {
        const result = await this.executeCommand(command.function, command.arguments);
        console.log('✅ Execution successful');
        console.log('📤 Result:', JSON.stringify(result, null, 2));
        results.push({
          function: command.function,
          success: true,
          result: result,
        });
      } catch (error) {
        console.error(`❌ Error executing ${command.function}:`, error);
        results.push({
          function: command.function,
          success: false,
          error: error.message,
        });
      }
      console.groupEnd();
    }

    // Summary of execution
    console.group('📊 Execution Summary');
    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.length - successCount;
    console.log(`✅ Successful: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log('📄 Full results:', JSON.stringify(results, null, 2));
    console.groupEnd();

    return results;
  }

  /**
   * Execute a single map command
   */
  async executeCommand(functionName, args) {
    if (!this.view) {
      throw new Error('Map view not initialized');
    }

    console.log(`⚡ Executing: ${functionName}`);
    console.log('📥 Arguments:', JSON.stringify(args, null, 2));

    switch (functionName) {
      case 'Zoom':
        return await this.zoom(args.direction);

      case 'Pan':
        return await this.pan(args.direction);

      case 'ToggleLayer':
        return await this.toggleLayer(args.layer, args.visible);

      case 'Search':
        return await this.search(args.place);

      case 'ToggleBasemap':
        return await this.toggleBasemap(args.basemap_id);

      case 'Clear':
        return await this.clear();

      case 'DescribeMap':
        return await this.describeMap(args.option);

      default:
        console.warn(`Map command not yet fully implemented: ${functionName}`);
        return { message: `Command ${functionName} queued (implementation pending)`, args };
    }
  }

  // ============================================================
  // MAP COMMAND IMPLEMENTATIONS
  // ============================================================

  async zoom(direction) {
    const dir = String(direction || '').toLowerCase();
    const currentZoom = this.view.zoom;
    let newZoom;

    if (dir === 'in') {
      newZoom = currentZoom + 1;
    } else if (dir === 'out') {
      newZoom = currentZoom - 1;
    } else if (dir === 'default') {
      newZoom = 11; // Default zoom
    } else {
      newZoom = currentZoom;
    }

    await this.view.goTo({ zoom: newZoom });
    const result = { zoom: newZoom, message: `Zoomed ${direction}` };
    console.log(`🔍 Zoom result:`, JSON.stringify(result, null, 2));
    return result;
  }

  async pan(direction) {
    const dir = String(direction || '').toLowerCase();
    const step = 0.25; // degrees

    const center = this.view.center.clone();

    const moves = {
      left: [-step, 0],
      right: [step, 0],
      up: [0, step],
      down: [0, -step],
      'up-right': [step, step],
      'up-left': [-step, step],
      'down-right': [step, -step],
      'down-left': [-step, -step],
    };

    if (!moves[dir]) {
      throw new Error(`Invalid pan direction: ${direction}`);
    }

    const [dx, dy] = moves[dir];
    center.longitude += dx;
    center.latitude += dy;

    await this.view.goTo({ center });
    const result = {
      message: `Panned ${direction}`,
      newCenter: { longitude: center.longitude, latitude: center.latitude },
    };
    console.log(`🧭 Pan result:`, JSON.stringify(result, null, 2));
    return result;
  }

  async toggleLayer(layerName, visible) {
    const layer = this.findLayer(layerName);

    if (!layer) {
      throw new Error(`Layer not found: ${layerName}`);
    }

    layer.visible = Boolean(visible);
    const result = {
      layer: layer.title,
      visible: visible,
      message: `Layer ${layer.title} ${visible ? 'shown' : 'hidden'}`,
    };
    console.log(`🗂️ ToggleLayer result:`, JSON.stringify(result, null, 2));
    return result;
  }

  async search(place) {
    try {
      const normalized = this.normalizePlace(place);
      console.log(`Searching for: ${normalized}`);

      // Use ArcGIS Geocoding service
      const locatorModule = await import('@arcgis/core/rest/locator.js');
      const locator = locatorModule.default || locatorModule;

      const geocodeServiceUrl =
        'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer';

      const results = await locator.addressToLocations(geocodeServiceUrl, {
        address: { SingleLine: normalized },
        maxLocations: 1,
      });

      if (results && results.length > 0) {
        const location = results[0].location;

        // Zoom to location
        await this.view.goTo({
          center: [location.longitude, location.latitude],
          zoom: 13,
        });

        // Add a marker
        await this.addMarker(location.longitude, location.latitude, normalized);

        const result = {
          found: true,
          place: normalized,
          coordinates: { longitude: location.longitude, latitude: location.latitude },
          message: `Found and zoomed to ${normalized}`,
        };
        console.log(`🔍 Search result:`, JSON.stringify(result, null, 2));
        return result;
      } else {
        const result = { found: false, place: normalized, message: `Could not find ${normalized}` };
        console.log(`❌ Search result:`, JSON.stringify(result, null, 2));
        return result;
      }
    } catch (error) {
      console.error('Search failed:', error);
      throw new Error(`Search failed: ${error.message}`);
    }
  }

  async toggleBasemap(basemapId) {
    const id = String(basemapId || '').trim();
    if (!id) {
      throw new Error('Basemap id is empty');
    }

    this.map.basemap = id;
    const result = { basemap: id, message: `Switched to ${id} basemap` };
    console.log(`🗺️ ToggleBasemap result:`, JSON.stringify(result, null, 2));
    return result;
  }

  async describeMap(option) {
    const info = {
      center: this.view.center
        ? {
            longitude: this.view.center.longitude,
            latitude: this.view.center.latitude,
            wkid: this.view.center.spatialReference?.wkid,
          }
        : null,
      zoom: this.view.zoom,
      scale: this.view.scale,
      basemap: this.map.basemap?.id || this.map.basemap?.title || null,
      visibleLayers: this.map.layers
        .toArray()
        .filter((l) => l.visible)
        .map((l) => l.title || l.id),
    };

    const result = { ok: true, message: 'DescribeMap completed', data: info };
    console.log('📍 DescribeMap result:', JSON.stringify(result, null, 2));
    return result;
  }

  async clear() {
    if (this.graphicsLayer) {
      this.graphicsLayer.removeAll();
    }
    this.store.results.clear();
    this.store.buffers.clear();

    const result = { message: 'Cleared all graphics and selections' };
    console.log('🧹 Clear result:', JSON.stringify(result, null, 2));
    return result;
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  findLayer(layerName) {
    if (!layerName) return null;

    const name = String(layerName).trim();

    // Search through all layers
    return this.map.layers.find((l) => {
      const title = (l.title || '').toLowerCase();
      const id = (l.id || '').toLowerCase();
      const searchName = name.toLowerCase();

      return (
        title === searchName ||
        id === searchName ||
        title.includes(searchName) ||
        searchName.includes(title)
      );
    });
  }

  normalizePlace(place) {
    if (!place) return '';
    const p = String(place).trim();

    // Common abbreviations
    const normalizations = {
      kl: 'Kuala Lumpur',
      jb: 'Johor Bahru',
      pg: 'Penang',
      ipoh: 'Ipoh',
      melaka: 'Malacca',
      jkt: 'Jakarta',
    };

    return normalizations[p.toLowerCase()] || p;
  }

  async addMarker(longitude, latitude, label) {
    try {
      // Ensure graphics layer exists
      if (!this.graphicsLayer) {
        const GraphicsLayerModule = await import('@arcgis/core/layers/GraphicsLayer.js');
        const GraphicsLayer = GraphicsLayerModule.default || GraphicsLayerModule.GraphicsLayer;
        this.graphicsLayer = new GraphicsLayer({ title: 'Map Controller Graphics' });
        this.map.add(this.graphicsLayer);
      }

      const [GraphicModule, PointModule] = await Promise.all([
        import('@arcgis/core/Graphic.js'),
        import('@arcgis/core/geometry/Point.js'),
      ]);

      const Graphic = GraphicModule.default || GraphicModule.Graphic;
      const Point = PointModule.default || PointModule.Point;

      const point = new Point({
        longitude: longitude,
        latitude: latitude,
      });

      const marker = new Graphic({
        geometry: point,
        symbol: {
          type: 'simple-marker',
          color: [226, 119, 40],
          size: 12,
          outline: {
            color: [255, 255, 255],
            width: 2,
          },
        },
        attributes: {
          label: label,
        },
        popupTemplate: {
          title: label,
          content: `Coordinates: ${longitude.toFixed(6)}, ${latitude.toFixed(6)}`,
        },
      });

      this.graphicsLayer.add(marker);
      console.log(`Added marker for ${label}`);
    } catch (error) {
      console.error('Failed to add marker:', error);
    }
  }
}
