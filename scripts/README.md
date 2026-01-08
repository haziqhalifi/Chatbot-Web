# Scripts Directory

This folder contains utility scripts for building, testing, and maintaining the DisasterWatch application.

## 📜 Available Scripts

### Setup Scripts

- **`setup_openai.bat`** - Configure OpenAI API key for Windows

### Test Scripts

- **`run_integration_tests.bat`** - Run integration tests (Windows)
- **`run_integration_tests.sh`** - Run integration tests (Linux/Mac)

### Documentation Scripts

- **`generate_diagrams.bat`** - Generate PlantUML diagrams (Windows)
- **`generate_diagrams.sh`** - Generate PlantUML diagrams (Linux/Mac)

## 🚀 Usage

### Running Integration Tests

**Windows:**

```bash
.\scripts\run_integration_tests.bat
```

**Linux/Mac:**

```bash
chmod +x ./scripts/run_integration_tests.sh
./scripts/run_integration_tests.sh
```

### Generating Diagrams

**Windows:**

```bash
.\scripts\generate_diagrams.bat
```

**Linux/Mac:**

```bash
chmod +x ./scripts/generate_diagrams.sh
./scripts/generate_diagrams.sh
```

## 📝 Notes

- Scripts assume you're running from the repository root
- Ensure required dependencies are installed before running scripts
- Check script output for any errors or warnings

## 🔧 Customization

Feel free to modify these scripts for your development workflow. Consider adding:

- Database migration scripts
- Deployment automation
- Code quality checks
- Performance testing
- Data seeding scripts

---

For more information, see the [main documentation](../docs/).
