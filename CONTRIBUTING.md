# 🤝 Contributing to VideoVault

Thank you for your interest in contributing to VideoVault! We welcome contributions from developers of all skill levels.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/videovault.git
   cd videovault
   ```
3. **Create a branch** for your feature:
   ```bash
   git checkout -b feature/amazing-feature
   ```
4. **Make your changes** and commit them
5. **Push to your fork** and submit a pull request

## 📝 Development Setup

### Prerequisites
- Python 3.9+
- Node.js 18+ (or Bun)
- FFmpeg
- Redis (optional for local development)

### Setup Instructions
```bash
# Install dependencies
bun install
cd backend && pip install -r requirements.txt

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env

# Start development servers
bun dev          # Frontend (Terminal 1)
cd backend && python main.py    # Backend (Terminal 2)
```

## 🎯 How to Contribute

### 🐛 Bug Reports
- Use the [Issues](../../issues) tab
- Include steps to reproduce
- Provide error logs and screenshots
- Specify your environment (OS, browser, versions)

### 💡 Feature Requests
- Check existing issues first
- Explain the use case
- Provide mockups or examples if possible
- Discuss implementation approach

### 🔧 Code Contributions

#### Types of Contributions We Welcome:
- **New platform support** (add support for more video sites)
- **UI/UX improvements** (better design, accessibility)
- **Performance optimizations** (faster downloads, better caching)
- **Bug fixes** (resolve existing issues)
- **Documentation** (improve README, add examples)
- **Testing** (add unit tests, integration tests)
- **DevOps** (improve Docker setup, CI/CD)

#### Before You Start:
1. **Check existing issues** - someone might already be working on it
2. **Create an issue** for new features to discuss approach
3. **Keep changes focused** - one feature per PR
4. **Follow our coding standards** (see below)

## 📋 Coding Standards

### Frontend (React/TypeScript)
```typescript
// Use functional components with hooks
const VideoDownloader: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  
  // Use TypeScript types
  const handleDownload = async (data: DownloadRequest): Promise<void> => {
    // Implementation
  };
  
  return (
    <div className="flex flex-col space-y-4">
      {/* Use Tailwind CSS classes */}
    </div>
  );
};
```

### Backend (FastAPI/Python)
```python
# Use type hints
from typing import Optional, List
from pydantic import BaseModel

class DownloadRequest(BaseModel):
    url: str
    format: str = "mp4"
    quality: Optional[str] = "720p"

# Use async/await for I/O operations
@app.post("/api/download")
async def download_video(request: DownloadRequest) -> DownloadResponse:
    """Download video from supported platform."""
    # Implementation
```

### Code Style
- **Frontend**: Use Prettier and ESLint (run `bun lint`)
- **Backend**: Use Black and isort (run `black . && isort .`)
- **Commit messages**: Follow [Conventional Commits](https://conventionalcommits.org/)
  ```
  feat: add support for YouTube Shorts
  fix: resolve download progress not updating
  docs: update installation instructions
  refactor: simplify video processing logic
  ```

## 🧪 Testing

### Running Tests
```bash
# Frontend tests
bun test

# Backend tests
cd backend
pytest

# E2E tests
bun test:e2e
```

### Writing Tests
- Add tests for new features
- Test both success and error cases
- Mock external API calls
- Keep tests fast and reliable

Example test:
```typescript
// frontend/src/lib/__tests__/api.test.ts
import { validateUrl } from '../api';

describe('API utilities', () => {
  it('should validate YouTube URLs', () => {
    expect(validateUrl('https://youtube.com/watch?v=abc123')).toBe(true);
    expect(validateUrl('invalid-url')).toBe(false);
  });
});
```

## 📚 Documentation

### Adding New Platform Support
When adding support for a new video platform:

1. **Update supported platforms list** in README.md
2. **Add platform-specific logic** in backend/main.py
3. **Update frontend validation** in src/lib/api.ts
4. **Add tests** for the new platform
5. **Update API documentation**

### Documentation Style
- Use clear, concise language
- Include code examples
- Add screenshots for UI changes
- Update both README.md and inline code comments

## 🔍 Pull Request Process

### Before Submitting
- [ ] Tests pass locally (`bun test` and `pytest`)
- [ ] Code follows our style guidelines
- [ ] Documentation is updated
- [ ] Commit messages follow conventional format
- [ ] No sensitive data (API keys, passwords) in commits

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Added/updated tests
- [ ] All tests pass
- [ ] Tested manually

## Screenshots (if applicable)
[Add screenshots for UI changes]

## Related Issues
Closes #123
```

### Review Process
1. **Automated checks** must pass (linting, tests)
2. **Maintainer review** - we'll provide feedback
3. **Address feedback** - make requested changes
4. **Final approval** - your PR gets merged!

## 🌟 Recognition

Contributors are recognized in:
- **README.md contributors section**
- **Release notes** for significant contributions
- **GitHub contributor graphs**

## 🎯 Priority Areas

We especially welcome contributions in these areas:

### High Priority
- **New platform support** (Discord, Pinterest, Snapchat)
- **Mobile app** (React Native)
- **Browser extension** (Chrome/Firefox)
- **Batch download UI** improvements

### Medium Priority
- **Accessibility** improvements (ARIA labels, keyboard navigation)
- **Internationalization** (multi-language support)
- **Advanced settings** (custom output formats, naming)
- **Download history** and favorites

### Low Priority
- **Themes and customization**
- **Analytics dashboard** for self-hosted instances
- **Plugin system** for custom processors

## 📞 Getting Help

### Communication Channels
- **GitHub Issues** - for bugs and feature requests
- **GitHub Discussions** - for questions and ideas
- **Code review comments** - for specific feedback

### Response Times
- **Issues**: We aim to respond within 48 hours
- **Pull Requests**: Initial review within 72 hours
- **Security issues**: Report privately, response within 24 hours

## 🏆 Contributor Levels

### First-time Contributors
- Look for `good first issue` labels
- Ask questions freely
- Small fixes are welcome (typos, documentation)

### Regular Contributors
- Can tackle more complex features
- Help review other contributors' PRs
- Suggest new directions for the project

### Core Contributors
- Have commit access
- Help maintain project direction
- Mentor new contributors

## 📋 Code of Conduct

We follow the [Contributor Covenant](CODE_OF_CONDUCT.md):

- **Be respectful** and inclusive
- **Focus on constructive feedback**
- **Help create a welcoming environment**
- **Report inappropriate behavior**

## 🙏 Thank You

Every contribution, no matter how small, helps make VideoVault better for everyone. Thank you for being part of our community!

---

**Ready to contribute? [Create your first issue](../../issues/new) or check out our [good first issues](../../issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22)!**