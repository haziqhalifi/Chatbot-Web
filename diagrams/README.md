# PlantUML Activity Diagrams for Chatbot Web Project

This directory contains focused activity diagrams for the Chatbot Web project, created using PlantUML. Each diagram illustrates key user interactions and system flows, focusing on core functional requirements.

## Diagrams Overview

### 1. User Login and Authentication Flow (`01_user_authentication.puml`)

**Covers FR1-FR5**

- Core user authentication process
- System credential validation
- JWT token generation and dashboard access
- Essential for accessing all system modules

### 2. Chatbot Interaction (Text/Voice) (`02_chatbot_interaction.puml`)

**Covers FR10-FR17**

- Central AI interaction flow with text and voice input
- Parallel processing for voice-to-text conversion
- Query classification (spatial vs non-spatial)
- Integration with OpenAI and Map modules
- Chat history storage and export options

### 3. Incident Reporting Process (`03_incident_reporting.puml`)

**Covers FR18-FR24**

- Dual-flow diagram showing user and admin perspectives
- User: Form submission and confirmation
- Admin: Report review, status updates, and notifications
- High-impact feature for public users and administrators

### 4. Notification Handling (`04_notification_handling.puml`)

**Covers FR25-FR31**

- Real-time alert system
- Multi-channel notification delivery (push, email, in-app)
- User interaction with notifications
- Preference management and customization

### 5. Map and GIS Query Display (`05_map_gis_query.puml`)

**Covers FR32-FR36**

- Spatial data visualization triggered by chatbot
- Interactive map features (zoom, layer selection)
- GIS query processing and insights display
- User interaction with map features

### 6. Subscription and Alert Management (`06_subscription_alert_management.puml`)

**Covers FR41-FR45**

- User subscription to location-based alerts
- Alert filtering and targeted notification delivery
- Subscription management (add, modify, remove)
- Personalized alert system

### 7. Admin Dashboard Overview (`07_admin_dashboard.puml`)

**Covers FR46-FR49**

- Comprehensive admin access to all system modules
- User management, report handling, FAQ administration
- Data export capabilities and system monitoring
- System logs and performance review

## How to Use These Diagrams

### Prerequisites

- Install PlantUML: http://plantuml.com/download
- Or use online PlantUML editor: http://www.plantuml.com/plantuml/

### Generating Images

1. **Command Line** (with PlantUML jar):

   ```bash
   java -jar plantuml.jar *.puml
   ```

2. **Online Editor**:

   - Copy the content of any `.puml` file
   - Paste into http://www.plantuml.com/plantuml/
   - View and download the generated diagram

3. **VS Code Extension**:
   - Install "PlantUML" extension
   - Open any `.puml` file
   - Use `Alt+D` to preview the diagram

### Diagram Formats

PlantUML can generate diagrams in various formats:

- PNG (recommended for documentation)
- SVG (scalable vector graphics)
- PDF (for printing)
- LaTeX (for academic papers)

## Project Architecture Context

These diagrams are based on the following technology stack:

- **Backend**: FastAPI (Python 3.12+)
- **Frontend**: React with Vite
- **Database**: SQLite
- **AI Model**: qwen2.5:7b via Ollama
- **Authentication**: JWT tokens
- **RAG System**: Custom implementation with embeddings

## Contributing

When adding new features to the project:

1. Update the relevant activity diagram
2. Create new diagrams for complex new workflows
3. Keep diagrams in sync with actual implementation
4. Use consistent naming and styling

## Notes

- All diagrams use the `!theme plain` directive for consistent styling
- Error paths and edge cases are included in most diagrams
- Diagrams are ordered by typical user journey through the application
- Each diagram includes start/stop nodes for clarity
