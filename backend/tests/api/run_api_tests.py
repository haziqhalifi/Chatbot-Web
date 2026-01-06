#!/usr/bin/env python3
"""
API Test Runner Script

This script provides various options for running the API test suite
with different configurations and reporting options.

Usage:
    python run_api_tests.py --help
    python run_api_tests.py --all              # Run all tests
    python run_api_tests.py --smoke            # Run smoke tests
    python run_api_tests.py --auth             # Run auth tests only
    python run_api_tests.py --coverage         # Run with coverage report
    python run_api_tests.py --failed           # Run only failed tests
"""

import subprocess
import sys
import argparse
from pathlib import Path


class APITestRunner:
    """Helper class to run API tests with various options"""

    def __init__(self):
        self.backend_root = Path(__file__).parent.parent.parent
        self.tests_dir = Path(__file__).parent

    def run_command(self, cmd):
        """Execute a command and return exit code"""
        print(f"\n{'='*70}")
        print(f"Running: {' '.join(cmd)}")
        print(f"{'='*70}\n")
        
        result = subprocess.run(cmd, cwd=str(self.backend_root))
        return result.returncode

    def run_all_tests(self, verbose=True, coverage=False):
        """Run all API tests"""
        cmd = ["python", "-m", "pytest", str(self.tests_dir)]
        if verbose:
            cmd.append("-v")
        if coverage:
            cmd.extend(["--cov=.", "--cov-report=html", "--cov-report=term-missing"])
        return self.run_command(cmd)

    def run_authentication_tests(self, verbose=True):
        """Run authentication tests only"""
        cmd = ["python", "-m", "pytest", 
               str(self.tests_dir / "test_auth_endpoints.py"),
               "-v" if verbose else ""]
        return self.run_command([c for c in cmd if c])

    def run_chat_tests(self, verbose=True):
        """Run chat endpoint tests only"""
        cmd = ["python", "-m", "pytest",
               str(self.tests_dir / "test_chat_endpoints.py"),
               "-v" if verbose else ""]
        return self.run_command([c for c in cmd if c])

    def run_notification_tests(self, verbose=True):
        """Run notification tests only"""
        cmd = ["python", "-m", "pytest",
               str(self.tests_dir / "test_notification_endpoints.py"),
               "-v" if verbose else ""]
        return self.run_command([c for c in cmd if c])

    def run_admin_tests(self, verbose=True):
        """Run admin endpoint tests only"""
        cmd = ["python", "-m", "pytest",
               str(self.tests_dir / "test_admin_endpoints.py"),
               "-v" if verbose else ""]
        return self.run_command([c for c in cmd if c])

    def run_smoke_tests(self, verbose=True):
        """Run smoke tests (basic endpoint availability)"""
        cmd = ["python", "-m", "pytest", str(self.tests_dir),
               "-m", "smoke", "-v" if verbose else ""]
        return self.run_command([c for c in cmd if c])

    def run_security_tests(self, verbose=True):
        """Run security-focused tests"""
        cmd = ["python", "-m", "pytest", str(self.tests_dir),
               "-m", "security", "-v" if verbose else ""]
        return self.run_command([c for c in cmd if c])

    def run_failed_tests(self, verbose=True):
        """Re-run only failed tests"""
        cmd = ["python", "-m", "pytest", str(self.tests_dir),
               "--lf", "-v" if verbose else ""]
        return self.run_command([c for c in cmd if c])

    def run_with_output(self, verbose=True):
        """Run tests with full output"""
        cmd = ["python", "-m", "pytest", str(self.tests_dir),
               "-v", "-s"]
        return self.run_command(cmd)

    def run_parallel(self, verbose=True):
        """Run tests in parallel (requires pytest-xdist)"""
        cmd = ["python", "-m", "pytest", str(self.tests_dir),
               "-n", "auto", "-v" if verbose else ""]
        return self.run_command([c for c in cmd if c])

    def run_specific_test(self, test_path, verbose=True):
        """Run a specific test file or test"""
        cmd = ["python", "-m", "pytest", test_path,
               "-v" if verbose else ""]
        return self.run_command([c for c in cmd if c])

    def generate_html_report(self):
        """Generate HTML test report"""
        cmd = ["python", "-m", "pytest", str(self.tests_dir),
               "--html=tests/api/report.html",
               "--cov=.",
               "--cov-report=html"]
        return self.run_command(cmd)

    def list_tests(self):
        """List all available tests without running them"""
        cmd = ["python", "-m", "pytest", str(self.tests_dir),
               "--collect-only", "-q"]
        return self.run_command(cmd)

    def validate_setup(self):
        """Validate test environment setup"""
        print("\n" + "="*70)
        print("Validating Test Environment")
        print("="*70 + "\n")

        checks = {
            "Backend Root": self.backend_root.exists(),
            "Tests Directory": self.tests_dir.exists(),
            "conftest.py": (self.tests_dir / "conftest.py").exists(),
            "test_auth_endpoints.py": (self.tests_dir / "test_auth_endpoints.py").exists(),
            "test_chat_endpoints.py": (self.tests_dir / "test_chat_endpoints.py").exists(),
            "test_notification_endpoints.py": (self.tests_dir / "test_notification_endpoints.py").exists(),
            "test_admin_endpoints.py": (self.tests_dir / "test_admin_endpoints.py").exists(),
        }

        all_ok = True
        for check, result in checks.items():
            status = "✓" if result else "✗"
            print(f"{status} {check}: {result}")
            if not result:
                all_ok = False

        print("\n" + "="*70)
        if all_ok:
            print("✓ All checks passed! Ready to run tests.")
        else:
            print("✗ Some checks failed. Please verify file structure.")
        print("="*70 + "\n")

        return all_ok


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="API Test Runner for Chatbot Web System",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run_api_tests.py --all              # Run all tests
  python run_api_tests.py --auth             # Run auth tests only
  python run_api_tests.py --coverage         # Run with coverage
  python run_api_tests.py --specific tests/api/test_auth_endpoints.py
  python run_api_tests.py --validate         # Validate setup
        """
    )

    parser.add_argument("--all", action="store_true", help="Run all API tests")
    parser.add_argument("--auth", action="store_true", help="Run authentication tests")
    parser.add_argument("--chat", action="store_true", help="Run chat endpoint tests")
    parser.add_argument("--notifications", action="store_true", help="Run notification tests")
    parser.add_argument("--admin", action="store_true", help="Run admin endpoint tests")
    parser.add_argument("--smoke", action="store_true", help="Run smoke tests")
    parser.add_argument("--security", action="store_true", help="Run security tests")
    parser.add_argument("--failed", action="store_true", help="Run only failed tests")
    parser.add_argument("--coverage", action="store_true", help="Generate coverage report")
    parser.add_argument("--output", action="store_true", help="Show full test output")
    parser.add_argument("--parallel", action="store_true", help="Run tests in parallel")
    parser.add_argument("--html", action="store_true", help="Generate HTML report")
    parser.add_argument("--list", action="store_true", help="List all tests")
    parser.add_argument("--validate", action="store_true", help="Validate test setup")
    parser.add_argument("--specific", metavar="PATH", help="Run specific test file/test")
    parser.add_argument("--quiet", action="store_true", help="Reduce output verbosity")

    args = parser.parse_args()

    runner = APITestRunner()
    exit_code = 0

    # Validation
    if args.validate:
        if not runner.validate_setup():
            return 1

    # List tests
    if args.list:
        return runner.list_tests()

    # Run tests
    if args.specific:
        exit_code = runner.run_specific_test(args.specific, verbose=not args.quiet)
    elif args.auth:
        exit_code = runner.run_authentication_tests(verbose=not args.quiet)
    elif args.chat:
        exit_code = runner.run_chat_tests(verbose=not args.quiet)
    elif args.notifications:
        exit_code = runner.run_notification_tests(verbose=not args.quiet)
    elif args.admin:
        exit_code = runner.run_admin_tests(verbose=not args.quiet)
    elif args.smoke:
        exit_code = runner.run_smoke_tests(verbose=not args.quiet)
    elif args.security:
        exit_code = runner.run_security_tests(verbose=not args.quiet)
    elif args.failed:
        exit_code = runner.run_failed_tests(verbose=not args.quiet)
    elif args.output:
        exit_code = runner.run_with_output()
    elif args.parallel:
        exit_code = runner.run_parallel(verbose=not args.quiet)
    elif args.html:
        exit_code = runner.generate_html_report()
    elif args.coverage:
        exit_code = runner.run_all_tests(verbose=not args.quiet, coverage=True)
    else:
        # Default: run all tests
        exit_code = runner.run_all_tests(verbose=not args.quiet, coverage=args.coverage)

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
