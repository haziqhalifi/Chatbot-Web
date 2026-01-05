# Map Integration with AI Assistant

## Overview

The chatbot now integrates with the ArcGIS map, allowing the AI assistant to control and interact with the map based on user requests.

## How It Works

### 1. **Backend: OpenAI Function Calling**

- **File**: `backend/services/map_tools.py`
- Defines 15 map control functions as OpenAI tools
- Functions include: Zoom, Pan, Search, ToggleLayer, IdentifyAll, DrawBuffer, etc.

### 2. **Backend: AI Response Processing**

- **File**: `backend/services/openai_assistant_service.py`
- Handles OpenAI Assistant API with function calling
- When the assistant wants to control the map, it calls tools
- The backend captures these tool calls as `map_commands`
- Returns both text response and map commands to frontend

### 3. **Frontend: Map Controller**

- **File**: `frontend/src/utils/mapController.js`
- Executes map commands received from the AI
- Implements all 15 map control functions
- Interacts directly with ArcGIS JavaScript API

### 4. **Frontend: Chat Integration**

- **File**: `frontend/src/hooks/useChat.js`
- Receives AI responses with map_commands
- Dispatches custom event when map commands are present

- **File**: `frontend/src/components/chat/ChatBox.jsx`
- Listens for map command events
- Executes commands via MapController

## Available Map Commands

### Navigation

- **Zoom(direction)**: `"In"`, `"Out"`, or `"default"`
- **Pan(direction)**: `"Left"`, `"Right"`, `"Up"`, `"Down"`, `"Up-Right"`, etc.

### Search & Identify

- **Search(place)**: Search and zoom to a location (e.g., "Kuala Lumpur")
- **IdentifyAll(longitude, latitude)**: Identify features at coordinates
- **IdentifyLayer(layer, longitude, latitude)**: Identify on specific layer

### Spatial Analysis

- **Find(longitude, latitude, radius_meter, layers)**: Find features within radius
- **FindNearest(longitude, latitude, layers)**: Find nearest features
- **FindNearestIn(place, layers)**: Find nearest features to a named place
- **DrawBuffer(result_label, radius_meter)**: Draw buffer around current center

### Layer Control

- **ToggleLayer(layer, visible)**: Show/hide layers
- **ToggleBasemap(basemap_id)**: Change basemap style

### Querying

- **Query(layer, query_string)**: SQL-like query on layer
- **QueryBuffer(buffer_label, query_string)**: Query within buffer

### Map State

- **DescribeMap(option)**: Get current map state (extent, zoom, layers)
- **Clear()**: Clear all graphics and selections

## Configuration

### OpenAI Assistant Setup

1. Go to [OpenAI Platform](https://platform.openai.com/assistants)
2. Select your Assistant (using ID from `.env`)
3. Update the **Instructions** field with your GIS system instruction
4. The assistant will automatically have access to map tools via function calling

### System Instruction

Your system instruction should tell the AI:

- When to use map commands
- How to interpret user requests
- What tools are available
- How to handle map status updates from user

Example instruction sections:

```
When the user asks to:
- "Show me Kuala Lumpur" → Call Search(place="Kuala Lumpur")
- "Zoom in" → Call Zoom(direction="In")
- "Find hospitals nearby" → Call FindNearestIn(place="Here", layers=["emergency-services"])
```

## Usage Examples

### User: "Show me Penang on the map"

**AI Response**:

- Text: "I'll show you Penang on the map."
- Map Command: `Search(place="Penang")`
- **Result**: Map zooms to Penang and adds a marker

### User: "Zoom in twice"

**AI Response**:

- Text: "Zooming in."
- Map Commands: `Zoom(direction="In")`, `Zoom(direction="In")`
- **Result**: Map zooms in 2 levels

### User: "Hide the emergency services layer"

**AI Response**:

- Text: "I've hidden the emergency services layer."
- Map Command: `ToggleLayer(layer="Emergency Services (Malaysia)", visible=false)`
- **Result**: Emergency services layer is hidden

### User: "Draw a 5km buffer around the current location"

**AI Response**:

- Text: "Drawing a 5km buffer."
- Map Command: `DrawBuffer(result_label="5km buffer", radius_meter=5000)`
- **Result**: Circle with 5km radius drawn on map

## Data Flow

```
User Types Message
    ↓
Frontend: ChatBox sends message
    ↓
Backend: OpenAI Assistant processes with tools
    ↓
OpenAI: Decides to call map functions
    ↓
Backend: Captures tool calls as map_commands
    ↓
Backend: Returns {response, map_commands}
    ↓
Frontend: useChat hook receives response
    ↓
Frontend: Dispatches mapCommand event
    ↓
Frontend: ChatBox executes commands via MapController
    ↓
Map View Updates
```

## Extending Map Functions

To add new map functions:

1. **Add tool definition** in `backend/services/map_tools.py`:

```python
{
    "type": "function",
    "function": {
        "name": "MyNewFunction",
        "description": "What it does",
        "parameters": {
            "type": "object",
            "properties": {
                "param1": {"type": "string", "description": "..."}
            },
            "required": ["param1"]
        }
    }
}
```

2. **Implement function** in `frontend/src/utils/mapController.js`:

```javascript
async executeCommand(functionName, args) {
    switch (functionName) {
        case 'MyNewFunction':
            return await this.myNewFunction(args.param1);
        // ... existing cases
    }
}

async myNewFunction(param1) {
    // Implementation
    return { result: "Success" };
}
```

3. **Update AI instructions** to tell the assistant when to use the new function

## Troubleshooting

### Map commands not executing

- Check browser console for errors
- Verify mapView is initialized: `mapControllerRef.current` should exist
- Check that OpenAI Assistant has tools enabled

### Map commands not being called

- Verify your system instruction mentions the available tools
- Check that OPENAI_ASSISTANT_ID is set correctly
- Review OpenAI Assistant configuration on platform

### Commands execute but nothing happens

- Check MapController implementation for the specific command
- Verify layer names match exactly
- Check ArcGIS JavaScript API console errors

## Testing

Test with these sample queries:

1. "Show me Kuala Lumpur"
2. "Zoom in on the map"
3. "What layers are visible?"
4. "Hide the boundaries layer"
5. "Find the nearest hospital to Penang"
6. "Draw a 10km buffer around the center"

## Notes

- Map commands execute **after** the AI's text response is displayed
- Multiple commands execute sequentially in order
- Failed commands are logged but don't stop subsequent commands
- Some advanced features (Find, Query) are placeholders for future implementation
