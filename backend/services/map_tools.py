"""
Map Tools Configuration for OpenAI Assistant
Defines the available map control functions that the AI assistant can call
"""

MAP_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "Zoom",
            "description": "Zoom the map in or out",
            "parameters": {
                "type": "object",
                "properties": {
                    "direction": {
                        "type": "string",
                        "enum": ["In", "Out", "default"],
                        "description": "Direction to zoom: In (zoom in), Out (zoom out), or default (reset to default zoom)"
                    }
                },
                "required": ["direction"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "Pan",
            "description": "Pan the map in a specific direction",
            "parameters": {
                "type": "object",
                "properties": {
                    "direction": {
                        "type": "string",
                        "enum": ["Left", "Up", "Right", "Down", "Up-Right", "Up-Left", "Down-Right", "Down-Left"],
                        "description": "Direction to pan the map"
                    }
                },
                "required": ["direction"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "ToggleLayer",
            "description": "Show or hide a map layer",
            "parameters": {
                "type": "object",
                "properties": {
                    "layer": {
                        "type": "string",
                        "description": "Name or ID of the layer to toggle"
                    },
                    "visible": {
                        "type": "boolean",
                        "description": "True to show the layer, false to hide it"
                    }
                },
                "required": ["layer", "visible"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "Search",
            "description": "Search for a place on the map and center the view on it",
            "parameters": {
                "type": "object",
                "properties": {
                    "place": {
                        "type": "string",
                        "description": "Name of the place to search for (e.g., 'Kuala Lumpur', 'Penang Bridge')"
                    }
                },
                "required": ["place"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "IdentifyAll",
            "description": "Identify features at a specific location across all visible layers",
            "parameters": {
                "type": "object",
                "properties": {
                    "longitude": {
                        "type": "number",
                        "description": "Longitude coordinate"
                    },
                    "latitude": {
                        "type": "number",
                        "description": "Latitude coordinate"
                    }
                },
                "required": ["longitude", "latitude"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "IdentifyLayer",
            "description": "Identify features at a specific location on a specific layer",
            "parameters": {
                "type": "object",
                "properties": {
                    "layer": {
                        "type": "string",
                        "description": "Name or ID of the layer to query"
                    },
                    "longitude": {
                        "type": "number",
                        "description": "Longitude coordinate"
                    },
                    "latitude": {
                        "type": "number",
                        "description": "Latitude coordinate"
                    }
                },
                "required": ["layer", "longitude", "latitude"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "Find",
            "description": "Find features within a radius of a point",
            "parameters": {
                "type": "object",
                "properties": {
                    "longitude": {
                        "type": "number",
                        "description": "Longitude of center point"
                    },
                    "latitude": {
                        "type": "number",
                        "description": "Latitude of center point"
                    },
                    "radius_meter": {
                        "type": "number",
                        "description": "Search radius in meters"
                    },
                    "layers": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of layer names to search in"
                    }
                },
                "required": ["longitude", "latitude", "radius_meter", "layers"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "FindNearest",
            "description": "Find the nearest features to a point",
            "parameters": {
                "type": "object",
                "properties": {
                    "longitude": {
                        "type": "number",
                        "description": "Longitude of the point"
                    },
                    "latitude": {
                        "type": "number",
                        "description": "Latitude of the point"
                    },
                    "layers": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of layer names to search in"
                    }
                },
                "required": ["longitude", "latitude", "layers"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "DescribeMap",
            "description": "Get a description of the current map state (extent, zoom, visible layers)",
            "parameters": {
                "type": "object",
                "properties": {
                    "option": {
                        "type": "string",
                        "description": "Optional parameter to specify what to describe",
                        "enum": ["extent", "layers", "zoom", "all"]
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "DrawBuffer",
            "description": "Draw a buffer (circle) around a point or feature",
            "parameters": {
                "type": "object",
                "properties": {
                    "result_label": {
                        "type": "string",
                        "description": "Label for the buffer result"
                    },
                    "radius_meter": {
                        "type": "number",
                        "description": "Buffer radius in meters"
                    }
                },
                "required": ["result_label", "radius_meter"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "ToggleBasemap",
            "description": "Change the basemap style",
            "parameters": {
                "type": "object",
                "properties": {
                    "basemap_id": {
                        "type": "string",
                        "enum": ["streets", "satellite", "hybrid", "topo", "gray", "dark-gray", "oceans", "terrain"],
                        "description": "ID of the basemap to switch to"
                    }
                },
                "required": ["basemap_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "FindNearestIn",
            "description": "Find the nearest features to a named place",
            "parameters": {
                "type": "object",
                "properties": {
                    "place": {
                        "type": "string",
                        "description": "Name of the place to search near"
                    },
                    "layers": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of layer names to search in"
                    }
                },
                "required": ["place", "layers"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "Query",
            "description": "Query a layer with SQL-like conditions",
            "parameters": {
                "type": "object",
                "properties": {
                    "layer": {
                        "type": "string",
                        "description": "Name or ID of the layer to query"
                    },
                    "query_string": {
                        "type": "string",
                        "description": "SQL-like query string (e.g., 'Population > 5000', 'Type = \"Hospital\"')"
                    }
                },
                "required": ["layer", "query_string"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "Clear",
            "description": "Clear all graphics, selections, and temporary results from the map",
            "parameters": {
                "type": "object",
                "properties": {}
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "QueryBuffer",
            "description": "Query features within a previously drawn buffer",
            "parameters": {
                "type": "object",
                "properties": {
                    "buffer_label": {
                        "type": "string",
                        "description": "Label of the buffer to query within"
                    },
                    "query_string": {
                        "type": "string",
                        "description": "SQL-like query string to filter features"
                    }
                },
                "required": ["buffer_label", "query_string"]
            }
        }
    }
]
