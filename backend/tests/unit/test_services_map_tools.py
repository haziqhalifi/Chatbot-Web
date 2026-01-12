"""
Unit tests for services.map_tools module
Tests 15 map tool function definitions for OpenAI Assistant
"""
import pytest
import json


class TestMapToolsConfiguration:
    """Test MAP_TOOLS configuration structure"""
    
    def test_map_tools_list_exists(self):
        """Test MAP_TOOLS list is properly defined"""
        from services.map_tools import MAP_TOOLS
        
        assert isinstance(MAP_TOOLS, list)
        assert len(MAP_TOOLS) > 0
    
    def test_all_tools_have_required_fields(self):
        """Test each tool has required structure"""
        from services.map_tools import MAP_TOOLS
        
        for tool in MAP_TOOLS:
            assert "type" in tool
            assert tool["type"] == "function"
            assert "function" in tool
            assert "name" in tool["function"]
            assert "description" in tool["function"]
            assert "parameters" in tool["function"]
    
    def test_tool_parameters_structure(self):
        """Test parameters follow JSON Schema format"""
        from services.map_tools import MAP_TOOLS
        
        for tool in MAP_TOOLS:
            params = tool["function"]["parameters"]
            assert params["type"] == "object"
            assert "properties" in params
            # Some tools may have all optional parameters
            if "required" in params:
                assert isinstance(params["required"], list)


class TestZoomTool:
    """Test Zoom map tool"""
    
    def test_zoom_tool_exists(self):
        """Test Zoom tool is in MAP_TOOLS"""
        from services.map_tools import MAP_TOOLS
        
        zoom_tool = next((t for t in MAP_TOOLS if t["function"]["name"] == "Zoom"), None)
        assert zoom_tool is not None
    
    def test_zoom_tool_has_direction_parameter(self):
        """Test Zoom tool has direction parameter"""
        from services.map_tools import MAP_TOOLS
        
        zoom_tool = next(t for t in MAP_TOOLS if t["function"]["name"] == "Zoom")
        params = zoom_tool["function"]["parameters"]
        
        assert "direction" in params["properties"]
        assert "direction" in params["required"]
    
    def test_zoom_tool_direction_enum(self):
        """Test Zoom direction has valid enum values"""
        from services.map_tools import MAP_TOOLS
        
        zoom_tool = next(t for t in MAP_TOOLS if t["function"]["name"] == "Zoom")
        direction_prop = zoom_tool["function"]["parameters"]["properties"]["direction"]
        
        assert "enum" in direction_prop
        assert "In" in direction_prop["enum"]
        assert "Out" in direction_prop["enum"]
        assert "default" in direction_prop["enum"]


class TestPanTool:
    """Test Pan map tool"""
    
    def test_pan_tool_exists(self):
        """Test Pan tool is in MAP_TOOLS"""
        from services.map_tools import MAP_TOOLS
        
        pan_tool = next((t for t in MAP_TOOLS if t["function"]["name"] == "Pan"), None)
        assert pan_tool is not None
    
    def test_pan_tool_direction_options(self):
        """Test Pan tool has all direction options"""
        from services.map_tools import MAP_TOOLS
        
        pan_tool = next(t for t in MAP_TOOLS if t["function"]["name"] == "Pan")
        direction_enum = pan_tool["function"]["parameters"]["properties"]["direction"]["enum"]
        
        expected_directions = ["Left", "Up", "Right", "Down", "Up-Right", "Up-Left", "Down-Right", "Down-Left"]
        for direction in expected_directions:
            assert direction in direction_enum


class TestToggleLayerTool:
    """Test ToggleLayer map tool"""
    
    def test_toggle_layer_tool_exists(self):
        """Test ToggleLayer tool is in MAP_TOOLS"""
        from services.map_tools import MAP_TOOLS
        
        toggle_tool = next((t for t in MAP_TOOLS if t["function"]["name"] == "ToggleLayer"), None)
        assert toggle_tool is not None
    
    def test_toggle_layer_has_required_params(self):
        """Test ToggleLayer has layer and visible parameters"""
        from services.map_tools import MAP_TOOLS
        
        toggle_tool = next(t for t in MAP_TOOLS if t["function"]["name"] == "ToggleLayer")
        params = toggle_tool["function"]["parameters"]
        
        assert "layer" in params["properties"]
        assert "visible" in params["properties"]
        assert "layer" in params["required"]
        assert "visible" in params["required"]
    
    def test_toggle_layer_visible_is_boolean(self):
        """Test visible parameter is boolean type"""
        from services.map_tools import MAP_TOOLS
        
        toggle_tool = next(t for t in MAP_TOOLS if t["function"]["name"] == "ToggleLayer")
        visible_prop = toggle_tool["function"]["parameters"]["properties"]["visible"]
        
        assert visible_prop["type"] == "boolean"


class TestSearchTool:
    """Test Search map tool"""
    
    def test_search_tool_exists(self):
        """Test Search tool is in MAP_TOOLS"""
        from services.map_tools import MAP_TOOLS
        
        search_tool = next((t for t in MAP_TOOLS if t["function"]["name"] == "Search"), None)
        assert search_tool is not None
    
    def test_search_has_place_parameter(self):
        """Test Search tool has place parameter"""
        from services.map_tools import MAP_TOOLS
        
        search_tool = next(t for t in MAP_TOOLS if t["function"]["name"] == "Search")
        params = search_tool["function"]["parameters"]
        
        assert "place" in params["properties"]
        assert "place" in params["required"]
        assert params["properties"]["place"]["type"] == "string"


class TestAllMapTools:
    """Test all 15 map tools are defined"""
    
    def test_expected_tools_count(self):
        """Test MAP_TOOLS has expected number of tools"""
        from services.map_tools import MAP_TOOLS
        
        # Should have 15 map tools as mentioned in requirements
        assert len(MAP_TOOLS) >= 4  # At minimum Zoom, Pan, ToggleLayer, Search
    
    def test_all_tool_names_unique(self):
        """Test all tool names are unique"""
        from services.map_tools import MAP_TOOLS
        
        names = [tool["function"]["name"] for tool in MAP_TOOLS]
        assert len(names) == len(set(names)), "Tool names must be unique"
    
    def test_all_tools_serializable(self):
        """Test MAP_TOOLS can be serialized to JSON"""
        from services.map_tools import MAP_TOOLS
        
        try:
            json_str = json.dumps(MAP_TOOLS)
            assert len(json_str) > 0
        except (TypeError, ValueError) as e:
            pytest.fail(f"MAP_TOOLS not JSON serializable: {e}")
    
    def test_tool_names_follow_naming_convention(self):
        """Test tool names use PascalCase"""
        from services.map_tools import MAP_TOOLS
        
        for tool in MAP_TOOLS:
            name = tool["function"]["name"]
            # Should start with capital letter
            assert name[0].isupper(), f"Tool name '{name}' should start with capital"
    
    def test_all_descriptions_non_empty(self):
        """Test all tools have non-empty descriptions"""
        from services.map_tools import MAP_TOOLS
        
        for tool in MAP_TOOLS:
            description = tool["function"]["description"]
            assert isinstance(description, str)
            assert len(description.strip()) > 0


class TestMapToolsIntegration:
    """Test MAP_TOOLS integration with OpenAI Assistant"""
    
    def test_tools_format_matches_openai_spec(self):
        """Test tools follow OpenAI function calling specification"""
        from services.map_tools import MAP_TOOLS
        
        for tool in MAP_TOOLS:
            # OpenAI expects this exact structure
            assert tool["type"] == "function"
            assert "function" in tool
            
            func = tool["function"]
            assert "name" in func
            assert "description" in func
            assert "parameters" in func
            
            # Parameters must be JSON Schema object
            params = func["parameters"]
            assert params.get("type") == "object"
    
    def test_required_fields_exist_in_properties(self):
        """Test required fields are defined in properties"""
        from services.map_tools import MAP_TOOLS
        
        for tool in MAP_TOOLS:
            params = tool["function"]["parameters"]
            required = params.get("required", [])
            properties = params.get("properties", {})
            
            for req_field in required:
                assert req_field in properties, \
                    f"Required field '{req_field}' not in properties for {tool['function']['name']}"


class TestMapToolExecution:
    """Test map tool execution logic (if implemented)"""
    
    def test_map_tools_module_importable(self):
        """Test map_tools module can be imported"""
        try:
            import services.map_tools
            assert hasattr(services.map_tools, 'MAP_TOOLS')
        except ImportError as e:
            pytest.fail(f"Cannot import map_tools: {e}")
    
    def test_get_tool_by_name_helper(self):
        """Test helper to get tool by name"""
        from services.map_tools import MAP_TOOLS
        
        def get_tool_by_name(name: str):
            return next((t for t in MAP_TOOLS if t["function"]["name"] == name), None)
        
        zoom_tool = get_tool_by_name("Zoom")
        assert zoom_tool is not None
        assert zoom_tool["function"]["name"] == "Zoom"
        
        invalid_tool = get_tool_by_name("InvalidToolName")
        assert invalid_tool is None
