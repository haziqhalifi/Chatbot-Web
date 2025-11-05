#!/bin/bash
echo "Generating PlantUML diagrams..."
echo

# Check if PlantUML jar exists
if [ ! -f "plantuml.jar" ]; then
    echo "PlantUML jar not found. Please download it from http://plantuml.com/download"
    echo "Place plantuml.jar in the diagrams directory"
    echo
    echo "Alternatively, you can use the online editor at http://www.plantuml.com/plantuml/"
    exit 1
fi

# Generate all diagrams
echo "Generating PNG diagrams..."
java -jar plantuml.jar -tpng *.puml

# Generate SVG diagrams
echo "Generating SVG diagrams..."
java -jar plantuml.jar -tsvg *.puml

echo
echo "All diagrams generated successfully!"
echo "PNG files for documentation"
echo "SVG files for scalable graphics"
echo
