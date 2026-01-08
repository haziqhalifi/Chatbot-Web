@echo off
echo Generating PlantUML diagrams...
echo.

REM Check if PlantUML jar exists
if not exist "plantuml.jar" (
    echo PlantUML jar not found. Please download it from http://plantuml.com/download
    echo Place plantuml.jar in the diagrams directory
    echo.
    echo Alternatively, you can use the online editor at http://www.plantuml.com/plantuml/
    pause
    exit /b 1
)

REM Generate all diagrams
echo Generating PNG diagrams...
java -jar plantuml.jar -tpng *.puml

REM Generate SVG diagrams
echo Generating SVG diagrams...
java -jar plantuml.jar -tsvg *.puml

echo.
echo All diagrams generated successfully!
echo PNG files for documentation
echo SVG files for scalable graphics
echo.
pause
