# ArcGIS Token Authentication Integration

## Overview

The ArcGIS map in your chatbot application has been updated to use token-based authentication, similar to your `index.html` implementation. This allows you to load secured WebMaps and access authenticated ArcGIS Online services.

## Changes Made

### 1. **Token Generation Function**

Added a function to generate ArcGIS tokens using your credentials:

```javascript
const generateArcGISToken = async () => {
  const params = new URLSearchParams({
    username: "kleos_dev",
    password: "Pass@1234",
    client: "referer",
    referer: window.location.origin,
    expiration: 120,
    f: "json",
  });
  // ... generates token from ArcGIS Online
};
```

### 2. **Token Interceptor Configuration**

The token is automatically attached to all ArcGIS Online requests using `esriConfig`:

```javascript
esriConfig.request.interceptors.push({
  urls: /arcgis\.com/,
  before: function (params) {
    params.requestOptions.query.token = token;
  },
});
```

### 3. **Secured WebMap Support**

You can now load secured WebMaps by setting `useSecuredWebMap = true`:

```javascript
const useSecuredWebMap = false; // Set to true to use secured WebMap
if (useSecuredWebMap && ArcGISWebMap && token) {
  map = new ArcGISWebMap({
    portalItem: {
      id: "9186757d793f4b0d87d58a65ae16c736", // Your WebMap ID
    },
  });
}
```

### 4. **Enhanced Widgets** (from index.html)

Added the following widgets to match your index.html implementation:

- **Zoom** - Zoom in/out controls
- **Home** - Return to initial extent
- **Compass** - Navigation compass
- **ScaleBar** - Metric scale bar
- **Search** - Location search functionality
- **Coordinate Display** - Shows longitude/latitude on mouse move

### 5. **Existing Widgets** (already implemented)

- **Bookmarks** - Malaysia city locations
- **BasemapGallery** - Change basemaps
- **LayerList** - Toggle layers
- **Legend** - Map legend

## How to Use

### Option 1: Use Basic Map (Current Default)

The application currently uses a basic map with custom layers. This is the default mode.

### Option 2: Use Secured WebMap

To use the secured WebMap from your `index.html`:

1. Open `frontend/src/components/dashboard/MapView.jsx`
2. Find line with `const useSecuredWebMap = false;`
3. Change it to `const useSecuredWebMap = true;`
4. Save the file

The map will now load your secured WebMap with ID `9186757d793f4b0d87d58a65ae16c736`.

## Security Notes

⚠️ **IMPORTANT**: The ArcGIS credentials are currently hardcoded in the frontend code. For production:

1. **Move credentials to backend**: Create a backend endpoint to generate tokens
2. **Use environment variables**: Store credentials in `.env` file
3. **Implement token refresh**: Tokens expire after 120 minutes

### Recommended Backend Implementation:

```python
# backend/routes/arcgis.py
@router.post("/arcgis/token")
async def generate_arcgis_token():
    params = {
        'username': os.getenv('ARCGIS_USERNAME'),
        'password': os.getenv('ARCGIS_PASSWORD'),
        'client': 'referer',
        'referer': request.headers.get('referer'),
        'expiration': 120,
        'f': 'json'
    }
    response = requests.post(
        'https://www.arcgis.com/sharing/rest/generateToken',
        data=params
    )
    return response.json()
```

## Testing

### Backend Server Status

✅ **Backend is running** on `http://localhost:8000`

The server started successfully with:

- Database connections initialized (5/5)
- RAG system loaded (285 documents)
- All endpoints active

### To Test the Map:

1. Make sure backend server is running (it is currently running)
2. Start the frontend: `cd frontend && npm run dev`
3. Navigate to the Dashboard
4. Open the chat interface
5. The map should load with all widgets visible

### Troubleshooting:

- If the map doesn't load, check browser console for errors
- Verify token generation in Network tab
- Ensure ArcGIS credentials are valid
- Check that WebMap ID `9186757d793f4b0d87d58a65ae16c736` is accessible

## Map Center & Zoom

The map initializes with:

- **Center**: Petaling, Malaysia `[101.58, 3.08]`
- **Zoom Level**: 11

This matches your `index.html` configuration.

## Next Steps

1. **Test the changes**: Reload your application and test the chatbot
2. **Enable WebMap** (optional): Set `useSecuredWebMap = true` if you want to use the secured WebMap
3. **Secure credentials**: Move token generation to backend
4. **Customize widgets**: Adjust widget positions/settings as needed

## Files Modified

- `frontend/src/components/dashboard/MapView.jsx`

## Original Issue Resolution

**Problem**: Chatbot not processing prompts
**Root Cause**: Backend server was not running due to missing `PyPDF2` module
**Solution**:

1. ✅ Installed `PyPDF2` module
2. ✅ Started backend server successfully
3. ✅ Enhanced map with token authentication

The chatbot should now work properly with all features functional!
